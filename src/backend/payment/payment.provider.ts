import type { PaymentStatus } from './payment.state';

export type PaymentProviderRequest = {
  paymentId: string;
  reference: string;
  amount: bigint;
  currency: string;
  metadata?: Record<string, unknown>;
};

export type PaymentProviderResult = {
  status: Extract<PaymentStatus, 'REQUIRES_ACTION'|'PENDING'|'PROCESSING'|'SUCCEEDED'|'FAILED'>;
  providerRef?: string;
  failureCode?: string;
  failureReason?: string;
};

/** Provider boundary only. No provider is registered by CORE-004. */
export interface PaymentProviderAdapter {
  readonly name: string;
  process(request: PaymentProviderRequest): Promise<PaymentProviderResult>;
}

export function unavailableProvider(): PaymentProviderAdapter {
  return {
    name: 'UNCONFIGURED',
    async process() {
      throw new Error('No payment provider adapter is configured');
    },
  };
}
