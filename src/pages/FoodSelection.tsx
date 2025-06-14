import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FoodItem, getFoodItemsForEvent } from '../services/foodItemService';

interface LocationState {
  eventId: number;
  eventTitle: string;
  ticketPrice: number;
  ticketDetails: Array<{
    type: string;
    quantity: number;
    price: number;
    unitPrice: number;
  }>;
}

const FoodSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const locationState = state as LocationState;

  useEffect(() => {
    const fetchFoodItems = async () => {
      if (!locationState?.eventId) return;
      try {
        const items = await getFoodItemsForEvent(locationState.eventId);
        setFoodItems(items);
        // Initialize quantities for each food item
        const initialQuantities = items.reduce((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {} as Record<number, number>);
        setQuantities(initialQuantities);
        setError(null);
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load food items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [locationState?.eventId]);

  const handleQtyChange = (foodId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [foodId]: Math.max(0, (prev[foodId] || 0) + delta),
    }));
  };

  const foodTotal = foodItems.reduce(
    (sum, item) => sum + (quantities[item.id] || 0) * item.price,
    0
  );

  const selectedFoodItems = foodItems
    .map(item => ({
      name: item.name,
      quantity: quantities[item.id] || 0,
      unitPrice: item.price,
      price: (quantities[item.id] || 0) * item.price,
    }))
    .filter(item => item.quantity > 0);

  const grandTotal = (locationState?.ticketPrice || 0) + foodTotal;

  const proceed = () => {
    navigate('/payment', {
      state: {
        amount: grandTotal,
        eventId: locationState?.eventId,
        eventTitle: locationState?.eventTitle,
        ticketDetails: locationState?.ticketDetails,
        selectedFoods: selectedFoodItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Food Items</h1>
        <h2 className="text-xl text-gray-600 mb-2">{locationState?.eventTitle}</h2>
        <p className="text-sm text-gray-500">Optional - Select any food items you'd like to add to your order</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading food items...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      ) : foodItems.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Food Items Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There are no pre-order food options available for this event. You can proceed to payment for your ticket, or food and beverages may be available for purchase at the venue.
          </p>
          <div className="mt-6">
            <button
              onClick={proceed}
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-red-600 transition-colors duration-200"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {foodItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                <div className="text-gray-600 font-medium mt-2">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleQtyChange(item.id, -1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={quantities[item.id] === 0}
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-gray-800">
                  {quantities[item.id] || 0}
                </span>
                <button 
                  onClick={() => handleQtyChange(item.id, 1)}
                  className="w-10 h-10 rounded-full bg-primary text-white hover:bg-red-600 flex items-center justify-center transition-colors duration-200"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-gray-600">
            <span>Ticket Total</span>
            <span>${locationState?.ticketPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>Food Total</span>
            <span>${foodTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-bold text-gray-800 pt-2 border-t">
            <span>Grand Total</span>
            <span>${grandTotal.toFixed(2)}</span>
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
            onClick={proceed}
            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSelection;
