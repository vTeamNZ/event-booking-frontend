import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface FoodItem {
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
}

const initialMenu: FoodItem[] = [
  { 
    name: "Chicken Biryani", 
    price: 12, 
    quantity: 0,
    description: "Fragrant basmati rice cooked with tender chicken and aromatic spices",
    image: "https://example.com/biryani.jpg"  // You can add actual image URLs
  },
  { 
    name: "Veg Kottu", 
    price: 10, 
    quantity: 0,
    description: "Shredded roti stir-fried with vegetables and authentic Sri Lankan spices",
    image: "https://example.com/kottu.jpg"
  },
  { 
    name: "Fish Curry Rice", 
    price: 14, 
    quantity: 0,
    description: "Fresh fish cooked in coconut curry sauce served with steamed rice",
    image: "https://example.com/curry.jpg"
  },
  { 
    name: "Watalappam", 
    price: 6, 
    quantity: 0,
    description: "Traditional Sri Lankan dessert made with jaggery and coconut milk",
    image: "https://example.com/watalappam.jpg"
  },
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
    const paymentState = {
      eventId: location.state?.eventId,
      eventTitle,
      ticketDetails: location.state?.ticketDetails,
      selectedFoods,
      amount: (ticketPrice || 0) + totalCost,  // Ensure amount is passed correctly
    };

    // Validate required data before navigation
    if (!paymentState.eventId || !paymentState.eventTitle || !paymentState.ticketDetails) {
      console.error('Missing required payment information');
      navigate('/');
      return;
    }

    navigate("/payment", { state: paymentState });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Food & Beverages</h1>
        <h2 className="text-xl text-gray-600">{eventTitle}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQtyChange(idx, -1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors duration-200"
                    disabled={item.quantity === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(idx, 1)}
                    className="w-8 h-8 rounded-full bg-primary text-white hover:bg-red-600 flex items-center justify-center transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-700 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Ticket Total</span>
            <span>${ticketPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Food Total</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
            <span>Total</span>
            <span>${((ticketPrice || 0) + totalCost).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <span className="mr-2">←</span> Back
          </button>

          <button
            onClick={goToPayment}
            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
          >
            Continue to Payment <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSelection;
