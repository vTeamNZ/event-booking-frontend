import { api } from './api';

// Type definitions for our 4 revenue analysis tabs

// Tab 1: Ticket Capacity Analysis
export interface TicketCapacityDTO {
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  soldTickets: number;
  availableTickets: number;
  totalCapacity: number;
  utilizationPercentage: number;
  color: string;
}

// Tab 2: Stripe Revenue Analysis
export interface StripePricingTierDTO {
  ticketPrice: number;
  revenue: number;
  quantity: number;
  seatCombinations: number;
  transactions: number;
  revenuePercentage: number;
  quantityPercentage: number;
}

export interface StripeRevenueAnalysisDTO {
  eventId: number;
  eventTitle: string;
  pricingTiers: StripePricingTierDTO[];
  totalStripeRevenue: number;
  totalStripeTickets: number;
  totalStripeTransactions: number;
  averageTicketPrice: number;
  analysisDate: string;
  // New properties for date-based filtering transparency
  sessionsFetched: number;
  analysisMethod: string;
}

// Tab 3: Organizer Revenue Analysis
export interface OrganizerTicketTypeRevenueDTO {
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  issuedTickets: number;
  paidTickets: number;
  unpaidTickets: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  paymentPercentage: number;
}

export interface OrganizerRevenueDTO {
  eventId: number;
  eventTitle: string;
  ticketTypes: OrganizerTicketTypeRevenueDTO[];
  totalIssued: number;
  totalPaid: number;
  totalUnpaid: number;
  totalOrganizerRevenue: number;
  paidOrganizerRevenue: number;
  unpaidOrganizerRevenue: number;
  overallPaymentPercentage: number;
}

// Tab 4: Revenue Summary
export interface RevenueBreakdownItemDTO {
  ticketTypeName: string;
  ticketPrice: number;
  quantity: number;
  revenue: number;
  formattedLine: string;
}

export interface RevenueCapacityPanelDTO {
  panelTitle: string;
  breakdownItems: RevenueBreakdownItemDTO[];
  totalRevenue: number;
  displayCurrency: string;
}

export interface RevenueSummaryTotalsDTO {
  kiwiLankaRevenue: number;
  kiwiLankaPercentage: number;
  organizerRevenue: number;
  organizerPercentage: number;
  totalRevenue: number;
  remainingCapacityValue: number;
  overallEventUtilization: number;
  estimatedPlatformCommission: number;
  estimatedStripeFees: number;
  estimatedNetToOrganizer: number;
  estimatedNetPercentage: number;
}

export interface RevenueSummaryDTO {
  eventId: number;
  eventTitle: string;
  maxPossibleRevenuePanel: RevenueCapacityPanelDTO;
  kiwiLankaRevenuePanel: RevenueCapacityPanelDTO;
  organizerRevenuePanel: RevenueCapacityPanelDTO;
  combinedSummary: RevenueSummaryTotalsDTO;
  generatedAt: string;
}

// Service class for revenue analysis API calls
export class RevenueAnalysisService {
  
  /**
   * Tab 1: Get ticket capacity analysis for an event
   */
  static async getTicketCapacity(eventId: number): Promise<TicketCapacityDTO[]> {
    try {
      const response = await api.get(`/Events/${eventId}/ticket-capacity`);
      return response.data as TicketCapacityDTO[];
    } catch (error) {
      console.error('Error fetching ticket capacity data:', error);
      throw error;
    }
  }

  /**
   * Tab 2: Get Stripe revenue analysis for an event
   */
  static async getStripeRevenue(eventId: number): Promise<StripeRevenueAnalysisDTO> {
    try {
      const response = await api.get(`/Events/${eventId}/stripe-revenue`);
      return response.data as StripeRevenueAnalysisDTO;
    } catch (error) {
      console.error('Error fetching Stripe revenue data:', error);
      throw error;
    }
  }

  /**
   * Tab 3: Get organizer revenue analysis for an event
   */
  static async getOrganizerRevenue(eventId: number): Promise<OrganizerRevenueDTO> {
    try {
      const response = await api.get(`/Events/${eventId}/organizer-revenue`);
      return response.data as OrganizerRevenueDTO;
    } catch (error) {
      console.error('Error fetching organizer revenue data:', error);
      throw error;
    }
  }

  /**
   * Tab 4: Get complete revenue summary for an event
   */
  static async getRevenueSummary(eventId: number): Promise<RevenueSummaryDTO> {
    try {
      const response = await api.get(`/Events/${eventId}/revenue-summary`);
      return response.data as RevenueSummaryDTO;
    } catch (error) {
      console.error('Error fetching revenue summary data:', error);
      throw error;
    }
  }

  /**
   * Get all revenue data for an event (convenience method)
   */
  static async getAllRevenueData(eventId: number) {
    try {
      const [
        ticketCapacity,
        stripeRevenue,
        organizerRevenue,
        revenueSummary
      ] = await Promise.all([
        this.getTicketCapacity(eventId),
        this.getStripeRevenue(eventId),
        this.getOrganizerRevenue(eventId),
        this.getRevenueSummary(eventId)
      ]);

      return {
        ticketCapacity,
        stripeRevenue,
        organizerRevenue,
        revenueSummary
      };
    } catch (error) {
      console.error('Error fetching all revenue data:', error);
      throw error;
    }
  }
}

export default RevenueAnalysisService;
