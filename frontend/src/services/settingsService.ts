import { get } from './api';
import { ApiResponse } from '../types';

export interface PaymentGatewaySettings {
  paystack: {
    enabled: boolean;
    publicKey: string | null;
  };
}

// Get payment gateway settings
export const getPaymentGatewaySettings = async (): Promise<ApiResponse<PaymentGatewaySettings>> => {
  return await get<PaymentGatewaySettings>('/settings/payment-gateways');
};
