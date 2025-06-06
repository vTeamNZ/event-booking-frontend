import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Payment: React.FC = () => {
  const location = useLocation();
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
    <div className="p-6 bg-gray-50 min-h-screen">
        <button
            onClick={() => window.history.back()}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 mb-4"
            >
            ⬅️ Back
        </button>
      <h1 className="text-2xl font-bold mb-4">🧾 Payment Summary</h1>
      <h2 className="text-xl font-semibold mb-2">🎉 Event: {eventTitle}</h2>
      <p className="mb-1">🎟️ Ticket Price: ${ticketPrice}</p>
      <p className="mb-1">🍽️ Food Total: ${foodCost}</p>

      {/* <h3 className="mt-4 text-lg font-semibold">Selected Food:</h3>
      <ul className="mb-4">
        {selectedFoods?.map((item: any, idx: number) => (
          <li key={idx}>
            {item.name} x {item.quantity} — ${item.price * item.quantity}
          </li>
        ))}
      </ul> */}

      <p className="text-xl font-bold">Total to Pay: 💰 ${totalAmount}</p>

      {/* Stripe Buy Button */}
      <div className="mt-6">
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
    </div>
  );
};

export default Payment;
