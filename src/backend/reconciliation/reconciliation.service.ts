import { prisma } from '../db/prisma';
import { RealtimeGateway } from '../realtime/socket.gateway';

export class ReconciliationEngine {
  /**
   * Compares internal payment records with provider settlements.
   * Identifies discrepancies immediately.
   */
  static async reconcileSettlement(settlementRef: string, providerTotal: bigint) {
    const settlement = await prisma.settlement.findUnique({
      where: { reference: settlementRef }
    });

    if (!settlement) {
      throw new Error('Settlement reference not found');
    }

    // 1. Calculate internal total from confirmed payment intents for that cycle
    // (In reality this maps to local records grouped by settlement ID)
    const aggregated = await prisma.paymentIntent.aggregate({
      where: {
        status: 'SUCCESS',
        // Example filter:
        providerRef: settlementRef
      },
      _sum: { amount: true }
    });

    const internalTotal = aggregated._sum.amount || 0n;
    const variance = providerTotal - internalTotal;

    const newStatus = variance === 0n ? 'SETTLED' : 'MISMATCH';

    const updated = await prisma.settlement.update({
      where: { id: settlement.id },
      data: {
        status: newStatus,
        settledAt: new Date()
      }
    });

    if (newStatus === 'MISMATCH') {
      RealtimeGateway.broadcastAdminEvent('alert:reconciliation', {
        settlementRef,
        variance: variance.toString(),
        message: 'Settlement mismatch detected. Immediate investigation required.'
      });
    }

    return updated;
  }
}
