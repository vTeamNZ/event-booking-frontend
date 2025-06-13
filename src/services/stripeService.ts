import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    const response = await fetch('http://localhost:5290/api/payment/config');
    const { publishableKey } = await response.json();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export const createPaymentIntent = async (amount: number, eventDetails: any) => {
  try {
    const response = await fetch('http://localhost:5290/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'nzd',
        description: `Tickets for ${eventDetails.eventTitle}`,
        metadata: {
          eventId: eventDetails.eventId,
          ticketDetails: JSON.stringify(eventDetails.ticketDetails),
          foodDetails: JSON.stringify(eventDetails.selectedFoods)
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Payment failed to initialize');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};
