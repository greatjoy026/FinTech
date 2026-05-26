import { Queue, Worker, QueueEvents } from 'bullmq';
import { RealtimeGateway } from '../realtime/socket.gateway';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
};

const ENABLE_REDIS = process.env.ENABLE_REDIS === 'true';

export class QueueService {
  private static webhookQueue: Queue | null = null;
  private static payoutQueue: Queue | null = null;

  static initializeProcessors() {
    if (!ENABLE_REDIS) {
      console.log('[Queue] Redis disabled, mocking processors');
      return;
    }

    this.webhookQueue = new Queue('webhookProcessing', { connection });
    this.payoutQueue = new Queue('payoutProcessing', { connection });

    // 1. Webhook Processor
    new Worker('webhookProcessing', async job => {
      console.log(`[Queue] Processing webhook ${job.id}`);
      // Simulate heavy lifting, posting ledger entries, Monime validation
      
      // If error thrown, BullMQ handles retry / dead-letter
    }, { connection });

    // 2. Payout Processor
    new Worker('payoutProcessing', async job => {
      console.log(`[Queue] Processing payout ${job.id}`);
      // Execute monime payout API
      // Transfer ledger funds to settlements
    }, { connection });

    // 3. Global Queue Events for Realtime Dashboard Sync
    const webhookEvents = new QueueEvents('webhookProcessing', { connection });
    webhookEvents.on('completed', ({ jobId }) => {
      RealtimeGateway.broadcastAdminEvent('queue:job_completed', { queue: 'webhookProcessing', jobId });
    });

    webhookEvents.on('failed', ({ jobId, failedReason }) => {
      RealtimeGateway.broadcastAdminEvent('queue:job_failed', { queue: 'webhookProcessing', jobId, reason: failedReason });
    });
  }

  static async enqueueWebhook(payload: any) {
    if (!ENABLE_REDIS || !this.webhookQueue) {
      console.log('[Queue] Mock enqueueWebhook', payload);
      return { id: `mock-${Date.now()}` };
    }
    return await this.webhookQueue.add('process_webhook', payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }

  static async enqueuePayout(payload: any) {
    if (!ENABLE_REDIS || !this.payoutQueue) {
      console.log('[Queue] Mock enqueuePayout', payload);
      return { id: `mock-${Date.now()}` };
    }
    return await this.payoutQueue.add('execute_payout', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });
  }
}
