import { api } from './api';
import { 
  OrganizerTicketSalesDTO, 
  UpdateCustomerDetailsRequest, 
  TogglePaymentRequest, 
  SimpleOperationResponse 
} from '../types/salesManagement';

/**
 * Service for Organizer Sales Management functionality
 * Handles simple CRUD operations for ticket management
 */
export class OrganizerSalesManagementService {
  /**
   * Get tickets for sales management table
   */
  static async getTicketsForSalesManagement(eventId: number): Promise<OrganizerTicketSalesDTO[]> {
    try {
      const response = await api.get<OrganizerTicketSalesDTO[]>(`/organizer/events/${eventId}/sales-management`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales management tickets:', error);
      throw error;
    }
  }

  /**
   * Update customer details for a ticket
   */
  static async updateCustomerDetails(
    paymentId: number, 
    request: UpdateCustomerDetailsRequest
  ): Promise<SimpleOperationResponse> {
    try {
      const response = await api.put<SimpleOperationResponse>(
        `/organizer/payments/${paymentId}/customer-details`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error updating customer details:', error);
      throw error;
    }
  }

  /**
   * Toggle payment status for a ticket
   */
  static async togglePaymentStatus(
    paymentId: number, 
    request: TogglePaymentRequest
  ): Promise<SimpleOperationResponse> {
    try {
      const response = await api.put<SimpleOperationResponse>(
        `/organizer/payments/${paymentId}/toggle-payment`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel a ticket (permanent action)
   */
  static async cancelTicket(paymentId: number): Promise<SimpleOperationResponse> {
    try {
      const response = await api.put<SimpleOperationResponse>(
        `/organizer/payments/${paymentId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      throw error;
    }
  }
}

export default OrganizerSalesManagementService;
