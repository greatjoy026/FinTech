import { Router } from 'express';
import { authenticate, type AuthRequest } from '../auth/auth.middleware';
import { abuseRateLimit } from '../http/abuse-rate-limit';
import { PaymentDomainError } from './payment.errors';
import { PaymentService } from './payment.service';
import { unavailableProvider } from './payment.provider';

export const paymentRouter = Router();
paymentRouter.use(authenticate, abuseRateLimit({ scope: 'payments', limit: 60, windowSeconds: 60 }));

paymentRouter.post('/intents', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { amount, currency, idempotencyKey, reference, walletId, metadata, expiresAt } = req.body ?? {};
    const intent = await PaymentService.createIntent({ ownerUserId: req.user.userId, amount: BigInt(String(amount)), currency: String(currency), idempotencyKey: String(idempotencyKey), reference: reference ? String(reference) : undefined, walletId: walletId ? String(walletId) : undefined, metadata, expiresAt: expiresAt ? new Date(String(expiresAt)) : undefined });
    return res.status(201).json({ ...intent, amount: intent.amount.toString() });
  } catch (error) { return next(error); }
});

paymentRouter.get('/:paymentId', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const intent = await PaymentService.getIntent(req.params.paymentId, req.user.userId);
    return res.json({ ...intent, amount: intent.amount.toString(), transactions: intent.transactions.map(tx => ({ ...tx, amount: tx.amount.toString() })) });
  } catch (error) { return next(error); }
});

paymentRouter.post('/:paymentId/cancel', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const intent = await PaymentService.cancel(req.params.paymentId, req.user.userId);
    return res.json({ ...intent, amount: intent.amount.toString() });
  } catch (error) { return next(error); }
});

paymentRouter.post('/:paymentId/process', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const result = await PaymentService.process(req.params.paymentId, req.user.userId, unavailableProvider());
    return res.json({ ...result, amount: result.amount.toString() });
  } catch (error) {
    if (error instanceof PaymentDomainError && error.code === 'PAYMENT_PROVIDER_UNAVAILABLE') return res.status(503).json({ error: error.code, message: error.message });
    return next(error);
  }
});
