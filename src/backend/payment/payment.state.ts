export const PAYMENT_STATUSES = ['CREATED','REQUIRES_ACTION','PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELLED','EXPIRED'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

const transitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  CREATED: ['REQUIRES_ACTION','PENDING','PROCESSING','CANCELLED','EXPIRED'],
  REQUIRES_ACTION: ['PENDING','PROCESSING','CANCELLED','EXPIRED'],
  PENDING: ['PROCESSING','CANCELLED','EXPIRED'],
  PROCESSING: ['SUCCEEDED','FAILED','CANCELLED','EXPIRED'],
  SUCCEEDED: [], FAILED: [], CANCELLED: [], EXPIRED: [],
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransition(from, to)) throw new Error(`Illegal payment transition: ${from} -> ${to}`);
}

export function isTerminal(status: PaymentStatus): boolean {
  return ['SUCCEEDED','FAILED','CANCELLED','EXPIRED'].includes(status);
}
