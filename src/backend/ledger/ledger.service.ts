import { prisma } from '../db/prisma';
import { v4 as uuidv4 } from 'uuid';

export class LedgerEngine {
  /**
   * Posts a double-entry transaction to the ledger.
   * Ensures atomic updates and immutable records.
   */
  static async postTransaction({
    reference,
    description,
    debitAccountId,
    creditAccountId,
    amount,
    metadata = {}
  }: {
    reference: string;
    description: string;
    debitAccountId: string;
    creditAccountId: string;
    amount: bigint;
    metadata?: any;
  }) {
    if (amount <= 0n) {
      throw new Error('Ledger transaction amount must be greater than zero.');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create Immutable Journal Entry
      const journal = await tx.journalTransaction.create({
        data: {
          reference: reference || `tx_${uuidv4()}`,
          description,
          metadata,
          status: 'POSTED',
          postedAt: new Date(),
        }
      });

      // 2. Create Debit Entry
      await tx.ledgerEntry.create({
        data: {
          transactionId: journal.id,
          accountId: debitAccountId,
          type: 'DEBIT',
          amount,
        }
      });

      // 3. Create Credit Entry
      await tx.ledgerEntry.create({
        data: {
          transactionId: journal.id,
          accountId: creditAccountId,
          type: 'CREDIT',
          amount,
        }
      });

      // 4. Update Quick Reference Balances
      // Note: In an enterprise setting, balances might be aggregated differently,
      // but caching them like this is standard practice for performance.
      await tx.ledgerAccount.update({
        where: { id: debitAccountId },
        data: { balance: { decrement: amount } }
      });

      await tx.ledgerAccount.update({
        where: { id: creditAccountId },
        data: { balance: { increment: amount } }
      });

      return journal;
    });
  }

  /**
   * Retrieves the true calculated balance for an account by aggregating entries.
   */
  static async getCalculatedBalance(accountId: string): Promise<bigint> {
    const defaultAgg = { _sum: { amount: 0n } };

    const credits = await prisma.ledgerEntry.aggregate({
      where: { accountId, type: 'CREDIT' },
      _sum: { amount: true }
    });

    const debits = await prisma.ledgerEntry.aggregate({
      where: { accountId, type: 'DEBIT' },
      _sum: { amount: true }
    });

    const creditTotal = BigInt(credits._sum.amount?.toString() || '0');
    const debitTotal = BigInt(debits._sum.amount?.toString() || '0');

    return creditTotal - debitTotal; 
  }
}
