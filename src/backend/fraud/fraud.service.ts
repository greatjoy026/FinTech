import { prisma } from '../db/prisma';
import { RealtimeGateway } from '../realtime/socket.gateway';
import { WalletService } from '../wallet/wallet.service';

export class FraudScoringEngine {
  /**
   * Main entry point to evaluate transaction risk dynamically.
   */
  static async evaluateTransaction({
    userId,
    walletId,
    amount,
    ipAddress,
    deviceFingerprint
  }: {
    userId: string;
    walletId: string;
    amount: bigint;
    ipAddress?: string;
    deviceFingerprint?: string;
  }) {
    let riskScore = 0;
    const triggers: string[] = [];

    // Rule 1: High value transaction
    if (amount > 10000000n) { // 10,000,000 minor units (~100,000 major)
      riskScore += 50;
      triggers.push('HIGH_VALUE_TX');
    }

    // Rule 2: Transaction Velocity (Too fast from same wallet)
    const recentTx = await prisma.walletTransaction.count({
      where: {
        walletId,
        createdAt: { gte: new Date(Date.now() - 5 * 60000) } // Last 5 mins
      }
    });

    if (recentTx > 10) {
      riskScore += 40;
      triggers.push('HIGH_VELOCITY');
    }

    // Assign risk tier
    let riskLevel = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      const alert = await prisma.fraudAlert.create({
        data: {
          userId,
          walletId,
          riskLevel,
          ruleTriggered: triggers.join(','),
          status: 'OPEN',
          metadata: { amount: amount.toString(), ipAddress, deviceFingerprint }
        }
      });

      RealtimeGateway.broadcastAdminEvent('fraud:alert', { alert });

      if (riskLevel === 'CRITICAL') {
        await WalletService.freezeWallet(walletId, 'Automated Fraud Freeze: Critical Risk', 'SYSTEM');
        RealtimeGateway.broadcastAdminEvent('wallet:frozen', { walletId, reason: 'Fraud' });
      }

      return { approved: false, alertId: alert.id, riskLevel };
    }

    return { approved: true, riskLevel };
  }
}
