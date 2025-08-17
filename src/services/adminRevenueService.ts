import { api } from './api';

// Types based on our DTOs
interface AdminRevenueFilter {
  startDate?: string;
  endDate?: string;
  organizerId?: number;
  eventId?: number;
  processingFeeEnabled?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

interface ProcessingFeeRevenueData {
  totalProcessingFeesCollected: number;
  totalBookingsWithFees: number;
  totalEventsWithFeesEnabled: number;
  averageProcessingFee: number;
  thisMonthFees: number;
  lastMonthFees: number;
  monthOverMonthGrowth: number;
  eventBreakdown: EventProcessingFeeData[];
  trendData: ProcessingFeeTrendData[];
  recommendations: FeeStructureRecommendationData;
}

interface EventProcessingFeeData {
  eventId: number;
  eventTitle: string;
  organizerName: string;
  organizerId: number;
  eventDate: string | null;
  processingFeeEnabled: boolean;
  processingFeePercentage: number;
  processingFeeFixedAmount: number;
  totalFeesCollected: number;
  bookingCount: number;
  bookingsWithFees: number;
  netEventRevenue: number;
  totalEventRevenue: number;
  averageOrderValue: number;
  feeConversionRate: number;
  lastBookingDate: string | null;
  eventStatus: string;
}

interface ProcessingFeeTrendData {
  date: string;
  dailyFeesCollected: number;
  bookingsWithFees: number;
  averageFeeAmount: number;
  eventsActive: number;
}

interface FeeStructureRecommendationData {
  feeStructurePerformance: FeeStructurePerformanceData[];
  optimalFeeStructure: RecommendationInsightData;
  recommendations: string[];
  platformAverageConversionRate: number;
}

interface FeeStructurePerformanceData {
  feePercentage: number;
  fixedAmount: number;
  eventsUsing: number;
  totalBookings: number;
  totalFeesCollected: number;
  averageOrderValue: number;
  conversionRate: number;
  revenuePerBooking: number;
  performanceRating: string;
}

interface RecommendationInsightData {
  recommendedPercentage: number;
  recommendedFixedAmount: number;
  reasoning: string;
  potentialAdditionalRevenue: number;
  estimatedConversionRate: number;
}

interface HistoricalAnalysisData {
  monthlyTrends: MonthlyRevenueData[];
  quarterlyTrends: QuarterlyRevenueData[];
  growthAnalysis: GrowthAnalysisData;
  seasonalityInsights: SeasonalityInsightData;
}

interface MonthlyRevenueData {
  year: number;
  month: number;
  monthName: string;
  processingFeesCollected: number;
  bookingsWithFees: number;
  activeEvents: number;
  growthPercentage: number;
}

interface QuarterlyRevenueData {
  year: number;
  quarter: number;
  processingFeesCollected: number;
  bookingsWithFees: number;
  growthPercentage: number;
}

interface GrowthAnalysisData {
  monthOverMonthGrowth: number;
  quarterOverQuarterGrowth: number;
  yearOverYearGrowth: number;
  growthTrend: string;
  growthFactors: string[];
}

interface SeasonalityInsightData {
  peakMonth: string;
  lowestMonth: string;
  seasonalityScore: number;
  seasonalPatterns: string[];
}

interface EventFeeConfigurationData {
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  organizerName: string;
  processingFeeEnabled: boolean;
  feePercentage: number;
  fixedFee: number;
  totalBookings: number;
  totalRevenue: number;
  totalProcessingFees: number;
  status: string;
  lastUpdated: string;
}

interface FeeStructureRecommendationData2 {
  currentFeePercentage: number;
  currentFixedFee: number;
  recommendedFeePercentage: number;
  recommendedFixedFee: number;
  projectedRevenueIncrease: number;
  reasoning: string;
  confidenceScore: number;
}

class AdminRevenueService {
  /**
   * Get processing fee summary with optional filtering
   */
  async getProcessingFeesSummary(filter?: AdminRevenueFilter): Promise<ProcessingFeeRevenueData> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.organizerId) params.append('organizerId', filter.organizerId.toString());
      if (filter?.eventId) params.append('eventId', filter.eventId.toString());
      if (filter?.processingFeeEnabled !== undefined) params.append('processingFeeEnabled', filter.processingFeeEnabled.toString());
      if (filter?.sortBy) params.append('sortBy', filter.sortBy);
      if (filter?.sortDirection) params.append('sortDirection', filter.sortDirection);

      const response = await api.get(`/admin/revenue/processing-fees-summary?${params.toString()}`);
      return response.data as ProcessingFeeRevenueData;
    } catch (error) {
      console.error('Error fetching processing fees summary:', error);
      throw error;
    }
  }

  /**
   * Get historical analysis data
   */
  async getHistoricalAnalysis(filter?: AdminRevenueFilter): Promise<HistoricalAnalysisData> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.organizerId) params.append('organizerId', filter.organizerId.toString());

      const response = await api.get(`/admin/revenue/historical-analysis?${params.toString()}`);
      return response.data as HistoricalAnalysisData;
    } catch (error) {
      console.error('Error fetching historical analysis:', error);
      throw error;
    }
  }

  /**
   * Get event fee configurations and recommendations
   */
  async getEventFeeConfiguration(filter?: AdminRevenueFilter): Promise<{
    eventConfigurations: EventFeeConfigurationData[];
    feeRecommendations: FeeStructureRecommendationData2[];
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.organizerId) params.append('organizerId', filter.organizerId.toString());
      if (filter?.processingFeeEnabled !== undefined) params.append('processingFeeEnabled', filter.processingFeeEnabled.toString());

      const response = await api.get(`/admin/revenue/event-fee-configuration?${params.toString()}`);
      return response.data as {
        eventConfigurations: EventFeeConfigurationData[];
        feeRecommendations: FeeStructureRecommendationData2[];
      };
    } catch (error) {
      console.error('Error fetching event fee configuration:', error);
      throw error;
    }
  }

  /**
   * Export revenue data in various formats
   */
  async exportRevenueData(
    format: 'csv' | 'excel' | 'pdf',
    dataType: string,
    options?: any
  ): Promise<Blob> {
    try {
      const payload = {
        format,
        dataType,
        options: options || {}
      };

      const response = await api.post('/admin/revenue/export', payload, {
        responseType: 'blob',
        headers: {
          'Accept': format === 'pdf' ? 'application/pdf' : 
                   format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                   'text/csv'
        }
      });

      return response.data as Blob;
    } catch (error) {
      console.error('Error exporting revenue data:', error);
      throw error;
    }
  }

  /**
   * Helper method to download exported file
   */
  downloadFile(blob: Blob, filename: string, format: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
    link.download = `${filename}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const adminRevenueService = new AdminRevenueService();

// Export types for use in components
export type {
  AdminRevenueFilter,
  ProcessingFeeRevenueData,
  EventProcessingFeeData,
  ProcessingFeeTrendData,
  FeeStructureRecommendationData,
  HistoricalAnalysisData,
  MonthlyRevenueData,
  QuarterlyRevenueData,
  GrowthAnalysisData,
  SeasonalityInsightData,
  EventFeeConfigurationData,
  FeeStructureRecommendationData2
};
