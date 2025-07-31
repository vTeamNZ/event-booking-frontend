import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { adminSeatService } from '../services/adminSeatService';
import { useAuth } from '../hooks/useAuth';
import { SeatSelectionState } from '../types/seatSelection';
import { SeatingLayoutV2, SeatingSelectionState } from '../components/seating-v2';
import { useBooking, useEventDetails } from '../contexts/BookingContext';
import { BookingData } from '../types/booking';
import { BookingFlowHelper } from '../utils/bookingFlowHelpers';
import { BookingNavigator } from '../utils/BookingNavigator';
import SEO from '../components/SEO';
import { createEventSlug, slugToSearchTerm } from '../utils/slugUtils';
import EventHero from '../components/EventHero';

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

const SeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const { fetchEventDetails, eventDetails } = useEventDetails();
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
      // Reduced notification frequency - visual feedback is primary
      
      // Force refresh of the seating layout component by incrementing the key
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error toggling seat availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update seat status');
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear any existing booking context to prevent cross-event contamination
        if (bookingDispatch) {
          bookingDispatch({ type: 'RESET' });
        }
        
        let eventData: Event;
        
        // If we have state from navigation, use it
        if (state?.eventId) {
          const response = await api.get<Event>(`/Events/${state.eventId}`);
          eventData = response.data;
        } 
        // Otherwise, try to load by title
        else if (eventTitle) {
          const searchTerm = slugToSearchTerm(eventTitle);
          const response = await api.get<Event>(`/Events/by-title/${encodeURIComponent(searchTerm)}`);
          eventData = response.data;
          
          // Verify the slug matches and redirect if needed
          const expectedSlug = createEventSlug(eventData.title);
          if (expectedSlug !== eventTitle) {
            navigate(`/event/${expectedSlug}/seats`, { 
              state: {
                eventId: eventData.id,
                eventTitle: eventData.title,
                eventPrice: eventData.price,
                eventDate: eventData.date,
                eventLocation: eventData.location,
                eventDescription: eventData.description,
                seatSelectionMode: eventData.seatSelectionMode,
              },
              replace: true 
            });
            return;
          }
        } 
        else {
          setError('Event ID not found. Please check the URL.');
          return;
        }
        
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
  }, [state?.eventId, eventTitle, navigate]);

  // Fetch event details for organizer information
  useEffect(() => {
    if (event?.id) {
      fetchEventDetails(event.id);
    }
  }, [event?.id, fetchEventDetails]);

  const handleSelectionComplete = (selectionState: SeatingSelectionState) => {
    // Create the simplified booking data format - no session storage needed
    const bookingData: BookingData = {
      eventId: event?.id || state?.eventId,
      eventTitle: event?.title || eventTitle || '',
      bookingType: 'seats' as const,
      totalAmount: selectionState.totalPrice,
      imageUrl: event?.imageUrl || `${process.env.PUBLIC_URL}/events/fallback.jpg`,
      selectedSeats: selectionState.selectedSeats.map(seat => ({
        id: seat.id, // Include seat ID for backend calls
        row: seat.row,
        number: seat.number,
        price: seat.price || 0,
        ticketTypeId: seat.ticketType?.id || 0,
        seatNumber: seat.seatNumber
      }))
    };
    
    // Create detailed seat information for the UI
    const seatTicketDetails: Array<{
      type: string;
      quantity: number;
      price: number;
      unitPrice: number;
    }> = [];
    
    // Group seats by ticket type for display
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
    
    // Add grouped seat details for display
    Object.values(seatsByTicketType).forEach(group => {
      seatTicketDetails.push({
        type: `${group.ticketTypeName} (${group.seatNumbers.join(', ')})`,
        quantity: group.count,
        price: group.totalPrice,
        unitPrice: group.totalPrice / group.count
      });
    });

    // Update booking context if available
    if (bookingDispatch) {
      try {
        bookingDispatch({
          type: 'UPDATE_SEATS',
          payload: bookingData.selectedSeats
        });
      } catch (e) {
        console.error('Failed to update booking context:', e);
      }
    }

    // Navigate to food selection with simplified state
    navigate('/food-selection', {
      state: {
        ...bookingData,
        ticketDetails: seatTicketDetails,
        fromSeatSelection: true
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event || isActive === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-warning text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {isActive === false ? 'Event No Longer Available' : 'Error'}
          </h1>
          <p className="text-gray-300 mb-6">
            {error || 'This event is no longer available for booking.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-black px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
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
      
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section - Prioritize fresh navigation state */}
        <div className="relative">
          <EventHero 
            title={event.title}
            imageUrl={event.imageUrl || eventDetails?.imageUrl}
            date={event.date}
            location={event.location}
            description={event.description}
            organizationName={eventDetails?.organizationName}
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
          
          {/* Admin Mode Indicator */}
          {isAdmin() && (
            <div className="absolute bottom-4 left-4 z-20">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                🔧 Admin Mode: Click red × to make seats unavailable, green ✓ to make available
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {state?.eventId ? (
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
              <div className="max-w-4xl mx-auto">
                {/* Event Details Section */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Your Seats</h2>
                </div>
                
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
            <div className="bg-error/20 text-error p-4 rounded-lg">
              Missing eventId in state. Please return to the events page and try again.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SeatSelectionPage;
