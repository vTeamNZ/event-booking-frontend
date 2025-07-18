import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const { eventTitle } = useParams();
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
      <div className="min-h-screen bg-gray-50">
        {/* Event Hero Section */}
        <div className="relative">
          <EventHero 
            title={locationState?.eventTitle || 'Event Food Selection'}
            imageUrl={locationState?.imageUrl}
            description="Select food and beverages for your event"
            className="h-[300px]"
          />
          
          {/* Back Button Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Food Items</h1>
              <p className="text-sm text-gray-500">Optional - Select any food items you'd like to add to your order</p>
              
              {/* Booking Summary */}
              {locationState && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-1">Your Selection:</h3>
                  {locationState.bookingType === 'seats' && locationState.selectedSeats && (
                    <p className="text-sm text-gray-600">
                      Seats: {locationState.selectedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}
                    </p>
                  )}
                  {locationState.bookingType === 'tickets' && locationState.selectedTickets && (
                    <div className="text-sm text-gray-600">
                      {locationState.selectedTickets.map(ticket => (
                        <p key={ticket.ticketTypeId}>
                          {ticket.name}: {ticket.quantity} × ${formatPrice(ticket.price)}
                        </p>
                      ))}
                    </div>
                  )}
                  {locationState.ticketDetails && !locationState.bookingType && (
                    <div className="text-sm text-gray-600">
                      {locationState.ticketDetails.map((ticket, index) => (
                        <p key={index}>
                          {ticket.type}: {ticket.quantity} × ${formatPrice(ticket.unitPrice)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                        ${formatPrice(item.price)}
                      </div>
                    </div>              <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleQtyChange(item.id, -1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          item.price === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
                        }`}
                        disabled={quantities[item.id] === 0 || item.price === 0}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">
                        {quantities[item.id] || 0}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(item.id, 1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          item.price === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary text-white hover:bg-red-600'
                        }`}
                        disabled={item.price === 0}
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
                  <span>${formatPrice(ticketTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Food Total</span>
                  <span>${formatPrice(foodTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>Grand Total</span>
                  <span>${formatPrice(grandTotal)}</span>
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
                </button>        </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodSelection;
