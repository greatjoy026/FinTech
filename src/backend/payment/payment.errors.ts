export type PaymentErrorCode =
  | 'INVALID_AMOUNT' | 'INVALID_CURRENCY' | 'INVALID_REFERENCE' | 'INVALID_IDEMPOTENCY_KEY'
  | 'IDEMPOTENCY_CONFLICT' | 'PAYMENT_NOT_FOUND' | 'PAYMENT_TERMINAL' | 'INVALID_TRANSITION'
  | 'PAYMENT_OWNERSHIP_DENIED' | 'PAYMENT_PROVIDER_UNAVAILABLE' | 'PAYMENT_PROVIDER_REJECTED'
  | 'PAYMENT_CURRENCY_MISMATCH' | 'PAYMENT_AMOUNT_MISMATCH' | 'PAYMENT_ALREADY_COMPLETED';

export class PaymentDomainError extends Error {
  readonly code: PaymentErrorCode;
  readonly status: number;
  constructor(code: PaymentErrorCode, message: string, status = 400) {
    super(message); this.name = 'PaymentDomainError'; this.code = code; this.status = status;
  }
}
