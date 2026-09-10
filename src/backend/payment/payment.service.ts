import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { PaymentDomainError } from './payment.errors';
import { assertTransition, type PaymentStatus } from './payment.state';
import type { PaymentProviderAdapter } from './payment.provider';

const CURRENCY_RE = /^[A-Z]{3}$/;
const REF_RE = /^[A-Za-z0-9._:-]{8,128}$/;
const KEY_RE = /^[\x21-\x7E]{16,128}$/;
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v)).digest('hex');

function validate(amount: bigint, currency: string, reference: string, key: string) {
  if (amount <= 0n) throw new PaymentDomainError('INVALID_AMOUNT', 'Payment amount must be positive');
  if (!CURRENCY_RE.test(currency)) throw new PaymentDomainError('INVALID_CURRENCY', 'Payment currency must be an ISO-4217 uppercase code');
  if (!REF_RE.test(reference)) throw new PaymentDomainError('INVALID_REFERENCE', 'Invalid payment reference');
  if (!KEY_RE.test(key)) throw new PaymentDomainError('INVALID_IDEMPOTENCY_KEY', 'Invalid payment idempotency key');
}

export class PaymentService {
  static async createIntent(input: { ownerUserId: string; amount: bigint; currency: string; idempotencyKey: string; reference?: string; walletId?: string; metadata?: Prisma.InputJsonValue; expiresAt?: Date }) {
    const reference = input.reference ?? `pay_${hash({ ownerUserId: input.ownerUserId, idempotencyKey: input.idempotencyKey }).slice(0, 40)}`;
    const currency = input.currency.toUpperCase();
    validate(input.amount, currency, reference, input.idempotencyKey);
    const requestHash = hash({ ownerUserId: input.ownerUserId, amount: input.amount, currency, walletId: input.walletId ?? null, reference, metadata: input.metadata ?? null });
    return prisma.$transaction(async tx => {
      const existing = await tx.paymentIntent.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) {
        if (existing.requestHash !== requestHash) throw new PaymentDomainError('IDEMPOTENCY_CONFLICT', 'Idempotency key was already used for a different payment', 409);
        return existing;
      }
      return tx.paymentIntent.create({ data: { reference, amount: input.amount, currency, status: 'CREATED', provider: null, ownerUserId: input.ownerUserId, walletId: input.walletId, idempotencyKey: input.idempotencyKey, requestHash, metadata: input.metadata, expiresAt: input.expiresAt } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 });
  }

  static async getIntent(paymentId: string, ownerUserId: string) {
    const intent = await prisma.paymentIntent.findUnique({ where: { id: paymentId }, include: { transactions: { orderBy: { attemptNumber: 'desc' } } } });
    if (!intent) throw new PaymentDomainError('PAYMENT_NOT_FOUND', 'Payment not found', 404);
    if (intent.ownerUserId !== ownerUserId) throw new PaymentDomainError('PAYMENT_OWNERSHIP_DENIED', 'Payment access denied', 403);
    return intent;
  }

  static async cancel(paymentId: string, ownerUserId: string) {
    return prisma.$transaction(async tx => {
      const intent = await tx.paymentIntent.findUnique({ where: { id: paymentId } });
      if (!intent) throw new PaymentDomainError('PAYMENT_NOT_FOUND', 'Payment not found', 404);
      if (intent.ownerUserId !== ownerUserId) throw new PaymentDomainError('PAYMENT_OWNERSHIP_DENIED', 'Payment access denied', 403);
      if (['SUCCEEDED','FAILED','CANCELLED','EXPIRED'].includes(intent.status)) throw new PaymentDomainError('PAYMENT_TERMINAL', 'Payment is already terminal', 409);
      assertTransition(intent.status as PaymentStatus, 'CANCELLED');
      return tx.paymentIntent.update({ where: { id: paymentId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 });
  }

  static async process(paymentId: string, ownerUserId: string, adapter: PaymentProviderAdapter) {
    const intent = await this.getIntent(paymentId, ownerUserId);
    if (['SUCCEEDED','FAILED','CANCELLED','EXPIRED'].includes(intent.status)) throw new PaymentDomainError('PAYMENT_TERMINAL', 'Payment is already terminal', 409);
    const target: PaymentStatus = 'PROCESSING';
    assertTransition(intent.status as PaymentStatus, target);
    const processing = await prisma.paymentIntent.updateMany({ where: { id: paymentId, ownerUserId, status: intent.status }, data: { status: target } });
    if (processing.count !== 1) throw new PaymentDomainError('INVALID_TRANSITION', 'Payment changed concurrently; retry', 409);
    const attemptNumber = (await prisma.paymentTransaction.count({ where: { paymentIntentId: paymentId } })) + 1;
    const attemptKey = `payment-attempt:${intent.id}:${attemptNumber}`;
    await prisma.paymentTransaction.create({ data: { paymentIntentId: intent.id, reference: `${intent.reference}_attempt_${attemptNumber}`, attemptNumber, status: 'PROCESSING', amount: intent.amount, currency: intent.currency, provider: adapter.name, idempotencyKey: attemptKey, requestHash: intent.requestHash } });
    let result;
    try {
      result = await adapter.process({ paymentId: intent.id, reference: intent.reference, amount: intent.amount, currency: intent.currency, metadata: (intent.metadata ?? undefined) as Record<string, unknown> | undefined });
    } catch (error) {
      await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: 'FAILED', failedAt: new Date(), failureCode: 'PROVIDER_UNAVAILABLE', failureReason: error instanceof Error ? error.message.slice(0, 256) : 'Provider unavailable' } });
      await prisma.paymentTransaction.update({ where: { id: (await prisma.paymentTransaction.findFirstOrThrow({ where: { paymentIntentId: intent.id, attemptNumber } })).id }, data: { status: 'FAILED', failureCode: 'PROVIDER_UNAVAILABLE', failureReason: 'Payment provider unavailable' } });
      throw new PaymentDomainError('PAYMENT_PROVIDER_UNAVAILABLE', 'No payment provider is configured', 503);
    }
    await prisma.$transaction(async tx => {
      await tx.paymentTransaction.update({ where: { paymentIntentId_attemptNumber: { paymentIntentId: intent.id, attemptNumber } }, data: { status: result.status, providerRef: result.providerRef, failureCode: result.failureCode, failureReason: result.failureReason, processedAt: new Date() } });
      const terminal = result.status === 'SUCCEEDED' || result.status === 'FAILED';
      await tx.paymentIntent.update({ where: { id: intent.id }, data: { status: result.status, provider: adapter.name, providerRef: result.providerRef, failureCode: result.failureCode, failureReason: result.failureReason, succeededAt: result.status === 'SUCCEEDED' ? new Date() : undefined, failedAt: result.status === 'FAILED' ? new Date() : undefined } });
      if (terminal && result.status === 'SUCCEEDED') {
        // Accounting/wallet posting is intentionally a separate explicit settlement boundary.
        // CORE-004 never fabricates financial effects from provider status alone.
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 });
    return this.getIntent(paymentId, ownerUserId);
  }
}
