import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { BookingData, FoodItem } from '../types/booking';

interface FoodSelectionProps {
  eventId?: number;
}

const FoodSelection: React.FC<FoodSelectionProps> = ({ eventId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<{ [key: number]: number }>({});
  const [loadingFood, setLoadingFood] = useState(false);
  
  // Get booking data from navigation state or context
  const bookingData = location.state as BookingData;
  const actualEventId = eventId || bookingData?.eventId;
  
  const {
    formatPrice,
    calculateTicketTotal,
    calculateFoodTotal,
    updateFoodItems
  } = useBookingFlow(actualEventId || 0);

  // Fetch food items for the event
  useEffect(() => {
    if (!actualEventId) return;

    const fetchFoodItems = async () => {
      setLoadingFood(true);
      try {
        const response = await fetch(`/api/events/${actualEventId}/food-items`);
        const data = await response.json();
        setFoodItems(data || []);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setFoodItems([]);
      } finally {
        setLoadingFood(false);
      }
    };

    fetchFoodItems();
  }, [actualEventId]);

  // Redirect if no valid booking data
  useEffect(() => {
    if (!bookingData || !bookingData.eventId) {
      navigate('/events');
    }
  }, [bookingData, navigate]);

  const handleFoodQuantityChange = (foodId: number, change: number) => {
    setSelectedFood(prev => ({
      ...prev,
      [foodId]: Math.max(0, (prev[foodId] || 0) + change)
    }));
  };

  const calculateCurrentTicketTotal = (): number => {
    if (!bookingData) return 0;

    if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
      return bookingData.selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }

    if (bookingData.bookingType === 'tickets' && bookingData.selectedTickets) {
      return bookingData.selectedTickets.reduce((sum, ticket) => 
        sum + (ticket.price * ticket.quantity), 0);
    }

    return 0;
  };

  const calculateCurrentFoodTotal = (): number => {
    return Object.entries(selectedFood).reduce((sum, [foodId, quantity]) => {
      const item = foodItems.find(f => f.id === parseInt(foodId));
      return sum + ((item?.price || 0) * quantity);
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return calculateCurrentTicketTotal() + calculateCurrentFoodTotal();
  };

  const handleContinue = () => {
    if (!bookingData) return;

    const foodDetails = Object.entries(selectedFood)
      .filter(([_, quantity]) => quantity > 0)
      .map(([foodId, quantity]) => {
        const item = foodItems.find(f => f.id === parseInt(foodId));
        return {
          foodItemId: parseInt(foodId),
          quantity,
          price: item?.price || 0,
          name: item?.name || ''
        };
      });

    const updatedBookingData: BookingData = {
      ...bookingData,
      selectedFoodItems: foodDetails,
      totalAmount: calculateGrandTotal()
    };

    // Update context if available
    updateFoodItems(foodDetails);

    navigate('/payment-summary', {
      state: updatedBookingData
    });
  };

  if (!bookingData) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>Loading booking data...</p>
        </div>
      </div>
    );
  }

  if (loadingFood) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>Loading food items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Food Selection</h2>
        
        {/* Booking Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{bookingData.eventTitle}</h3>
          <div className="text-sm text-gray-600">
            {bookingData.bookingType === 'seats' && bookingData.selectedSeats && (
              <p>Selected Seats: {bookingData.selectedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}</p>
            )}
            {bookingData.bookingType === 'tickets' && bookingData.selectedTickets && (
              <div>
                {bookingData.selectedTickets.map(ticket => (
                  <p key={ticket.ticketTypeId}>
                    {ticket.name}: {ticket.quantity} × ${formatPrice(ticket.price)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {foodItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <p className="text-lg text-gray-600">No food items available for this event</p>
              <p className="text-sm text-gray-500">You can proceed directly to payment</p>
            </div>
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleContinue}
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              {foodItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-green-600 font-medium">${formatPrice(item.price)}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => handleFoodQuantityChange(item.id, -1)}
                        disabled={!selectedFood[item.id] || selectedFood[item.id] === 0}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {selectedFood[item.id] || 0}
                      </span>
                      <button
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        onClick={() => handleFoodQuantityChange(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {selectedFood[item.id] > 0 && (
                    <div className="mt-2 text-right text-sm text-gray-600">
                      Subtotal: ${formatPrice((item.price || 0) * selectedFood[item.id])}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Total Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Ticket Total:</span>
                <span className="font-medium">${formatPrice(calculateCurrentTicketTotal())}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Food Total:</span>
                <span className="font-medium">${formatPrice(calculateCurrentFoodTotal())}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>${formatPrice(calculateGrandTotal())}</span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button 
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleContinue}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSelection;
