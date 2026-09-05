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

  // Monime documents Monime-Signature as the webhook signature header.
  // The exact canonical signed-message encoding must be confirmed against
  // the provider's HMAC verification contract before this is production-approved.
  const supplied = String(req.headers['monime-signature'] ?? '').trim();
  if (!supplied) return false;

  const candidate = supplied.replace(/^sha256=/i, '').trim();
  if (!/^[a-f0-9]{64}$/i.test(candidate)) return false;

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const received = Buffer.from(candidate, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return crypto.timingSafeEqual(expectedBuffer, received);
}

export const webhookController = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid webhook signature' });

    const raw = rawPayload(req);
    if (!raw) return res.status(400).json({ error: 'Raw webhook body unavailable' });

    const payload = req.body as Record<string, any>;
    const event = payload.event && typeof payload.event === 'object' ? payload.event : {};
    const eventType = typeof event.name === 'string' ? event.name : 'UNKNOWN';
    const eventKey = typeof event.id === 'string'
      ? event.id
      : crypto.createHash('sha256').update(raw).digest('hex');
    const id = crypto.createHash('sha256').update(`monime:${eventKey}`).digest('hex');

    const existing = await prisma.webhookEvent.findUnique({ where: { id } });
    if (existing) {
      if (existing.status === 'PENDING') {
        await QueueService.enqueueWebhook({ webhookEventId: existing.id });
        return res.status(200).json({ received: true, duplicate: true, requeued: true });
      }
      return res.status(200).json({ received: true, duplicate: true });
    }

    const storedEvent = await prisma.webhookEvent.create({
      data: {
        id,
        provider: 'monime',
        eventType,
        payload,
        status: 'PENDING'
      }
    });
    await QueueService.enqueueWebhook({ webhookEventId: storedEvent.id });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook ingestion error:', error);
    return res.status(500).json({ error: 'Webhook ingestion failed' });
  }
};
