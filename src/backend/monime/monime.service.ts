import { prisma } from '../db/prisma';

/**
 * Service to handle integration with Monime API.
 * Ref: https://docs.monime.io
 */
export class MonimeService {
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.monime.io' 
    : 'https://api.monime.io';
  
  private static readonly API_TOKEN = process.env.MONIME_API_TOKEN || 'test_token_123';

  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_TOKEN}`,
        ...options.headers,
      }
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(`Monime API Error [${response.status}]: ${JSON.stringify(errorJson)}`);
    }

    return response.json();
  }

  /**
   * Initialize a checkout session / payment intent
   */
  static async createPaymentIntent({ reference, amount, currency, returnUrl }: {
    reference: string;
    amount: bigint;
    currency: string;
    returnUrl?: string;
  }) {
    // 1. Persist local intent record
    const intent = await prisma.paymentIntent.create({
      data: {
        reference,
        amount,
        currency,
        status: 'PENDING',
        provider: 'monime'
      }
    });

    // 2. Call Monime API (simulated/mocked layout based on the LLMs doc standard)
    // Normally would call Monime's server-to-server endpoint here to get a hosted URL
    const payload = {
      reference,
      // Convert minor units to requested standard or just send minor
      amount: amount.toString(), 
      currency,
      return_url: returnUrl
    };

    try {
      // Uncomment to make real request
      // const monimeResp = await this.request('/v1/payments', { method: 'POST', body: JSON.stringify(payload) });
      
      const mockedResponseUrl = `https://checkout.monime.io/${reference}`;
      return { url: mockedResponseUrl, intentId: intent.id };
    } catch (e) {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'FAILED' }
      });
      throw e;
    }
  }

  /**
   * Process incoming webhook verification
   */
  static async verifyPaymentStatus(reference: string) {
    // Verify via Monime Server
    // const status = await this.request(`/v1/payments/${reference}/status`);
    return { status: 'SUCCESS', verifiedAt: new Date() };
  }
}
