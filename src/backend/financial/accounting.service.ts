import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { FinancialDomainError } from './financial.errors';

export type JournalLineInput = {
  accountId: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: bigint;
  description?: string;
  metadata?: Prisma.InputJsonValue;
};

export type PostJournalInput = {
  reference: string;
  idempotencyKey: string;
  description: string;
  source: string;
  currency: string;
  lines: JournalLineInput[];
  metadata?: Prisma.InputJsonValue;
};

const CURRENCY_RE = /^[A-Z]{3}$/;
const KEY_RE = /^[\x21-\x7E]{16,128}$/;
const REF_RE = /^[A-Za-z0-9._:-]{8,128}$/;

function normalize(input: PostJournalInput) {
  if (!REF_RE.test(input.reference)) throw new FinancialDomainError('INVALID_REFERENCE', 'Invalid financial reference');
  if (!KEY_RE.test(input.idempotencyKey)) throw new FinancialDomainError('INVALID_IDEMPOTENCY_KEY', 'Invalid idempotency key');
  if (!CURRENCY_RE.test(input.currency.toUpperCase())) throw new FinancialDomainError('INVALID_CURRENCY', 'Invalid currency');
  if (!input.description.trim() || !input.source.trim()) throw new FinancialDomainError('INVALID_JOURNAL', 'Invalid journal metadata');
  if (input.lines.length < 2) throw new FinancialDomainError('INVALID_JOURNAL', 'A journal requires at least two lines');

  const lines = input.lines.map((line) => ({
    accountId: line.accountId,
    direction: line.direction,
    amount: line.amount,
    description: line.description,
    metadata: line.metadata,
  }));

  let debit = 0n;
  let credit = 0n;
  for (const line of lines) {
    if (!line.accountId || !['DEBIT', 'CREDIT'].includes(line.direction)) {
      throw new FinancialDomainError('INVALID_JOURNAL', 'Invalid journal line');
    }
    if (line.amount <= 0n) throw new FinancialDomainError('INVALID_AMOUNT', 'Financial amounts must be positive');
    if (line.direction === 'DEBIT') debit += line.amount;
    else credit += line.amount;
  }
  if (debit === 0n || debit !== credit) throw new FinancialDomainError('UNBALANCED_JOURNAL', 'Journal debits and credits must balance');

  return { ...input, currency: input.currency.toUpperCase(), lines, debit, credit };
}

function requestHash(input: ReturnType<typeof normalize>): string {
  const canonical = JSON.stringify({
    reference: input.reference,
    description: input.description,
    source: input.source,
    currency: input.currency,
    lines: input.lines.map((line) => ({
      accountId: line.accountId,
      direction: line.direction,
      amount: line.amount.toString(),
      description: line.description ?? null,
      metadata: line.metadata ?? null,
    })),
    metadata: input.metadata ?? null,
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function isRetryableSerialization(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}

async function postJournalInTransaction(tx: Prisma.TransactionClient, input: PostJournalInput) {
  const normalized = normalize(input);
  const hash = requestHash(normalized);
  const existing = await tx.financialJournal.findUnique({
    where: { idempotencyKey: normalized.idempotencyKey },
    include: { lines: true },
  });
  if (existing) {
    if (existing.requestHash !== hash) {
      throw new FinancialDomainError('IDEMPOTENCY_CONFLICT', 'Idempotency key was already used for a different financial request', 409);
    }
    return existing;
  }

  const accounts = await tx.financialAccount.findMany({
    where: { id: { in: normalized.lines.map((line) => line.accountId) } },
    select: { id: true, currency: true, status: true },
  });
  const byId = new Map(accounts.map((account) => [account.id, account]));
  for (const line of normalized.lines) {
    const account = byId.get(line.accountId);
    if (!account) throw new FinancialDomainError('ACCOUNT_NOT_FOUND', 'Financial account not found', 404);
    if (account.status !== 'ACTIVE') throw new FinancialDomainError('ACCOUNT_DISABLED', 'Financial account is disabled');
    if (account.currency !== normalized.currency) throw new FinancialDomainError('ACCOUNT_CURRENCY_MISMATCH', 'Financial account currency does not match journal currency');
  }

  const journal = await tx.financialJournal.create({
    data: {
      reference: normalized.reference,
      description: normalized.description,
      currency: normalized.currency,
      status: 'DRAFT',
      idempotencyKey: normalized.idempotencyKey,
      requestHash: hash,
      source: normalized.source,
      metadata: normalized.metadata,
      lines: {
        create: normalized.lines.map((line) => ({
          accountId: line.accountId,
          direction: line.direction,
          amount: line.amount,
          description: line.description,
          metadata: line.metadata,
        })),
      },
    },
    include: { lines: true },
  });

  return tx.financialJournal.update({
    where: { id: journal.id },
    data: { status: 'POSTED', postedAt: new Date() },
    include: { lines: true },
  });
}

export class AccountingService {
  static async postJournal(input: PostJournalInput) {
    normalize(input);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await prisma.$transaction((tx) => postJournalInTransaction(tx, input), {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        });
      } catch (error) {
        if (!isRetryableSerialization(error) || attempt === 2) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const normalized = normalize(input);
            const existing = await prisma.financialJournal.findUnique({ where: { idempotencyKey: normalized.idempotencyKey }, include: { lines: true } });
            if (existing && existing.requestHash === requestHash(normalized)) return existing;
            if (existing) throw new FinancialDomainError('IDEMPOTENCY_CONFLICT', 'Idempotency key was already used for a different financial request', 409);
          }
          throw error;
        }
      }
    }
    throw new Error('Financial transaction retry limit reached');
  }

  static async postJournalInTransaction(tx: Prisma.TransactionClient, input: PostJournalInput) {
    return postJournalInTransaction(tx, input);
  }

  static async getAccountBalance(accountId: string) {
    const account = await prisma.financialAccount.findUnique({ where: { id: accountId }, select: { id: true, type: true, currency: true, status: true } });
    if (!account) throw new FinancialDomainError('ACCOUNT_NOT_FOUND', 'Financial account not found', 404);

    const grouped = await prisma.financialJournalLine.groupBy({
      by: ['direction'],
      where: { accountId, journal: { status: 'POSTED' } },
      _sum: { amount: true },
    });
    const debit = grouped.find((row) => row.direction === 'DEBIT')?._sum.amount ?? 0n;
    const credit = grouped.find((row) => row.direction === 'CREDIT')?._sum.amount ?? 0n;
    const debitNormal = account.type === 'ASSET' || account.type === 'EXPENSE';
    return { accountId, currency: account.currency, debit, credit, balance: debitNormal ? debit - credit : credit - debit };
  }
}
