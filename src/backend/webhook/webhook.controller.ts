import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export const webhookController = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-monime-signature'];
    
    // In production, verify the webhook signature here to ensure it came from Monime
    // if (!verifySignature(req.body, signature, process.env.MONIME_WEBHOOK_SECRET)) {
    //   return res.status(401).send('Unauthorized');
    // }

    const payload = req.body;
    const eventType = payload.event;
    
    // 1. Persist exactly as received for auditing/retries
    const event = await prisma.webhookEvent.create({
      data: {
        provider: 'monime',
        eventType: eventType || 'UNKNOWN',
        payload: payload,
        status: 'PENDING'
      }
    });

    // 2. Dispatch to an asynchronous queue processor (e.g. BullMQ)
    // Here we'll simulate the processor handling
    setImmediate(async () => {
      try {
        if (eventType === 'payment.successful') {
          // Update the payment intent
          const intent = await prisma.paymentIntent.findUnique({
            where: { reference: payload.data.reference }
          });
          if (intent && intent.status !== 'SUCCESS') {
            await prisma.paymentIntent.update({
              where: { id: intent.id },
              data: { status: 'SUCCESS' }
            });
            
            // Queue ledger posting & wallet top-up logic here ...
          }
        }

        // Mark as processed
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { status: 'PROCESSED', processedAt: new Date() }
        });
      } catch (err: any) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { status: 'FAILED', error: err.message }
        });
      }
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
