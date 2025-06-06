// src/pages/TicketSelection.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const TicketSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id: eventId } = useParams();

  const [quantities, setQuantities] = useState({
    adult: 0,
    group: 0,
    child: 0,
    family: 0,
  });

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

const ticketTypes: { type: string; price: number }[] = [
  { type: "Adult", price: 25 },
  { type: "Group", price: 200 },
  { type: "Child", price: 15 },
  { type: "Family", price: 60 },
];


const selectedTickets = Object.entries(quantities).map(([type, qty]) => ({
        type,
        quantity: qty,
        price: prices[type as keyof typeof prices] * qty,
    })).filter(ticket => ticket.quantity > 0);


const totalPrice = Object.entries(quantities).reduce((sum, [type, count]) => {
  const ticket = ticketTypes.find((t) => t.type === type);
  return sum + (ticket ? ticket.price * (count as number) : 0);
}, 0);


  const proceed = () => {
        navigate(`/event/${eventId}/food`, {
        state: {
            eventTitle: state.eventTitle,
            ticketPrice: total, // calculated ticket total
            ticketDetails: selectedTickets, // optional: includes breakdown
        },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎟️ Select Tickets</h1>
      <h2 className="text-xl font-semibold mb-2">🎉 Event: {state?.eventTitle}</h2>
      {Object.entries(prices).map(([type, price]) => (
        <div key={type} className="flex justify-between items-center border p-3 rounded mb-3">
          <div className="capitalize">{type} - ${price}</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => handleQtyChange(type as any, -1)} className="px-3 py-1 bg-gray-200">-</button>
            <span>{quantities[type as keyof typeof quantities]}</span>
            <button onClick={() => handleQtyChange(type as any, 1)} className="px-3 py-1 bg-blue-500 text-white">+</button>
          </div>
        </div>
      ))}

        <div className="mt-6 flex justify-between">
        <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
            ⬅️ Back
        </button>

        <div className="text-lg font-semibold">Total: ${total}</div>

        <button
            disabled={total === 0}
            onClick={proceed}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Next ➡️
        </button>
        </div>
    </div>
  );
};

export default TicketSelection;
