import { api } from './api';

interface TicketLineItem {
  type: string;
  quantity: number;
  unitPrice: number;
}

interface FoodLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface CreateCheckoutSessionRequest {
  eventId: number;
  eventTitle: string;
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  successUrl: string;
  cancelUrl: string;
  ticketDetails?: TicketLineItem[];
  foodDetails?: FoodLineItem[];
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface CheckoutSessionStatusResponse {
  status: string;
  paymentStatus: string;
  isSuccessful: boolean;
  customerEmail: string;
  amountTotal: number;
  paymentId?: string;
  eventTitle?: string;
}

export const createCheckoutSession = async (
  requestData: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> => {
  try {
    console.log('Creating checkout session with data:', JSON.stringify(requestData, null, 2));
    
    const response = await api.post<CreateCheckoutSessionResponse>(
      '/api/payment/create-checkout-session', 
      requestData
    );
    
    if (!response.data || !response.data.sessionId) {
      throw new Error('Invalid response from checkout service: missing sessionId');
    }

    console.log('Checkout session created successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }
};

export const verifyCheckoutSession = async (sessionId: string): Promise<CheckoutSessionStatusResponse> => {
  try {
    const response = await api.get<CheckoutSessionStatusResponse>(
      `/api/payment/verify-session/${sessionId}`
    );
    
    console.log('Checkout session verification result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    throw error;
  }
};
