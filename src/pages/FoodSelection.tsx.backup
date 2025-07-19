import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FoodItem, getFoodItemsForEvent } from '../services/foodItemService';
import { BookingData } from '../types/booking';
import SEO from '../components/SEO';
import EventHero from '../components/EventHero';

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

// Enhanced interface for both seat and ticket flows
interface EnhancedLocationState extends BookingData {
  // Legacy support for ticket-based flow
  ticketPrice?: number;
  imageUrl?: string;
  ticketDetails?: Array<{
    type: string;
    quantity: number;
    price: number;
    unitPrice: number;
  }>;
}

const FoodSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const locationState = state as EnhancedLocationState;

  // Check for direct page access
  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }
  }, [state, navigate]);

  // Helper function to safely format prices
  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  };

  // Calculate ticket total based on booking type
  const calculateTicketTotal = (): number => {
    if (!locationState) return 0;

    // New seat/ticket booking flow
    if (locationState.bookingType === 'seats' && locationState.selectedSeats) {
      return locationState.selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }

    if (locationState.bookingType === 'tickets' && locationState.selectedTickets) {
      // Fix: The price property already includes the calculation of price * quantity from TicketSelection
      return locationState.selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    }

    // Legacy ticket flow support
    return locationState.ticketPrice || 0;
  };

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

  const ticketTotal = calculateTicketTotal();
  const grandTotal = ticketTotal + foodTotal;

  const proceed = () => {
    // Ensure we have location state
    if (!locationState) {
      console.error('Missing location state in FoodSelection');
      navigate('/');
      return;
    }

    // Prepare enhanced booking data for the new flow
    const enhancedBookingData: BookingData = {
      eventId: locationState.eventId,
      eventTitle: locationState.eventTitle,
      imageUrl: locationState.imageUrl,
      // Ensure we preserve the booking type from the previous step
      bookingType: locationState.bookingType || 'tickets',
      totalAmount: grandTotal,
      selectedSeats: locationState.selectedSeats,
      selectedTickets: locationState.selectedTickets,
      selectedFoodItems: selectedFoodItems.map(item => ({
        foodItemId: foodItems.find(f => f.name === item.name)?.id || 0,
        quantity: item.quantity,
        price: item.unitPrice,
        name: item.name,
      })),
    };

    // Create ticketDetails array - handle both tickets and seats
    let legacyTicketDetails: Array<{
      type: string;
      quantity: number;
      price: number;
      unitPrice: number;
    }> = [];
    
    // Case 1: We have ticket details from previous step (legacy format)
    if (locationState.ticketDetails && locationState.ticketDetails.length > 0) {
      legacyTicketDetails = locationState.ticketDetails;
    }
    // Case 2: We have selected tickets (new format)
    else if (locationState.selectedTickets && locationState.selectedTickets.length > 0) {
      legacyTicketDetails = locationState.selectedTickets.map(ticket => ({
        type: ticket.type || ticket.name,
        quantity: ticket.quantity,
        price: ticket.price,
        unitPrice: ticket.price / ticket.quantity
      }));
    }
    // Case 3: We have selected seats (new format)
    else if (locationState.selectedSeats && locationState.selectedSeats.length > 0) {
      // Group seats by ticket type
      const seatsByTicketType = locationState.selectedSeats.reduce((acc, seat) => {
        const typeKey = seat.ticketTypeId.toString();
        if (!acc[typeKey]) {
          acc[typeKey] = {
            ticketTypeId: seat.ticketTypeId,
            count: 0,
            totalPrice: 0,
            seatNumbers: []
          };
        }
        acc[typeKey].count++;
        acc[typeKey].totalPrice += seat.price;
        acc[typeKey].seatNumbers.push(`${seat.row}${seat.number}`);
        return acc;
      }, {} as Record<string, { ticketTypeId: number, count: number, totalPrice: number, seatNumbers: string[] }>);
      
      // Convert grouped seats to ticket details
      legacyTicketDetails = Object.values(seatsByTicketType).map(group => ({
        type: `Seat${group.count > 1 ? 's' : ''} (${group.seatNumbers.join(', ')})`,
        quantity: group.count,
        price: group.totalPrice,
        unitPrice: group.totalPrice / group.count
      }));
    }

    // For legacy compatibility, also pass the old format
    navigate('/payment', {
      state: {
        // New enhanced booking data
        ...enhancedBookingData,
        // Legacy format for backward compatibility
        amount: grandTotal,
        eventId: locationState.eventId,
        eventTitle: locationState.eventTitle,
        ticketDetails: legacyTicketDetails,
        selectedFoods: selectedFoodItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice, // Pass the unit price, not the total price
        })),
      },
    });
  };
  return (
    <>
      <SEO 
        title={`Add Food - ${locationState?.eventTitle}`}
        description="Book Food With Your Ticket. Enhance your event experience with delicious food options. Pay online securely with Stripe."
        keywords={['Book Food With Your Ticket', 'Enjoy Food + Entertainment', 'Pay Securely With Stripe']}
      />
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section */}
        <EventHero 
          title={locationState?.eventTitle || 'Event Food Selection'}
          imageUrl={locationState?.imageUrl}
          description="Select food and beverages for your event"
          className="mb-8"
        />

        {/* Main Content with Dark Cinema Theme */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Add Food & Beverages</h1>
            <p className="text-gray-400">Enhance your event experience with delicious food options</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Food Selection Panel */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Available Items</h2>
                  <p className="text-gray-400 text-sm mt-1">Select items to add to your order</p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <div className="text-gray-400">Loading food items...</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-error">{error}</div>
                  </div>
                ) : foodItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No food items available for this event</div>
                    <button
                      onClick={proceed}
                      className="bg-primary hover:bg-primary-dark text-black px-6 py-2 rounded-lg transition-colors"
                    >
                      Continue Without Food
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {foodItems.map((item) => (
                      <div key={item.id} className="p-6 hover:bg-gray-750 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-white">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                            )}
                            <div className="text-primary font-semibold text-lg mt-2">
                              ${formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 ml-6">
                            <button 
                              onClick={() => handleQtyChange(item.id, -1)}
                              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantities[item.id] === 0 || item.price === 0}
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold text-white text-lg">
                              {quantities[item.id] || 0}
                            </span>
                            <button 
                              onClick={() => handleQtyChange(item.id, 1)}
                              className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.price === 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden sticky top-4">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Order Summary</h3>
                </div>

                <div className="p-6">
                  {/* Event Info */}
                  {locationState && (
                    <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                      <h4 className="text-white font-medium mb-2">{locationState.eventTitle}</h4>
                      <p className="text-gray-400 text-sm">
                        {locationState.bookingType === 'seats' ? 'Reserved Seating' : 'General Admission'}
                      </p>
                      
                      {/* Show selected seats or tickets */}
                      {locationState.bookingType === 'seats' && locationState.selectedSeats && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">Selected Seats:</p>
                          <p className="text-white font-mono">
                            {locationState.selectedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}
                          </p>
                        </div>
                      )}

                      {locationState.selectedTickets && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">Tickets:</p>
                          {locationState.selectedTickets.map((ticket, index) => (
                            <div key={index} className="flex justify-between text-white text-sm">
                              <span>{ticket.quantity}x {ticket.name || ticket.type}</span>
                              <span>${formatPrice(ticket.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Food Items Summary */}
                  {selectedFoodItems.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                      <h4 className="text-white font-medium mb-3">Food & Beverages</h4>
                      {selectedFoodItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{item.quantity}x {item.name}</span>
                          <span className="text-white">${formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Tickets</span>
                      <span>${formatPrice(ticketTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Food & Beverages</span>
                      <span>${formatPrice(foodTotal)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Total</span>
                        <span className="text-primary">${formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={proceed}
                      className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Continue to Payment
                    </button>
                    
                    <button
                      onClick={() => navigate(-1)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodSelection;
