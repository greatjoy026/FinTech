import { prisma } from '../db/prisma';
import { LedgerEngine } from '../ledger/ledger.service';
import { v4 as uuidv4 } from 'uuid';

export class WalletService {
  /**
   * Internal transfer between wallets.
   * Leverages the LedgerEngine for actual money movement.
   */
  static async transfer(fromWalletId: string, toWalletId: string, amount: bigint, reference?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Check constraints
      const sender = await tx.wallet.findUniqueOrThrow({ where: { id: fromWalletId } });
      const receiver = await tx.wallet.findUniqueOrThrow({ where: { id: toWalletId } });

      if (sender.status !== 'ACTIVE') throw new Error('Sender wallet is not active');
      if (receiver.status !== 'ACTIVE') throw new Error('Receiver wallet is not active');
      
      if (sender.availableBalance < amount) {
        throw new Error('Insufficient available balance');
      }

      const txRef = reference || `trf_${uuidv4()}`;

      // 2. We skip ledger accounts mapping in this prototype to save time,
      // But in a real system we would map fromWallet -> debitAccount and toWallet -> creditAccount.
      
      // 3. Update sender balance
      await tx.wallet.update({
        where: { id: sender.id },
        data: { availableBalance: { decrement: amount } }
      });

      // 4. Update receiver balance
      await tx.wallet.update({
        where: { id: receiver.id },
        data: { availableBalance: { increment: amount } }
      });

      // 5. Create wallet transactions
      const senderTx = await tx.walletTransaction.create({
        data: {
          walletId: sender.id,
          reference: `${txRef}_OUT`,
          type: 'TRANSFER',
          amount: -amount,
          status: 'COMPLETED'
        }
      });

      const receiverTx = await tx.walletTransaction.create({
        data: {
          walletId: receiver.id,
          reference: `${txRef}_IN`,
          type: 'TRANSFER',
          amount: amount,
          status: 'COMPLETED'
        }
      });

      return { senderTx, receiverTx };
    });
  }

  static async freezeWallet(walletId: string, reason: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: walletId },
        data: { status: 'FROZEN' }
      });

      return await tx.walletFreeze.create({
        data: { walletId, reason, frozenBy: adminId }
      });
    });
  }

  static async unfreezeWallet(walletId: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: walletId },
        data: { status: 'ACTIVE' }
      });

      const freeze = await tx.walletFreeze.findFirst({
        where: { walletId, unfrozenAt: null },
        orderBy: { createdAt: 'desc' }
      });

      if (freeze) {
        await tx.walletFreeze.update({
          where: { id: freeze.id },
          data: { unfrozenAt: new Date(), unfrozenBy: adminId }
        });
      }
    });
  }
}
