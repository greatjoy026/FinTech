import { Queue, Worker, QueueEvents } from 'bullmq';
import { RealtimeGateway } from '../realtime/socket.gateway';
import { prisma } from '../db/prisma';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD
};
const ENABLE_REDIS = process.env.ENABLE_REDIS === 'true';

export class QueueService {
  private static webhookQueue: Queue | null = null;
  private static payoutQueue: Queue | null = null;
  private static workers: Worker[] = [];
  private static queueEvents: QueueEvents[] = [];

  static initializeProcessors() {
    if (!ENABLE_REDIS) {
      console.warn('[Queue] Redis disabled; durable queues remain unavailable');
      return;
    }
    if (this.workers.length > 0) return;

    this.webhookQueue = new Queue('webhookProcessing', { connection });
    this.payoutQueue = new Queue('payoutProcessing', { connection });

    const webhookWorker = new Worker('webhookProcessing', async job => {
      const eventId = String(job.data.webhookEventId);
      const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
      if (!event) throw new Error(`Webhook event ${eventId} not found`);
      await prisma.webhookEvent.update({ where: { id: eventId }, data: { attempts: { increment: 1 } } });
      try {
        // Financial effects intentionally remain outside this reliability task.
        await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: 'PROCESSED', processedAt: new Date(), error: null } });
      } catch (error) {
        await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: 'FAILED', error: error instanceof Error ? error.message : String(error) } });
        throw error;
      }
    }, { connection });

    const payoutWorker = new Worker('payoutProcessing', async job => {
      console.warn(`[Queue] Payout job ${job.id} received; provider execution remains disabled until payment infrastructure is production-ready`);
      throw new Error('Payout processor is not enabled for real-money execution');
    }, { connection });
    this.workers = [webhookWorker, payoutWorker];

    const webhookEvents = new QueueEvents('webhookProcessing', { connection });
    webhookEvents.on('completed', ({ jobId }) => RealtimeGateway.broadcastAdminEvent('queue:job_completed', { queue: 'webhookProcessing', jobId }));
    webhookEvents.on('failed', ({ jobId, failedReason }) => RealtimeGateway.broadcastAdminEvent('queue:job_failed', { queue: 'webhookProcessing', jobId, reason: failedReason }));
    this.queueEvents = [webhookEvents];
  }

  static async enqueueWebhook(payload: { webhookEventId: string }) {
    if (!ENABLE_REDIS || !this.webhookQueue) throw new Error('Durable webhook queue is unavailable');
    return this.webhookQueue.add('process_webhook', payload, { jobId: payload.webhookEventId, attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 1000, removeOnFail: 5000 });
  }

  static async enqueuePayout(payload: any) {
    if (!ENABLE_REDIS || !this.payoutQueue) throw new Error('Durable payout queue is unavailable');
    return this.payoutQueue.add('execute_payout', payload, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  }

  static async shutdown(): Promise<void> {
    const workers = this.workers.splice(0);
    const events = this.queueEvents.splice(0);
    const queues = [this.webhookQueue, this.payoutQueue].filter((queue): queue is Queue => queue !== null);
    this.webhookQueue = null;
    this.payoutQueue = null;
    await Promise.all(workers.map(worker => worker.close()));
    await Promise.all(events.map(event => event.close()));
    await Promise.all(queues.map(queue => queue.close()));
  }
}
