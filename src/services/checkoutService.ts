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
  seatTicketId?: string;  // Optional for backward compatibility
  seatTicketType?: string; // Optional for backward compatibility
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
  selectedSeats?: string[]; // Add this line
  userSessionId?: string; // Add session ID for seat validation
  useAfterPay?: boolean; // Add AfterPay option
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
  bookedSeats?: string[];
  customerName?: string;
  ticketReference?: string;
}

export const createCheckoutSession = async (
  requestData: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> => {
  try {
    console.log('Creating checkout session with data:', JSON.stringify(requestData, null, 2));
    
    // Log selected seats specifically if they exist
    if (requestData.selectedSeats && requestData.selectedSeats.length > 0) {
      console.log(`Including ${requestData.selectedSeats.length} selected seats: ${requestData.selectedSeats.join(', ')}`);
    }
    
    const response = await api.post<CreateCheckoutSessionResponse>(
      '/payment/create-checkout-session', 
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
      `/payment/verify-session/${sessionId}`
    );
    
    console.log('Checkout session verification result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    throw error;
  }
};

// ✅ NEW: Payment status polling for webhook-first architecture
export const checkPaymentProcessingStatus = async (sessionId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await api.get<PaymentStatusResponse>(
      `/payment/payment-status/${sessionId}`
    );
    
    console.log('Payment status check result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

// ✅ Enhanced verification with polling and progress callbacks
export const verifyPaymentWithPolling = async (
  sessionId: string, 
  onProgress?: (message: string, attempt: number) => void
): Promise<PaymentVerificationResult> => {
  const maxAttempts = 30; // 30 seconds max
  const pollInterval = 1000; // 1 second intervals
  
  console.log(`Starting payment verification polling for session: ${sessionId}`);
  onProgress?.('Starting payment verification...', 0);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      onProgress?.(`Checking payment status (${attempt + 1}/${maxAttempts})...`, attempt + 1);
      
      const status = await checkPaymentProcessingStatus(sessionId);
      
      if (status.isProcessed) {
        console.log(`Payment verified successfully on attempt ${attempt + 1}`);
        onProgress?.('Payment verified successfully!', attempt + 1);
        
        return {
          success: true,
          sessionData: status.bookingDetails,
          source: 'webhook',
          processingTime: attempt + 1
        };
      }
      
      // If not processed yet, wait and try again
      console.log(`Attempt ${attempt + 1}/${maxAttempts}: Payment still processing...`);
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
      
    } catch (error) {
      console.log(`Poll attempt ${attempt + 1} failed, retrying...`, error);
      onProgress?.(`Retry ${attempt + 1} failed, trying again...`, attempt + 1);
      
      // If we're on the last attempt, don't wait
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }
  
  // If polling fails, fallback to direct verification
  console.warn('Polling timeout reached, falling back to direct verification');
  onProgress?.('Using backup verification system...', maxAttempts);
  
  return await fallbackDirectVerification(sessionId);
};

// ✅ Fallback verification (only used if webhook fails)
const fallbackDirectVerification = async (sessionId: string): Promise<PaymentVerificationResult> => {
  try {
    console.log('Using fallback direct verification for session:', sessionId);
    const result = await verifyCheckoutSession(sessionId);
    
    return {
      success: result.isSuccessful,
      sessionData: result,
      source: 'fallback'
    };
  } catch (error) {
    console.error('Fallback verification failed:', error);
    return {
      success: false,
      error: 'Payment verification failed',
      source: 'fallback'
    };
  }
};

// ✅ Type definitions for the new polling system
interface PaymentStatusResponse {
  isProcessed: boolean;
  processedAt: string;
  bookingDetails?: BookingDetailsResponse;
  errorMessage?: string;
}

interface BookingDetailsResponse {
  eventTitle: string;
  customerName: string;
  customerEmail: string;
  bookedSeats: string[];
  amountTotal: number;
  paymentId: string;
  qrTicketsGenerated: QRGenerationResult[];
  ticketReference: string;
  bookingId: number;
}

interface QRGenerationResult {
  seatNumber: string;
  success: boolean;
  ticketPath?: string;
  bookingId?: string;
  errorMessage?: string;
}

interface PaymentVerificationResult {
  success: boolean;
  sessionData?: any;
  error?: string;
  source: 'webhook' | 'fallback';
  processingTime?: number;
}
