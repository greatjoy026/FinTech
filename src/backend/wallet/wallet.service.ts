import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db/prisma';
import { AccountingService } from '../financial/accounting.service';
import { FinancialDomainError } from '../financial/financial.errors';

const REF_RE = /^[A-Za-z0-9._:-]{8,128}$/;
const KEY_RE = /^[\x21-\x7E]{16,128}$/;

function assertAmount(amount: bigint) {
  if (amount <= 0n) throw new FinancialDomainError('INVALID_AMOUNT', 'Wallet amounts must be positive');
}

function assertKey(value: string) {
  if (!KEY_RE.test(value)) throw new FinancialDomainError('INVALID_IDEMPOTENCY_KEY', 'Invalid wallet idempotency key');
}

function assertReference(value: string) {
  if (!REF_RE.test(value)) throw new FinancialDomainError('INVALID_REFERENCE', 'Invalid wallet reference');
}

function requestHash(input: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(JSON.stringify(input, (_, value) => typeof value === 'bigint' ? value.toString() : value)).digest('hex');
}

async function walletMapping(tx: Prisma.TransactionClient, walletId: string) {
  const mapping = await tx.financialWalletAccount.findUnique({
    where: { walletId },
    include: { wallet: true, account: true },
  });
  if (!mapping) throw new FinancialDomainError('WALLET_ACCOUNT_MAPPING_MISSING', 'Wallet financial account mapping is required');
  if (mapping.wallet.currency !== mapping.account.currency) throw new FinancialDomainError('ACCOUNT_CURRENCY_MISMATCH', 'Wallet and financial account currencies do not match');
  if (mapping.account.status !== 'ACTIVE') throw new FinancialDomainError('ACCOUNT_DISABLED', 'Wallet financial account is disabled');
  if (mapping.account.type !== 'LIABILITY') throw new FinancialDomainError('INVALID_WALLET_ACCOUNT', 'Wallet financial accounts must be liability accounts');
  return mapping;
}

async function retrySerializable<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034' || attempt === 2) throw error;
    }
  }
  throw new Error('Wallet transaction retry limit reached');
}

export class WalletService {
  /**
   * Provision the one-to-one wallet -> authoritative financial account mapping.
   * Customer wallet accounts are liability accounts because wallet balances are
   * obligations owed by the platform to wallet holders.
   */
  static async mapFinancialAccount(walletId: string, financialAccountId: string) {
    return retrySerializable(() => prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
      const account = await tx.financialAccount.findUniqueOrThrow({ where: { id: financialAccountId } });
      if (account.type !== 'LIABILITY') throw new FinancialDomainError('INVALID_WALLET_ACCOUNT', 'Wallet financial accounts must be liability accounts');
      if (account.status !== 'ACTIVE') throw new FinancialDomainError('ACCOUNT_DISABLED', 'Financial account is disabled');
      if (account.currency !== wallet.currency) throw new FinancialDomainError('ACCOUNT_CURRENCY_MISMATCH', 'Wallet and financial account currencies do not match');

      const existing = await tx.financialWalletAccount.findUnique({ where: { walletId } });
      if (existing && existing.accountId !== financialAccountId) throw new FinancialDomainError('WALLET_ACCOUNT_ALREADY_MAPPED', 'Wallet is already mapped to a different financial account', 409);
      const accountOwner = await tx.financialWalletAccount.findUnique({ where: { accountId: financialAccountId } });
      if (accountOwner && accountOwner.walletId !== walletId) throw new FinancialDomainError('FINANCIAL_ACCOUNT_ALREADY_MAPPED', 'Financial account is already mapped to another wallet', 409);
      if (existing) return existing;
      return tx.financialWalletAccount.create({ data: { walletId, accountId: financialAccountId } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 }));
  }

  /**
   * Internal wallet transfer. The wallet balances and authoritative double-entry
   * journal are committed in one SERIALIZABLE transaction.
   */
  static async transfer(fromWalletId: string, toWalletId: string, amount: bigint, idempotencyKey: string, reference?: string) {
    assertAmount(amount);
    assertKey(idempotencyKey);
    const txRef = reference || `trf_${uuidv4()}`;
    assertReference(txRef);
    if (fromWalletId === toWalletId) throw new FinancialDomainError('INVALID_TRANSFER', 'Wallet cannot transfer to itself');
    const hash = requestHash({ fromWalletId, toWalletId, amount, idempotencyKey, reference: txRef });

    return retrySerializable(() => prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findFirst({ where: { reference: `${txRef}_OUT` } });
      if (existing) {
        if (existing.requestHash !== hash) throw new FinancialDomainError('IDEMPOTENCY_CONFLICT', 'Wallet reference was already used for a different request', 409);
        const receiverTx = await tx.walletTransaction.findUnique({ where: { reference: `${txRef}_IN` } });
        return { senderTx: existing, receiverTx };
      }

      const sender = await tx.wallet.findUniqueOrThrow({ where: { id: fromWalletId } });
      const receiver = await tx.wallet.findUniqueOrThrow({ where: { id: toWalletId } });
      if (sender.status !== 'ACTIVE' || receiver.status !== 'ACTIVE') throw new FinancialDomainError('WALLET_INACTIVE', 'Both wallets must be active');
      if (sender.currency !== receiver.currency) throw new FinancialDomainError('CURRENCY_MISMATCH', 'Wallet currencies must match');

      const senderMapping = await walletMapping(tx, sender.id);
      const receiverMapping = await walletMapping(tx, receiver.id);

      const senderAccountBalance = await AccountingService.getAccountBalanceInTransaction(tx, senderMapping.accountId, senderMapping.account.type);
      const receiverAccountBalance = await AccountingService.getAccountBalanceInTransaction(tx, receiverMapping.accountId, receiverMapping.account.type);
      if (senderAccountBalance !== sender.availableBalance + sender.reservedBalance) throw new FinancialDomainError('WALLET_ACCOUNT_DIVERGENCE', 'Wallet balance is out of sync with authoritative accounting');
      if (receiverAccountBalance !== receiver.availableBalance + receiver.reservedBalance) throw new FinancialDomainError('WALLET_ACCOUNT_DIVERGENCE', 'Wallet balance is out of sync with authoritative accounting');
      if (sender.availableBalance < amount) throw new FinancialDomainError('INSUFFICIENT_FUNDS', 'Insufficient available balance');

      await tx.wallet.update({ where: { id: sender.id }, data: { availableBalance: { decrement: amount } } });
      await tx.wallet.update({ where: { id: receiver.id }, data: { availableBalance: { increment: amount } } });

      const journal = await AccountingService.postJournalInTransaction(tx, {
        reference: txRef,
        idempotencyKey: `wallet-transfer:${idempotencyKey}`,
        description: `Wallet transfer ${txRef}`,
        source: 'WALLET_TRANSFER',
        currency: sender.currency,
        lines: [
          { accountId: senderMapping.accountId, direction: 'DEBIT', amount, description: `Transfer out ${fromWalletId}` },
          { accountId: receiverMapping.accountId, direction: 'CREDIT', amount, description: `Transfer in ${toWalletId}` },
        ],
        metadata: { walletTransfer: true, idempotencyKey },
      });

      const senderTx = await tx.walletTransaction.create({
        data: { walletId: sender.id, reference: `${txRef}_OUT`, type: 'TRANSFER_OUT', amount: -amount, status: 'COMPLETED', requestHash: hash, metadata: { journalId: journal.id } },
      });
      const receiverTx = await tx.walletTransaction.create({
        data: { walletId: receiver.id, reference: `${txRef}_IN`, type: 'TRANSFER_IN', amount, status: 'COMPLETED', requestHash: hash, metadata: { journalId: journal.id } },
      });
      return { senderTx, receiverTx, journalId: journal.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 }));
  }

  /** Reserve spendable wallet funds. This is a projection/hold operation and creates no money or journal entry. */
  static async createHold(walletId: string, amount: bigint, idempotencyKey: string, reason: string, destinationAccountId: string, reference?: string, expiresAt?: Date) {
    assertAmount(amount);
    assertKey(idempotencyKey);
    if (!reason.trim()) throw new FinancialDomainError('INVALID_HOLD', 'Hold reason is required');
    const holdRef = reference || `hold_${uuidv4()}`;
    assertReference(holdRef);

    return retrySerializable(() => prisma.$transaction(async (tx) => {
      const existing = await tx.financialHold.findUnique({ where: { idempotencyKey } });
      if (existing) {
        if (existing.amount !== amount || existing.sourceAccountId !== (await walletMapping(tx, walletId)).accountId || existing.destinationAccountId !== destinationAccountId) {
          throw new FinancialDomainError('IDEMPOTENCY_CONFLICT', 'Hold idempotency key was already used for a different request', 409);
        }
        return existing;
      }

      const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
      if (wallet.status !== 'ACTIVE') throw new FinancialDomainError('WALLET_INACTIVE', 'Wallet must be active');
      const mapping = await walletMapping(tx, walletId);
      const destination = await tx.financialAccount.findUnique({ where: { id: destinationAccountId }, select: { id: true, currency: true, status: true } });
      if (!destination || destination.status !== 'ACTIVE') throw new FinancialDomainError('ACCOUNT_NOT_FOUND', 'Destination financial account not found', 404);
      if (destination.currency !== wallet.currency) throw new FinancialDomainError('ACCOUNT_CURRENCY_MISMATCH', 'Hold destination currency does not match wallet currency');

      const updated = await tx.wallet.updateMany({ where: { id: walletId, status: 'ACTIVE', availableBalance: { gte: amount } }, data: { availableBalance: { decrement: amount }, reservedBalance: { increment: amount } } });
      if (updated.count !== 1) throw new FinancialDomainError('INSUFFICIENT_FUNDS', 'Insufficient available balance for hold');

      return tx.financialHold.create({ data: {
        reference: holdRef,
        sourceAccountId: mapping.accountId,
        destinationAccountId,
        amount,
        currency: wallet.currency,
        status: 'ACTIVE',
        idempotencyKey,
        reason,
        expiresAt,
      } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 }));
  }

  static async releaseHold(reference: string) {
    assertReference(reference);
    return retrySerializable(() => prisma.$transaction(async (tx) => {
      const hold = await tx.financialHold.findUnique({ where: { reference } });
      if (!hold) throw new FinancialDomainError('HOLD_NOT_FOUND', 'Financial hold not found', 404);
      if (hold.status !== 'ACTIVE') return hold;

      const mapping = await tx.financialWalletAccount.findUnique({ where: { accountId: hold.sourceAccountId } });
      if (!mapping) throw new FinancialDomainError('WALLET_ACCOUNT_MAPPING_MISSING', 'Wallet financial account mapping is required');
      await tx.wallet.update({ where: { id: mapping.walletId }, data: { availableBalance: { increment: hold.amount }, reservedBalance: { decrement: hold.amount } } });
      return tx.financialHold.update({ where: { id: hold.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 }));
  }

  /** Capture a hold into a real accounting transfer. Reserved funds become a posted debit/credit. */
  static async captureHold(reference: string) {
    assertReference(reference);
    return retrySerializable(() => prisma.$transaction(async (tx) => {
      const hold = await tx.financialHold.findUnique({ where: { reference } });
      if (!hold) throw new FinancialDomainError('HOLD_NOT_FOUND', 'Financial hold not found', 404);
      if (hold.status !== 'ACTIVE') return hold;

      const mapping = await tx.financialWalletAccount.findUnique({ where: { accountId: hold.sourceAccountId }, include: { wallet: true } });
      if (!mapping) throw new FinancialDomainError('WALLET_ACCOUNT_MAPPING_MISSING', 'Wallet financial account mapping is required');
      if (mapping.wallet.status !== 'ACTIVE') throw new FinancialDomainError('WALLET_INACTIVE', 'Wallet must be active');
      if (mapping.wallet.reservedBalance < hold.amount) throw new FinancialDomainError('WALLET_BALANCE_DIVERGENCE', 'Reserved balance is below the active hold amount');

      const journal = await AccountingService.postJournalInTransaction(tx, {
        reference: `capture_${reference}`,
        idempotencyKey: `hold-capture:${hold.idempotencyKey}`,
        description: `Capture wallet hold ${reference}`,
        source: 'WALLET_HOLD_CAPTURE',
        currency: hold.currency,
        lines: [
          { accountId: hold.sourceAccountId, direction: 'DEBIT', amount: hold.amount, description: `Capture ${reference}` },
          { accountId: hold.destinationAccountId, direction: 'CREDIT', amount: hold.amount, description: `Hold destination ${reference}` },
        ],
        metadata: { financialHoldId: hold.id },
      });

      await tx.wallet.update({ where: { id: mapping.walletId }, data: { reservedBalance: { decrement: hold.amount } } });
      await tx.walletTransaction.create({ data: { walletId: mapping.walletId, reference: `capture_${reference}`, type: 'HOLD_CAPTURE', amount: -hold.amount, status: 'COMPLETED', requestHash: requestHash({ reference, amount: hold.amount.toString() }), metadata: { journalId: journal.id, financialHoldId: hold.id } } });
      return tx.financialHold.update({ where: { id: hold.id }, data: { status: 'CAPTURED', capturedAt: new Date() } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 }));
  }

  static async reconcileWallet(walletId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId }, include: { financialAccountMapping: { include: { account: true } } } });
    if (!wallet) throw new FinancialDomainError('WALLET_NOT_FOUND', 'Wallet not found', 404);
    if (!wallet.financialAccountMapping) throw new FinancialDomainError('WALLET_ACCOUNT_MAPPING_MISSING', 'Wallet financial account mapping is required');
    const balance = await AccountingService.getAccountBalance(wallet.financialAccountMapping.accountId);
    const projected = wallet.availableBalance + wallet.reservedBalance;
    return {
      walletId,
      financialAccountId: wallet.financialAccountMapping.accountId,
      currency: wallet.currency,
      authoritativeAccountingBalance: balance.balance,
      projectedSettledBalance: projected,
      pendingBalance: wallet.pendingBalance,
      difference: projected - balance.balance,
      status: projected === balance.balance ? 'MATCHED' : 'DIVERGED',
    };
  }

  static async freezeWallet(walletId: string, reason: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: walletId }, data: { status: 'FROZEN' } });
      return tx.walletFreeze.create({ data: { walletId, reason, frozenBy: adminId } });
    });
  }

  static async unfreezeWallet(walletId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: walletId }, data: { status: 'ACTIVE' } });
      const freeze = await tx.walletFreeze.findFirst({ where: { walletId, unfrozenAt: null }, orderBy: { createdAt: 'desc' } });
      if (freeze) await tx.walletFreeze.update({ where: { id: freeze.id }, data: { unfrozenAt: new Date(), unfrozenBy: adminId } });
    });
  }
}
