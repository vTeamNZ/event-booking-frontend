import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


interface FoodItem {
  name: string;
  price: number;
  quantity: number;
}

const initialMenu: FoodItem[] = [
  { name: "Chicken Biryani", price: 12, quantity: 0 },
  { name: "Veg Kottu", price: 10, quantity: 0 },
  { name: "Fish Curry Rice", price: 14, quantity: 0 },
  { name: "Watalappam", price: 6, quantity: 0 },
];

const FoodSelection: React.FC = () => {
  const [menu, setMenu] = useState<FoodItem[]>(initialMenu);
  const location = useLocation();
  const navigate = useNavigate();

  const handleQtyChange = (index: number, delta: number) => {
    const updated = [...menu];
    updated[index].quantity = Math.max(0, updated[index].quantity + delta);
    setMenu(updated);
  };

  const { eventTitle, ticketPrice, ticketDetails } = location.state || {};
  const selectedFoods = menu.filter(item => item.quantity > 0);
  const totalCost = selectedFoods.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const goToPayment = () => {
    navigate("/payment", {
        state: {
        eventTitle,
        ticketPrice, //  Use the actual ticketPrice variable
        //selectedFoods,
        foodCost: totalCost,
        totalAmount: (ticketPrice || 0) + totalCost, //  Safer sum
        },
    });
    };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🍛 Select Your Food</h1>
      <h2 className="text-xl font-semibold mb-2">🎉 Event: {eventTitle}</h2>
        <div className="flex justify-between items-center mb-4">
        <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
            ⬅️ Back
        </button>

        <button
            onClick={() =>
            navigate("/payment", {
                state: {
                eventTitle,
                ticketPrice,
                selectedFoods: [],
                foodCost: 0,
                totalAmount: ticketPrice || 0,
                },
            })
            }
            className="text-blue-600 underline hover:text-blue-800"
        >
            Skip ➡️
        </button>
        </div>
      <p className="text-gray-600 mb-2">💵 Ticket Price: ${ticketPrice}</p>
      <ul className="space-y-4">
        {menu.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center border p-3 rounded shadow">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">${item.price}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQtyChange(idx, -1)}
                className="px-2 py-1 bg-gray-200 rounded"
              >−</button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQtyChange(idx, 1)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >+</button>
            </div>
          </li>
        ))}
      </ul>

    <div className="mt-6 space-y-2">
    <p className="text-lg font-semibold">💵 Ticket Price: ${ticketPrice}</p>
    <p className="text-lg font-semibold">🍽️ Food Total: ${totalCost.toFixed(2)}</p>
    <p className="text-xl font-bold text-blue-800">
        💰 Total to Pay: ${(ticketPrice || 0) + totalCost}
    </p>
    <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
        onClick={goToPayment}
        disabled={selectedFoods.length === 0}
    >
        Next ➡️
    </button>
    </div>
    </div>
  );
};

export default FoodSelection;
