import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent } from '../services/stripeService';

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
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        navigate('/payment-success', { 
          state: { 
            paymentId: paymentIntent.id,
            amount: totalAmount
          }
        });
      }
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* Customer Details */}
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Customer Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="mobile">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Details</h3>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Card Details
        </label>
        <div className="border rounded-lg p-4 bg-white">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      {error && (
        <div className="text-red-600 mb-4 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay $${totalAmount?.toFixed(2)}`}
      </button>
    </form>
  );
};

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const {
    eventTitle,
    ticketPrice,
    selectedFoods,
    foodCost,
    totalAmount,
  } = location.state || {};  useEffect(() => {
    // Load Stripe on component mount
    const loadStripe = async () => {
      try {
        const stripe = await getStripe();
        setStripePromise(stripe);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
      }
    };
    loadStripe();
  }, [navigate, location]);
  useEffect(() => {
    if (!totalAmount) {
      navigate('/');
      return;
    }    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        const { clientSecret: secret } = await createPaymentIntent(totalAmount, location.state);
        setClientSecret(secret);      } catch (error: any) {
        console.error('Failed to initialize payment:', error);
        // Show error to user or handle appropriately
      }
    };

    initializePayment();
  }, [totalAmount, navigate, location]);

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Summary</h1>
          <h2 className="text-xl text-gray-600">{eventTitle}</h2>
        </div>

        <div className="space-y-6">
          {/* Ticket Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Ticket Details</h3>
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-primary font-medium">${ticketPrice?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {location.state?.ticketDetails?.map((ticket: any) => (
                <div key={ticket.type} className="flex justify-between items-center text-gray-600 py-1">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize font-medium">{ticket.type}</span>
                    <span className="text-gray-400">×</span>
                    <span>{ticket.quantity}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">(${ticket.unitPrice} each)</span>
                    <span className="font-medium">${(ticket.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Summary */}
          {foodCost > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Food & Beverages</h3>
                <div className="bg-primary/10 px-3 py-1 rounded-full">
                  <span className="text-primary font-medium">${foodCost?.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedFoods?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-gray-600 py-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-400">×</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">(${item.price} each)</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="bg-gray-800 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-white font-semibold">Includes all tickets and food items</p>
              </div>
              <span className="text-2xl font-bold">${totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Stripe Payment Form */}
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="flex items-center">
                <span className="mr-2">🔒</span>
                Secure payment processed by Stripe
              </p>
            </div>
            
            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise}>
                <PaymentForm clientSecret={clientSecret} totalAmount={totalAmount} />
              </Elements>
            ) : (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            )}

            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">←</span> Back to Food Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
