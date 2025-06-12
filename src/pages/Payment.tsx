import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    eventTitle,
    ticketPrice,
    selectedFoods,
    foodCost,
    totalAmount,
  } = location.state || {};

  // Inject Stripe script dynamically
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

          {/* Stripe Payment Button */}
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="flex items-center">
                <span className="mr-2">🔒</span>
                Secure payment processed by Stripe
              </p>
            </div>
            
            <div>
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <stripe-buy-button
                      buy-button-id="buy_btn_1RWBUZ03DpFjygI0bakfQMGy"
                      publishable-key="pk_live_51PB5Tt03DpFjygI0i03z2ndj0FxRzaomXGtlEkPU2HCGgb4PfCtym3K0bctOVtoiRMs0Iyq7Ce0PxACYw4si1zP200lfTlmNTI"
                    ></stripe-buy-button>
                  `,
                }}
              />
            </div>

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
