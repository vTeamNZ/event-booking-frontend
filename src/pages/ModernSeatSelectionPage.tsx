import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useIndustryStandardSeatSelection } from '../hooks/useIndustryStandardSeatSelection';
import { GlobalReservationTimer } from '../components/GlobalReservationTimer';
import { SeatingLayoutV2 } from '../components/seating-v2';
import { ShoppingCart, Users, Clock, DollarSign } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  price: number | null;
  imageUrl?: string;
  isActive?: boolean;
  seatSelectionMode?: number;
}

const ModernSeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const { isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // ✅ NEW: Industry Standard Seat Selection Hook
  const {
    selectedSeats,
    toggleSeatSelection,
    reserveSelection,
    releaseReservation,
    hasActiveReservation,
    isReserving,
    totalPrice,
    selectionCount,
    hasSelection
  } = useIndustryStandardSeatSelection({
    eventId: event?.id || 0,
    sessionId,
    // userId: user?.id (if you have user authentication)
  });

  // Load event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let eventData: Event;
        
        if (state?.eventId) {
          const response = await api.get<Event>(`/Events/${state.eventId}`);
          eventData = response.data;
        } else if (eventTitle) {
          const response = await api.get<Event>(`/Events/by-title/${encodeURIComponent(eventTitle)}`);
          eventData = response.data;
        } else {
          setError('Event ID not found. Please check the URL.');
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventTitle, state]);

  // ✅ NEW: Handle seat selection completion
  const handleSelectionComplete = (selectionState: any) => {
    console.log('🎯 Selection completed:', selectionState);
    // This callback is triggered when the seating component's internal selection changes
    // We can use this to sync with our industry-standard hook if needed
  };

  // ✅ NEW: Handle seat click (instant UI update, no API calls)
  const handleSeatClick = (seat: any) => {
    // Only allow selection if seat is available and we don't have an active reservation
    if (seat.status !== 'Available' && !selectedSeats.find(s => s.id === seat.id)) {
      toast.error('This seat is not available');
      return;
    }

    if (hasActiveReservation) {
      toast.error('You already have seats reserved. Complete your purchase or release them first.');
      return;
    }

    // ✅ INSTANT UI UPDATE - No loading, no API call
    toggleSeatSelection({
      id: seat.id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      number: seat.number,
      price: seat.price || 0,
      ticketTypeId: seat.ticketTypeId || 0,
      ticketTypeName: seat.ticketType?.name || 'General',
      ticketTypeColor: seat.ticketType?.color || '#3B82F6',
      status: seat.status
    });
  };

  // ✅ NEW: Proceed to checkout (single batch reservation)
  const handleProceedToCheckout = async () => {
    if (!hasSelection) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      console.log(`🎯 Proceeding to checkout with ${selectionCount} seats`);
      
      // ✅ Single API call to reserve all selected seats
      const reservation = await reserveSelection();
      
      toast.success(`${selectionCount} seat${selectionCount > 1 ? 's' : ''} reserved! You have 10 minutes to complete your purchase.`);
      
      // Navigate to checkout with reservation data
      navigate('/checkout', {
        state: {
          eventId: event?.id,
          eventTitle: event?.title,
          reservationId: reservation.reservationId,
          selectedSeats: reservation.reservedSeats,
          totalPrice: reservation.totalPrice,
          expiresAt: reservation.expiresAt,
          sessionId
        }
      });
    } catch (error: any) {
      console.error('❌ Checkout failed:', error);
      toast.error(error.message || 'Failed to reserve seats. Please try again.');
    }
  };

  // ✅ NEW: Handle timer expiry
  const handleTimerExpiry = () => {
    toast.error('Your seat reservation has expired. Please select your seats again.');
    // Optionally refresh the page or clear selection
    window.location.reload();
  };

  // ✅ NEW: Handle manual release
  const handleManualRelease = async () => {
    try {
      await releaseReservation();
      toast.success('Seats released successfully');
    } catch (error) {
      console.error('Release error:', error);
      toast.error('Failed to release seats');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ NEW: Global Timer Component */}
      <GlobalReservationTimer 
        sessionId={sessionId}
        onExpiry={handleTimerExpiry}
        onRelease={handleManualRelease}
      />

      {/* Event Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span>{event.location}</span>
              </div>
            </div>
            
            {/* Selection Summary */}
            {hasSelection && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-blue-700">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-semibold">
                      {selectionCount} seat{selectionCount > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="container mx-auto px-4 py-8">
        <SeatingLayoutV2
          eventId={event.id}
          onSelectionComplete={handleSelectionComplete}
          isAdmin={isAdmin()}
          maxSeats={10}
          showLegend={true}
        />
      </div>

      {/* ✅ NEW: Fixed Bottom Bar with Continue Button */}
      {hasSelection && !hasActiveReservation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {selectionCount} seat{selectionCount > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-1" />
                  <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Clear selection (no API call)
                    selectedSeats.forEach(seat => toggleSeatSelection(seat));
                    toast.success('Selection cleared');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Selection
                </button>
                
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isReserving}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isReserving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Reserving...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Continue to Checkout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info for reserved seats */}
      {hasActiveReservation && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-100 border-t border-green-300 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center">
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
                <span className="font-medium">
                  ✅ Seats Reserved - Complete your purchase before the timer expires
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSeatSelectionPage;
