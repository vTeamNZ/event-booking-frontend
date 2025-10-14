// Types for Organizer Sales Management functionality

export interface OrganizerTicketSalesDTO {
  id: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  seatDetails?: string;
  ticketPrice: number;
  isPaid: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerFullName: string;
  isCancelled: boolean;
}

export interface UpdateCustomerDetailsRequest {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
}

export interface TogglePaymentRequest {
  isPaid: boolean;
}

export interface SimpleOperationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SalesManagementFilters {
  search: string;
  status: 'all' | 'active' | 'cancelled';
}
