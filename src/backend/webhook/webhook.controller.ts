import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { QueueService } from '../queue/queue.service';

function rawPayload(req: Request): Buffer | null {
  return (req as Request & { rawBody?: Buffer }).rawBody ?? null;
}

function verifySignature(req: Request): boolean {
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  const raw = rawPayload(req);
  if (!secret || !raw) return false;

  const supplied = String(req.headers['x-monime-signature'] ?? '').trim();
  if (!supplied) return false;

  const timestamp = String(req.headers['x-monime-timestamp'] ?? '').trim();
  if (timestamp) {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts * 1000) > 5 * 60 * 1000) return false;
  }

  // The provider contract must define whether the timestamp is part of the
  // signed message. Until that contract is confirmed, verify the documented
  // raw-body HMAC format rather than inventing a timestamp signing scheme.
  const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const candidate = supplied.replace(/^sha256=/i, '').trim();
  if (!/^[a-f0-9]{64}$/i.test(candidate)) return false;

  const expected = Buffer.from(digest, 'hex');
  const received = Buffer.from(candidate, 'hex');
  return crypto.timingSafeEqual(expected, received);
}

export const webhookController = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid webhook signature' });

    const raw = rawPayload(req);
    if (!raw) return res.status(400).json({ error: 'Raw webhook body unavailable' });

    const payload = req.body as Record<string, unknown>;
    const eventType = typeof payload.event === 'string' ? payload.event : 'UNKNOWN';
    const eventKey = String(payload.id ?? payload.eventId ?? crypto.createHash('sha256').update(raw).digest('hex'));
    const id = crypto.createHash('sha256').update(`monime:${eventKey}`).digest('hex');

    const existing = await prisma.webhookEvent.findUnique({ where: { id } });
    if (existing) {
      // A prior request may have persisted the event but failed before durable
      // enqueue. Retry the enqueue while the event remains pending.
      if (existing.status === 'PENDING') {
        await QueueService.enqueueWebhook({ webhookEventId: existing.id });
        return res.status(200).json({ received: true, duplicate: true, requeued: true });
      }
      return res.status(200).json({ received: true, duplicate: true });
    }

    const event = await prisma.webhookEvent.create({ data: { id, provider: 'monime', eventType, payload, status: 'PENDING' } });
    await QueueService.enqueueWebhook({ webhookEventId: event.id });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook ingestion error:', error);
    return res.status(500).json({ error: 'Webhook ingestion failed' });
  }
};
