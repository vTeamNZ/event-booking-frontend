import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FoodItem, getFoodItemsForEvent } from '../services/foodItemService';
import { BookingData } from '../types/booking';
import { useEventDetails } from '../contexts/BookingContext';
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

// Individual seat/ticket representation for food selection
interface SeatTicketItem {
  id: string;
  displayName: string;
  type: 'seat' | 'ticket';
  ticketType: string;
  price: number;
  foodSelections: Record<number, number>; // foodItemId -> quantity
}

// Enhanced food selection with per-seat/ticket functionality
const FoodSelectionEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { fetchEventDetails, eventDetails } = useEventDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [seatTicketItems, setSeatTicketItems] = useState<SeatTicketItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [globalFoodMode, setGlobalFoodMode] = useState(false);
  const [globalSelections, setGlobalSelections] = useState<Record<number, number>>({});

  const locationState = state as EnhancedLocationState;

  // Check for direct page access
  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }
  }, [state, navigate]);

  // Fetch event details for organizer information
  useEffect(() => {
    if (locationState?.eventId) {
      // Clear any cached event details if this is a different event
      if (eventDetails && eventDetails.organizationName) {
        // We have cached data, but need to verify it's for the right event
        // For now, always fetch fresh data to avoid stale cache issues
      }
      fetchEventDetails(locationState.eventId);
    }
  }, [locationState?.eventId, fetchEventDetails]);

  // Initialize seat/ticket items for food selection
  useEffect(() => {
    if (!locationState) return;

    const items: SeatTicketItem[] = [];

    // Handle allocated seating mode
    if (locationState.bookingType === 'seats' && locationState.selectedSeats) {
      locationState.selectedSeats.forEach((seat, index) => {
        items.push({
          id: `seat-${seat.row}-${seat.number}`,
          displayName: `Seat ${seat.row}${seat.number}`,
          type: 'seat',
          ticketType: 'Standard', // Default since ticketTypeName not available in current type
          price: seat.price || 0,
          foodSelections: {}
        });
      });
    }
    // Handle general admission tickets
    else if (locationState.bookingType === 'tickets' && locationState.selectedTickets) {
      locationState.selectedTickets.forEach((ticket) => {
        // Create individual entries for each ticket in the quantity
        for (let i = 1; i <= ticket.quantity; i++) {
          items.push({
            id: `ticket-${ticket.type}-${i}`,
            displayName: `${ticket.type} Ticket #${i}`,
            type: 'ticket',
            ticketType: ticket.type,
            price: ticket.price / ticket.quantity, // Unit price per ticket
            foodSelections: {}
          });
        }
      });
    }
    // Legacy ticket flow support
    else if (locationState.ticketDetails) {
      locationState.ticketDetails.forEach((ticket) => {
        for (let i = 1; i <= ticket.quantity; i++) {
          items.push({
            id: `legacy-${ticket.type}-${i}`,
            displayName: `${ticket.type} #${i}`,
            type: 'ticket',
            ticketType: ticket.type,
            price: ticket.unitPrice,
            foodSelections: {}
          });
        }
      });
    }

    setSeatTicketItems(items);
    // Auto-expand first item for better UX
    if (items.length > 0) {
      setExpandedItems(new Set([items[0].id]));
    }
  }, [locationState]);

  // Fetch food items and auto-add free items
  useEffect(() => {
    const fetchFoodItems = async () => {
      if (!locationState?.eventId) return;
      try {
        const items = await getFoodItemsForEvent(locationState.eventId);
        setFoodItems(items);
        
        // Auto-add free items (price === 0) to all seats/tickets
        const freeItems = items.filter(item => item.price === 0);
        if (freeItems.length > 0) {
          setSeatTicketItems(prev => prev.map(seatTicket => {
            const updatedSelections = { ...seatTicket.foodSelections };
            freeItems.forEach(freeItem => {
              updatedSelections[freeItem.id] = 1; // Add 1 free item per seat/ticket
            });
            return {
              ...seatTicket,
              foodSelections: updatedSelections
            };
          }));
        }
        
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

  // Handle individual seat/ticket food selection
  const handleFoodChange = (itemId: string, foodId: number, delta: number) => {
    // Check if this food item is free (price === 0) and prevent modification
    const foodItem = foodItems.find(f => f.id === foodId);
    if (foodItem && foodItem.price === 0) {
      return; // Don't allow changes to free items
    }

    setSeatTicketItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const currentQty = item.foodSelections[foodId] || 0;
        const newQty = Math.max(0, currentQty + delta);
        return {
          ...item,
          foodSelections: {
            ...item.foodSelections,
            [foodId]: newQty
          }
        };
      }
      return item;
    }));
  };

  // Handle global food selection (apply to all seats/tickets)
  const handleGlobalFoodChange = (foodId: number, delta: number) => {
    const newQty = Math.max(0, (globalSelections[foodId] || 0) + delta);
    setGlobalSelections(prev => ({
      ...prev,
      [foodId]: newQty
    }));
  };

  // Apply global selections to all items
  const applyGlobalSelections = () => {
    setSeatTicketItems(prev => prev.map(item => {
      const newSelections = { ...globalSelections };
      
      // Preserve free items (price === 0) - don't override them
      foodItems.forEach(food => {
        if (food.price === 0) {
          newSelections[food.id] = item.foodSelections[food.id] || 1; // Keep free items at 1
        }
      });
      
      return {
        ...item,
        foodSelections: newSelections
      };
    }));
    setGlobalFoodMode(false);
  };

  // Clear all food selections
  const clearAllSelections = () => {
    setSeatTicketItems(prev => prev.map(item => {
      const clearedSelections: Record<number, number> = {};
      
      // Keep free items (price === 0) - don't clear them
      foodItems.forEach(food => {
        if (food.price === 0) {
          clearedSelections[food.id] = 1; // Keep free items at 1
        }
      });
      
      return {
        ...item,
        foodSelections: clearedSelections
      };
    }));
    setGlobalSelections({});
  };

  // Toggle expanded state
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Expand/collapse all
  const toggleAllExpanded = () => {
    if (expandedItems.size === seatTicketItems.length) {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set(seatTicketItems.map(item => item.id)));
    }
  };

  // Calculate totals
  const ticketTotal = seatTicketItems.reduce((sum, item) => sum + item.price, 0);
  const foodTotal = seatTicketItems.reduce((sum, item) => {
    return sum + foodItems.reduce((foodSum, food) => {
      const qty = item.foodSelections[food.id] || 0;
      return foodSum + (qty * food.price);
    }, 0);
  }, 0);
  const grandTotal = ticketTotal + foodTotal;

  // Get total food quantity across all seats/tickets
  const getTotalFoodQuantity = (foodId: number): number => {
    return seatTicketItems.reduce((sum, item) => sum + (item.foodSelections[foodId] || 0), 0);
  };

  // Check if any food items are selected
  const hasFoodSelections = seatTicketItems.some(item => 
    Object.values(item.foodSelections).some(qty => qty > 0)
  );

  const proceed = () => {
    if (!locationState) {
      console.error('Missing location state in FoodSelection');
      navigate('/');
      return;
    }

    // 🎯 NEW: Create individual food selections per seat/ticket
    const individualFoodSelections: Array<{
      foodItemId: number;
      name: string;
      quantity: number;
      price: number;
      totalPrice: number;
      seatTicketId: string; // Associate with specific seat/ticket
      seatTicketType: 'seat' | 'ticket';
    }> = [];

    // Process each seat/ticket's individual food selections
    seatTicketItems.forEach(item => {
      Object.entries(item.foodSelections).forEach(([foodIdStr, quantity]) => {
        if (quantity > 0) {
          const foodId = parseInt(foodIdStr);
          const food = foodItems.find(f => f.id === foodId);
          if (food) {
            individualFoodSelections.push({
              foodItemId: food.id,
              name: food.name,
              quantity: quantity,
              price: food.price,
              totalPrice: quantity * food.price,
              seatTicketId: item.id,
              seatTicketType: item.type
            });
          }
        }
      });
    });

    console.log('🍕 Individual Food Selections:', individualFoodSelections);

    // Prepare enhanced booking data with individual food selections
    const enhancedBookingData: BookingData = {
      eventId: locationState.eventId,
      eventTitle: locationState.eventTitle,
      imageUrl: locationState.imageUrl,
      bookingType: locationState.bookingType || 'tickets',
      totalAmount: grandTotal,
      selectedSeats: locationState.selectedSeats,
      selectedTickets: locationState.selectedTickets,
      selectedFoodItems: individualFoodSelections // Now contains individual selections
    };

    navigate('/payment', { state: enhancedBookingData });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-8 mt-6 border border-yellow-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-8 mt-6 border border-yellow-500/20">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold mb-2">Error Loading Food Options</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 border border-gray-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle case when no food items are available
  if (foodItems.length === 0 && !loading) {
    return (
      <>
        <SEO 
          title="Food Selection - Individual Orders" 
          description="Select food and beverages for each seat or ticket. Customize your dining experience with per-person food ordering." 
          keywords={["Food Selection", "Per-Seat Food", "Event Catering", "Individual Food Orders"]}
        />
        
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-8 mt-6 border border-yellow-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Food & Beverage Selection</h1>
            <h2 className="text-xl text-gray-300 mb-4">{locationState?.eventTitle}</h2>
          </div>

          {/* No Food Available Message */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 text-center border border-gray-600">
            <div className="text-6xl mb-4">🍿</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">No Food & Beverages Available</h3>
            <p className="text-gray-300 text-lg mb-6">
              The organizer hasn't provided any food or beverage options for this event.
            </p>
            <p className="text-gray-400 mb-8">
              You can proceed directly to payment for your {seatTicketItems[0]?.type === 'seat' ? 'seats' : 'tickets'}.
            </p>
            
            {/* Total Summary */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-600">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Tickets Total ({seatTicketItems.length} {seatTicketItems[0]?.type === 'seat' ? 'seats' : 'tickets'})</span>
                  <span>${ticketTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-yellow-400 pt-3 border-t border-gray-600">
                  <span>Total</span>
                  <span>${ticketTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200 flex items-center font-medium border border-gray-500"
              >
                <span className="mr-2">←</span> Back
              </button>

              <button
                onClick={proceed}
                className="flex-1 px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200 flex items-center justify-center font-bold shadow-lg"
              >
                Continue to Payment <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Food Selection - Individual Orders" 
        description="Select food and beverages for each seat or ticket. Customize your dining experience with per-person food ordering." 
        keywords={["Food Selection", "Per-Seat Food", "Event Catering", "Individual Food Orders"]}
      />
      
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section - Prioritize fresh navigation state over cached context */}
        <EventHero 
          title={locationState?.eventTitle || 'Food Selection'}
          imageUrl={locationState?.imageUrl || eventDetails?.imageUrl}
          description="Select food and beverages for your seats"
          organizationName={eventDetails?.organizationName}
          className="mb-8"
        />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-8 border border-yellow-500/20">
            {/* Header */}
            <div className="border-b border-gray-600 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Food & Beverage Selection</h1>
              <h2 className="text-xl text-gray-300 mb-4">{locationState?.eventTitle}</h2>
              <p className="text-gray-400">
                Select food and beverages for each {seatTicketItems[0]?.type === 'seat' ? 'seat' : 'ticket'}. 
                You can order different items for each person.
              </p>
            </div>

        {/* Control Bar */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setGlobalFoodMode(!globalFoodMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  globalFoodMode 
                    ? 'bg-yellow-600 text-black' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-500'
                }`}
              >
                🍽️ Order Same for All
              </button>
              <button
                onClick={toggleAllExpanded}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 font-medium border border-gray-500"
              >
                {expandedItems.size === seatTicketItems.length ? 'Collapse All' : 'Expand All'}
              </button>
              <button
                onClick={clearAllSelections}
                className="px-4 py-2 rounded-lg bg-red-900 text-red-200 hover:bg-red-800 font-medium border border-red-700"
              >
                Clear All
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {seatTicketItems.length} {seatTicketItems[0]?.type === 'seat' ? 'seats' : 'tickets'} • 
              {foodItems.length} food options available
            </div>
          </div>
        </div>

        {/* Global Food Selection Mode */}
        {globalFoodMode && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Order Same Food for Everyone</h3>
              <button
                onClick={() => setGlobalFoodMode(false)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {foodItems.map((food) => {
                const isFree = food.price === 0;
                return (
                  <div key={food.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-200">{food.name}</h4>
                        <p className="text-sm text-gray-400">{food.description}</p>
                        {isFree ? (
                          <div className="flex items-center space-x-2">
                            <p className="text-green-400 font-bold">Complimentary</p>
                            <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                              Auto-included
                            </span>
                          </div>
                        ) : (
                          <p className="text-yellow-400 font-bold">${food.price.toFixed(2)}</p>
                        )}
                      </div>
                      {!isFree && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleGlobalFoodChange(food.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-200 flex items-center justify-center border border-gray-500"
                            disabled={(globalSelections[food.id] || 0) === 0}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-200">
                            {globalSelections[food.id] || 0}
                          </span>
                          <button
                            onClick={() => handleGlobalFoodChange(food.id, 1)}
                            className="w-8 h-8 rounded-full bg-yellow-600 text-black hover:bg-yellow-500 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                      {isFree && (
                        <div className="text-center">
                          <span className="text-sm text-gray-400">Auto-added to all</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={applyGlobalSelections}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-yellow-400 font-bold"
            >
              Apply to All {seatTicketItems.length} {seatTicketItems[0]?.type === 'seat' ? 'Seats' : 'Tickets'}
            </button>
          </div>
        )}

        {/* Individual Seat/Ticket Food Selection */}
        <div className="space-y-4 mb-8">
          {seatTicketItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const itemFoodTotal = foodItems.reduce((sum, food) => {
              const qty = item.foodSelections[food.id] || 0;
              return sum + (qty * food.price);
            }, 0);
            const hasSelections = Object.values(item.foodSelections).some(qty => qty > 0);

            return (
              <div 
                key={item.id} 
                className={`border rounded-lg transition-all duration-200 ${
                  hasSelections ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20' : 'border-gray-600 bg-gray-800'
                }`}
              >
                {/* Item Header */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-700/50"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      item.type === 'seat' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-purple-600 to-purple-500'
                    }`}>
                      {item.type === 'seat' ? '🪑' : '🎫'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200">{item.displayName}</h3>
                      <p className="text-sm text-gray-400">{item.ticketType} • ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {hasSelections && (
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Food Total</p>
                        <p className="font-bold text-yellow-400">${itemFoodTotal.toFixed(2)}</p>
                      </div>
                    )}
                    <button className={`transform transition-transform duration-200 text-gray-400 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </button>
                  </div>
                </div>

                {/* Expanded Food Selection */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-600 bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {foodItems.map((food) => {
                        const quantity = item.foodSelections[food.id] || 0;
                        const itemTotal = quantity * food.price;
                        const isFree = food.price === 0;

                        return (
                          <div key={food.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-200">{food.name}</h4>
                                <p className="text-sm text-gray-400 mb-2">{food.description}</p>
                                {isFree ? (
                                  <div className="flex items-center space-x-2">
                                    <p className="text-green-400 font-bold">Complimentary</p>
                                    <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                                      Auto-included
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-yellow-400 font-bold">${food.price.toFixed(2)} each</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {isFree ? (
                                <div className="flex items-center justify-center w-full">
                                  <div className="text-center">
                                    {/* Removed "Included with your order" and quantity display for free items to give organizers more freedom */}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleFoodChange(item.id, food.id, -1)}
                                      className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-200 flex items-center justify-center border border-gray-500"
                                      disabled={quantity === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-semibold text-gray-200">{quantity}</span>
                                    <button
                                      onClick={() => handleFoodChange(item.id, food.id, 1)}
                                      className="w-8 h-8 rounded-full bg-yellow-600 text-black hover:bg-yellow-500 flex items-center justify-center"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-yellow-400">${itemTotal.toFixed(2)}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Food Summary */}
        {hasFoodSelections && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Food Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodItems.map((food) => {
                const totalQty = getTotalFoodQuantity(food.id);
                if (totalQty === 0) return null;
                
                return (
                  <div key={food.id} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <h4 className="font-semibold text-gray-200">{food.name}</h4>
                    <p className="text-sm text-gray-400">
                      {totalQty}x ${food.price.toFixed(2)} = ${(totalQty * food.price).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Tickets Total ({seatTicketItems.length} {seatTicketItems[0]?.type === 'seat' ? 'seats' : 'tickets'})</span>
              <span>${ticketTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Food & Beverages</span>
              <span>${foodTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-yellow-400 pt-3 border-t border-gray-600">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200 flex items-center font-medium border border-gray-500"
          >
            <span className="mr-2">←</span> Back
          </button>

          <button
            onClick={proceed}
            className="flex-1 px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200 flex items-center justify-center font-bold shadow-lg"
          >
            Continue to Payment <span className="ml-2">→</span>
          </button>
        </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodSelectionEnhanced;
