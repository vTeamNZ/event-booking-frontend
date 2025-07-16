import { api } from './api';

export interface ProcessingFeeCalculation {
  originalAmount: number;
  processingFeeAmount: number;
  totalAmount: number;
  processingFeePercentage: number;
  processingFeeFixedAmount: number;
  isProcessingFeeEnabled: boolean;
  description: string;
}

export const processingFeeService = {
  // Calculate processing fee for an event and amount
  calculateProcessingFee: async (eventId: number, amount: number): Promise<ProcessingFeeCalculation | null> => {
    try {
      const response = await api.get(`/Payment/processing-fee/${eventId}?amount=${amount}`);
      return response.data as ProcessingFeeCalculation;
    } catch (error) {
      console.error('Error calculating processing fee:', error);
      return null;
    }
  }
};
