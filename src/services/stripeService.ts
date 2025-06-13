import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { CustomerDetails } from '../types/payment';

interface StripeConfig {
  publishableKey: string;
}

interface PaymentIntent {
  clientSecret: string;
  id: string;
}

let stripePromise: Promise<any> | null = null;

interface EventDetails {
  eventId: number;
  eventTitle: string;
  ticketDetails: Array<{
    type: string;
    quantity: number;
    price: number;
  }>;
  selectedFoods?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const getStripe = async () => {
  if (!stripePromise) {
    const response = await axios.get<StripeConfig>('http://localhost:5290/api/payment/config');
    stripePromise = loadStripe(response.data.publishableKey);
  }
  return stripePromise;
};

export const createPaymentIntent = async (
  amount: number, 
  eventDetails: EventDetails,
  customerDetails?: CustomerDetails
) => {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!eventDetails.eventId || !eventDetails.eventTitle) {
      throw new Error('Missing event details: eventId and eventTitle are required');
    }

    if (!eventDetails.ticketDetails || !Array.isArray(eventDetails.ticketDetails) || eventDetails.ticketDetails.length === 0) {
      throw new Error('At least one ticket must be selected');
    }

    const ticketDetails = eventDetails.ticketDetails.map(ticket => ({
      type: ticket.type,
      quantity: ticket.quantity,
      price: ticket.price,
      unitPrice: ticket.price / ticket.quantity
    }));

    const foodDetails = Array.isArray(eventDetails.selectedFoods) 
      ? eventDetails.selectedFoods.map(food => ({
          name: food.name,
          quantity: food.quantity,
          price: food.price,
          unitPrice: food.price / food.quantity
        }))
      : [];

    // Format the request data
    const description = `Tickets for ${eventDetails.eventTitle}`;
    const requestData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'nzd',
      description: description,
      eventId: eventDetails.eventId,
      eventTitle: eventDetails.eventTitle,
      ticketDetails: JSON.stringify(ticketDetails),
      foodDetails: foodDetails.length > 0 ? JSON.stringify(foodDetails) : null
    };

    console.log('Creating payment intent with data:', JSON.stringify(requestData, null, 2));
    
    try {
      const response = await axios.post<PaymentIntent>(
        'http://localhost:5290/api/payment/create-payment-intent', 
        requestData
      );
      
      if (!response.data || !response.data.clientSecret) {
        throw new Error('Invalid response from payment service: missing clientSecret');
      }

      console.log('Payment intent created successfully');
      return response.data;
    } catch (axiosError: any) {
      console.error('Server error creating payment intent:', axiosError.response?.data);
      // Try to extract a meaningful error message from the response
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        } else if (errorData.title || errorData.errors) {
          const errorMessage = errorData.errors 
            ? Object.values(errorData.errors).flat().join(', ')
            : errorData.title;
          throw new Error(`Payment failed: ${errorMessage}`);
        }
      }
      throw new Error('Failed to create payment: Server error');
    }
  } catch (error: any) {
    console.error('Error in createPaymentIntent:', error);
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }
};
