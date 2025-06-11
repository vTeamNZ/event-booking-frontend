// src/pages/TicketSelection.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Event {
  id: number;
  date: string;
  isActive?: boolean;
}

const TicketSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id: eventId } = useParams();
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch event details to check if it's active
    axios.get<Event>(`https://kiwilanka.co.nz/api/Events/${eventId}`)
      .then(response => {
        const event = response.data;
        const active = new Date(event.date) > new Date();
        setIsActive(active);
        if (!active) {
          setTimeout(() => {
            navigate('/');
          }, 5000); // Redirect after 5 seconds
        }
      })
      .catch(error => {
        console.error('Error fetching event:', error);
        setIsActive(false);
      });
  }, [eventId, navigate]);

  const [quantities, setQuantities] = useState({
    adult: 0,
    group: 0,
    child: 0,
    family: 0,
  });

  // If we know the event is not active, show the message
  if (isActive === false) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">This Event Has Ended</h1>
        <p className="text-gray-600 mb-8">
          Sorry, this event is no longer available for booking. You will be redirected to the events page in a few seconds.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const prices = {
    adult: 25,
    group: 200,
    child: 15,
    family: 60,
  };

  const handleQtyChange = (type: keyof typeof quantities, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  const total = Object.entries(quantities).reduce(
    (sum, [key, qty]) => sum + prices[key as keyof typeof prices] * qty,
    0
  );

  const selectedTickets = Object.entries(quantities).map(([type, qty]) => ({
    type,
    quantity: qty,
    price: prices[type as keyof typeof prices] * qty,
  })).filter(ticket => ticket.quantity > 0);

  const proceed = () => {
    navigate(`/event/${eventId}/food`, {
      state: {
        eventTitle: state.eventTitle,
        ticketPrice: total,
        ticketDetails: selectedTickets,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Tickets</h1>
        <h2 className="text-xl text-gray-600">{state?.eventTitle}</h2>
      </div>

      <div className="space-y-4">
        {Object.entries(prices).map(([type, price]) => (
          <div 
            key={type} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-lg font-semibold text-gray-800 capitalize">{type}</span>
                <span className="ml-2 text-sm text-gray-500">ticket</span>
              </div>
              <div className="text-gray-600 font-medium">
                ${price.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleQtyChange(type as keyof typeof quantities, -1)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                disabled={quantities[type as keyof typeof quantities] === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800">
                {quantities[type as keyof typeof quantities]}
              </span>
              <button 
                onClick={() => handleQtyChange(type as keyof typeof quantities, 1)}
                className="w-10 h-10 rounded-full bg-primary text-white hover:bg-red-600 flex items-center justify-center transition-colors duration-200"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <span className="mr-2">←</span> Back
          </button>

          <button
            disabled={total === 0}
            onClick={proceed}
            className={`flex-1 px-6 py-3 rounded-lg ${
              total === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-red-600'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            Continue to Food & Payment <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSelection;
