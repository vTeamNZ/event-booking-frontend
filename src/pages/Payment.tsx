import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, verifyPayment } from '../services/stripeService';
import { CustomerDetails } from '../types/payment';

interface PaymentLocationState {
  amount: number;
  eventTitle: string;
  eventId: number;
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

const PaymentForm: React.FC<{ clientSecret: string; totalAmount: number }> = ({ clientSecret, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const customerDetails = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        mobile: form.mobile.value,
      };

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            email: customerDetails.email,
            phone: customerDetails.mobile,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        navigate('/payment-failed', { 
          state: { 
            error: stripeError.message 
          } 
        });
      } else {
        try {
          // Verify payment status with backend
          const verificationResult = await verifyPayment(paymentIntent.id);
          
          if (verificationResult.isSuccessful) {
            // Payment verified as successful
            navigate('/payment-success', {
              state: {
                paymentId: paymentIntent.id,
                amount: verificationResult.amount / 100, // Convert from cents to dollars
                email: verificationResult.receiptEmail
              }
            });
          } else {
            // Payment was not successful
            setError('Payment was not completed successfully');
            navigate('/payment-failed', { 
              state: { 
                error: 'Payment was not completed successfully',
                status: verificationResult.status
              } 
            });
          }
        } catch (verificationError: any) {
          console.error('Error verifying payment:', verificationError);
          setError('Could not verify payment status');
          navigate('/payment-failed', { 
            state: { 
              error: 'Could not verify payment status' 
            } 
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="card" className="block text-sm font-medium text-gray-700">Card Details</label>
          <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <CardElement />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${(totalAmount).toFixed(2)}`}
      </button>
    </form>
  );
};

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Check if we have the required payment state
        if (!location.state || !('amount' in location.state)) {
          throw new Error('Missing payment information');
        }

        const paymentState = location.state as PaymentLocationState;
        const { amount, eventId, eventTitle, ticketDetails, selectedFoods } = paymentState;

        if (!amount || !eventId || !eventTitle || !ticketDetails) {
          throw new Error('Missing required payment information');
        }

        console.log('Initializing payment with:', { amount, eventId, eventTitle, ticketDetails, selectedFoods });
        
        const stripe = await getStripe();
        setStripePromise(stripe);
        
        const paymentIntent = await createPaymentIntent(
          amount,
          { eventId, eventTitle, ticketDetails, selectedFoods }
        );

        setClientSecret(paymentIntent.clientSecret);
        setError(null);
      } catch (err: any) {
        console.error('Failed to initialize payment:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
        setError(errorMessage);
      } finally {
        setInitializing(false);
      }
    };

    initializePayment();
  }, []); // Only run once on mount

  // Render functions
  const renderError = (message: string) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Initializing Payment</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );

  // Handle different states
  if (initializing) {
    return renderLoading();
  }

  if (error) {
    return renderError(error);
  }

  if (!clientSecret || !stripePromise || !location.state) {
    return renderError('Unable to initialize payment. Please try again.');
  }

  const { amount, eventTitle, ticketDetails, selectedFoods } = location.state as PaymentLocationState;

  // Render the payment form
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Details</h1>
            <h2 className="text-xl text-gray-600">{eventTitle}</h2>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Tickets</h3>
              <div className="mt-4">
                <div className="flex justify-between text-gray-500">
                  <span>Total for Tickets:</span>
                  <span className="text-primary font-medium">
                    ${ticketDetails?.reduce((total: number, item: any) => total + item.price * item.quantity, 0)?.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {ticketDetails?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-500">
                      <span>{item.quantity}x {item.type}</span>
                      <span>${(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedFoods && selectedFoods.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Food Items</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Total for Food:</span>
                    <span className="text-primary font-medium">
                      ${selectedFoods.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {selectedFoods.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-500">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-lg font-medium text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary">${amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Payment Information</h3>
              <Elements stripe={stripePromise}>
                <PaymentForm clientSecret={clientSecret} totalAmount={amount} />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
