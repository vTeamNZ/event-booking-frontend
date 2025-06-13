export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface PaymentDetails extends CustomerDetails {
  eventId: string;
  eventTitle: string;
  amount: number;
  ticketDetails: any;
  foodDetails: any;
}
