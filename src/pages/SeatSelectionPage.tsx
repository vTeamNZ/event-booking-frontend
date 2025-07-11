import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { adminSeatService } from '../services/adminSeatService';
import { useAuth } from '../hooks/useAuth';
import { SeatSelectionState } from '../types/seatSelection';
import { SeatingLayoutV2, SeatingSelectionState } from '../components/seating-v2';
import TicketTypeDisplay from '../components/TicketTypeDisplay';
import { useBooking } from '../contexts/BookingContext';
import { BookingData } from '../types/booking';
import { BookingFlowHelper } from '../utils/bookingFlowHelpers';
import { BookingNavigator } from '../utils/BookingNavigator';
import SEO from '../components/SEO';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  isActive?: boolean;
  seatSelectionMode?: number;
}

const SeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get booking context if available - use optional chaining to handle when context is not available
  const { dispatch: bookingDispatch } = useBooking() ?? {};
  
  // Get admin status from auth hook
  const { isAdmin } = useAuth();

  // Handler for admin seat toggle
  const handleAdminSeatToggle = async (seatId: number) => {
    try {
      const result = await adminSeatService.toggleSeatAvailability(seatId);
      toast.success(`Seat status updated to ${result.newStatus}`);
      
      // Force refresh of the seating layout component by incrementing the key
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error toggling seat availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update seat status');
    }
  };

  useEffect(() => {
    if (!state?.eventId) {
      navigate('/');
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get<Event>(`/api/Events/${state.eventId}`);
        
        const eventData = response.data;
        setEvent(eventData);
        
        const active = new Date(eventData.date) > new Date();
        setIsActive(active);
        
        if (!active) {
          setError('This event has already passed and is no longer available for booking.');
          setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [state?.eventId, navigate, eventTitle]);

  const handleSelectionComplete = (selectionState: SeatingSelectionState) => {
    // For backward compatibility - convert to old format
    const oldFormatState: SeatSelectionState = {
      mode: selectionState.mode as any, // Type conversion needed between enums
      selectedSeats: selectionState.selectedSeats.map(selectedSeat => ({
        seat: {
          id: selectedSeat.id,
          seatNumber: selectedSeat.seatNumber,
          row: selectedSeat.row,
          number: selectedSeat.number,
          x: selectedSeat.x,
          y: selectedSeat.y,
          width: selectedSeat.width,
          height: selectedSeat.height,
          price: selectedSeat.price || 0,
          status: selectedSeat.status,
          ticketTypeId: selectedSeat.ticketType?.id,
          ticketType: selectedSeat.ticketType && {
            id: selectedSeat.ticketType.id,
            type: selectedSeat.ticketType.type,
            name: selectedSeat.ticketType.name,
            price: selectedSeat.ticketType.price,
            color: selectedSeat.ticketType.color,
            description: selectedSeat.ticketType.description,
            eventId: selectionState.eventId
          }
        }
      })),
      selectedTables: [], // Tables no longer used
      generalTickets: selectionState.generalTickets.map(ticket => ({
        ticketType: {
          id: ticket.id,
          type: ticket.type,
          name: ticket.name || ticket.type,  // Fallback to type if name is not available
          price: ticket.price,
          color: ticket.color,
          description: ticket.description,
          eventId: selectionState.eventId
        },
        quantity: 1 // Default to 1 since we're handling individual seats
      })),
      totalPrice: selectionState.totalPrice,
      sessionId: selectionState.sessionId
    };

    // Create the unified booking data format
    const bookingData: BookingData = {
      eventId: event?.id || state?.eventId,
      eventTitle: event?.title || eventTitle || '',
      bookingType: 'seats' as const,
      totalAmount: selectionState.totalPrice,
      selectedSeats: selectionState.selectedSeats.map(seat => ({
        row: seat.row,
        number: seat.number,
        price: seat.price || 0,
        ticketTypeId: seat.ticketType?.id || 0,
        seatNumber: seat.seatNumber
      }))
    };
    
    // Also create a compatible ticketDetails array for legacy support
    const seatTicketDetails: Array<{
      type: string;
      quantity: number;
      price: number;
      unitPrice: number;
    }> = [];
    // Group seats by ticket type
    const seatsByTicketType = selectionState.selectedSeats.reduce((acc, seat) => {
      const typeKey = seat.ticketType?.id?.toString() || 'default';
      if (!acc[typeKey]) {
        acc[typeKey] = {
          ticketTypeId: seat.ticketType?.id || 0,
          ticketTypeName: seat.ticketType?.name || 'Standard Seat',
          count: 0,
          totalPrice: 0,
          seatNumbers: []
        };
      }
      acc[typeKey].count++;
      acc[typeKey].totalPrice += seat.price || 0;
      acc[typeKey].seatNumbers.push(`${seat.row}${seat.number}`);
      return acc;
    }, {} as Record<string, { ticketTypeId: number, ticketTypeName: string, count: number, totalPrice: number, seatNumbers: string[] }>);
    
    // Add this to our booking data for compatibility
    Object.values(seatsByTicketType).forEach(group => {
      seatTicketDetails.push({
        type: `${group.ticketTypeName} (${group.seatNumbers.join(', ')})`,
        quantity: group.count,
        price: group.totalPrice,
        unitPrice: group.totalPrice / group.count
      });
    });

    // We now pass this information directly to the BookingNavigator
    // so we don't need a separate navigationState variable

    // Use context API if available
    if (bookingDispatch) {
      try {
        bookingDispatch({
          type: 'UPDATE_SEATS',
          payload: bookingData.selectedSeats
        });
      } catch (e) {
        // Silent fallback to direct navigation
        console.error('Failed to update booking context:', e);
      }
    }

    // Navigate to food selection using our navigator
    BookingNavigator.toFoodSelection(navigate, bookingData, {
      ticketDetails: seatTicketDetails,
      seatSelection: oldFormatState,
      fromSeatSelection: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event || isActive === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isActive === false ? 'Event No Longer Available' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This event is no longer available for booking.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Select Seats - ${event.title}`}
        description={`Choose your seats for ${event.title}. Secure your preferred seating and complete your booking.`}
        image={event.imageUrl}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
                >
                  ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <span>📅 {new Date(event.date).toLocaleDateString('en-NZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  <span>📍 {event.location}</span>
                </div>
                {/* Admin indicator */}
                {isAdmin() && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🔧 Admin Mode: Click red × to make seats unavailable (invisible to users), green ✓ to make available
                    </span>
                  </div>
                )}
              </div>
              
              {event.imageUrl && (
                <div className="hidden lg:block">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-32 h-20 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Make sure we have a valid eventId */}
          {state?.eventId ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-4xl mx-auto">
                {/* Ticket Types Display */}
                <div className="mb-6">
                  <TicketTypeDisplay eventId={state.eventId} />
                </div>
                
                {/* New Seating Layout System V2 */}
                <SeatingLayoutV2 
                  key={refreshKey}
                  eventId={state.eventId}
                  onSelectionComplete={handleSelectionComplete}
                  maxSeats={8}
                  showLegend={true}
                  className="seating-layout-container"
                  isAdmin={isAdmin()}
                  onAdminToggle={handleAdminSeatToggle}
                />
              </div>
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              Missing eventId in state. Please return to the events page and try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              Need help? Contact our support team at support@example.com
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeatSelectionPage;
