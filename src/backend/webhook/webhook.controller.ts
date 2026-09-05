import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { QueueService } from '../queue/queue.service';

function rawPayload(req: Request): Buffer {
  return (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
}

function verifySignature(req: Request): boolean {
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  if (!secret) return false;
  const supplied = String(req.headers['x-monime-signature'] ?? '').trim();
  if (!supplied) return false;
  const timestamp = String(req.headers['x-monime-timestamp'] ?? '').trim();
  if (timestamp) {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts * 1000) > 5 * 60 * 1000) return false;
  }
  const message = timestamp ? `${timestamp}.${rawPayload(req).toString('utf8')}` : rawPayload(req);
  const digest = crypto.createHmac('sha256', secret).update(message).digest();
  const candidate = supplied.replace(/^sha256=/i, '');
  const expectedHex = digest.toString('hex');
  const expectedBase64 = digest.toString('base64');
  const a = Buffer.from(candidate, candidate.length === expectedBase64.length ? 'base64' : 'hex');
  const b = Buffer.from(expectedHex, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const webhookController = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid webhook signature' });
    const payload = req.body as Record<string, any>;
    const eventType = typeof payload.event === 'string' ? payload.event : 'UNKNOWN';
    const eventKey = String(payload.id ?? payload.eventId ?? crypto.createHash('sha256').update(rawPayload(req)).digest('hex'));
    const id = crypto.createHash('sha256').update(`monime:${eventKey}`).digest('hex');

    const existing = await prisma.webhookEvent.findUnique({ where: { id } });
    if (existing) return res.status(200).json({ received: true, duplicate: true });

    const event = await prisma.webhookEvent.create({ data: { id, provider: 'monime', eventType, payload, status: 'PENDING' } });
    await QueueService.enqueueWebhook({ webhookEventId: event.id });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook ingestion error:', error);
    return res.status(500).json({ error: 'Webhook ingestion failed' });
  }
};
