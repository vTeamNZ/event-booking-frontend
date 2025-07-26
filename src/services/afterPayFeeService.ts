import { api } from './api';

export interface AfterPayFeeSettings {
  enabled: boolean;
  percentage: number;
  fixedAmount: number;
  currency: string;
  description: string;
  currentConfigSource: string;
}

export interface AfterPayFeeCalculation {
  orderAmount: number;
  afterPayFeeAmount: number;
  totalAmount: number;
  afterPayFeeApplied: boolean;
  description: string;
  settings: AfterPayFeeSettings;
}

export interface CalculateAfterPayFeeRequest {
  amount: number;
}

export const afterPayFeeService = {
  // Get current AfterPay settings
  async getSettings(): Promise<AfterPayFeeSettings> {
    try {
      const response = await api.get<AfterPayFeeSettings>('/admin/afterpay-settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching AfterPay settings:', error);
      
      // Return default disabled settings if API fails
      return {
        enabled: false,
        percentage: 6.0,
        fixedAmount: 0.30,
        currency: 'NZD',
        description: 'AfterPay processing fee (currently unavailable)',
        currentConfigSource: 'fallback'
      };
    }
  },

  // Calculate AfterPay fee for a given amount
  async calculateFee(amount: number): Promise<AfterPayFeeCalculation> {
    try {
      const response = await api.post<AfterPayFeeCalculation>('/admin/calculate-afterpay-fee', { 
        amount 
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating AfterPay fee:', error);
      throw error;
    }
  },

  // Calculate AfterPay fee without admin authentication (for public use)
  calculateFeeLocally(amount: number, settings: AfterPayFeeSettings): AfterPayFeeCalculation {
    if (!settings.enabled || amount <= 0) {
      return {
        orderAmount: amount,
        afterPayFeeAmount: 0,
        totalAmount: amount,
        afterPayFeeApplied: false,
        description: settings.description,
        settings
      };
    }

    const percentageFee = amount * (settings.percentage / 100);
    const afterPayFeeAmount = Math.round((percentageFee + settings.fixedAmount) * 100) / 100;
    
    return {
      orderAmount: amount,
      afterPayFeeAmount,
      totalAmount: amount + afterPayFeeAmount,
      afterPayFeeApplied: true,
      description: settings.description,
      settings
    };
  }
};
