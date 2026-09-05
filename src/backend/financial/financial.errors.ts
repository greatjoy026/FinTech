export type FinancialErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY'
  | 'INVALID_REFERENCE'
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'INVALID_JOURNAL'
  | 'UNBALANCED_JOURNAL'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_CURRENCY_MISMATCH'
  | 'IDEMPOTENCY_CONFLICT'
  | 'JOURNAL_NOT_POSTABLE'
  | 'JOURNAL_NOT_FOUND';

export class FinancialDomainError extends Error {
  readonly code: FinancialErrorCode;
  readonly status: number;

  constructor(code: FinancialErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'FinancialDomainError';
    this.code = code;
    this.status = status;
  }
}
