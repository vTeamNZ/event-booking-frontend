import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

interface StripeConfig {
  publishableKey: string;
}

interface PaymentIntent {
  clientSecret: string;
  id: string;
}

let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    const response = await axios.get<StripeConfig>('http://localhost:5290/api/payment/config');
    stripePromise = loadStripe(response.data.publishableKey);
  }
  return stripePromise;
};

interface EventDetails {
  eventId: string;
  eventTitle: string;
  ticketDetails: any;
  selectedFoods: any;
}

export const createPaymentIntent = async (amount: number, eventDetails: EventDetails) => {
  try {    const response = await axios.post<PaymentIntent>('http://localhost:5290/api/payment/create-payment-intent', {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'nzd',
      description: `Tickets for ${eventDetails.eventTitle}`,
      eventId: eventDetails.eventId,
      ticketDetails: JSON.stringify(eventDetails.ticketDetails),
      foodDetails: JSON.stringify(eventDetails.selectedFoods)
    });

    return response.data;  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};
