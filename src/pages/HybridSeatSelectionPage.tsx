import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { adminSeatService } from '../services/adminSeatService';
import { useAuth } from '../hooks/useAuth';
import { SeatingLayoutV2, SeatingSelectionState, GeneralTicketSelection } from '../components/seating-v2';
import GeneralAdmissionTickets from '../components/GeneralAdmissionTickets';
import { useBooking, useEventDetails } from '../contexts/BookingContext';
import { BookingData } from '../types/booking';
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

const HybridSeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const { fetchEventDetails, eventDetails } = useEventDetails();
  const [event, setEvent] = useState<Event | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hybrid selection state
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [selectedStandingTickets, setSelectedStandingTickets] = useState<GeneralTicketSelection[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [clearStandingTickets, setClearStandingTickets] = useState(false);
  
  // Get booking context if available
  const { state: bookingState, dispatch: bookingDispatch } = useBooking() ?? {};
  
  // Get admin status from auth hook
  const { isAdmin } = useAuth();

  // Handler for admin seat toggle
  const handleAdminSeatToggle = async (seatId: number) => {
    try {
      await adminSeatService.toggleSeatAvailability(seatId);
      // Force refresh of the seating layout component
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling seat availability:', error);
      toast.error('Failed to update seat availability');
    }
  };

  // Load event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        let eventData: Event;

        if (state?.eventId) {
          const response = await api.get<Event>(`/Events/${state.eventId}`);
          eventData = response.data;
        } else if (eventTitle) {
          const searchTerm = slugToSearchTerm(eventTitle);
          const response = await api.get<Event[]>('/Events');
          const events = response.data;
          const foundEvent = events.find(e => 
            createEventSlug(e.title) === eventTitle || 
            e.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (!foundEvent) {
            setError('Event not found');
            return;
          }
          eventData = foundEvent;
        } else {
          setError('Event ID not found. Please check the URL.');
          return;
        }

        setEvent(eventData);
        
        // Check if event is active
        if (eventData.date) {
          const eventDate = new Date(eventData.date);
          const now = new Date();
          setIsActive(eventDate > now);
        } else {
          setIsActive(true);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
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

  // Restore previous selections from BookingContext when navigating back
  useEffect(() => {
    if (bookingState?.bookingData) {
      const bookingData = bookingState.bookingData;
      
      // Restore selected seats
      if (bookingData.selectedSeats && bookingData.selectedSeats.length > 0) {
        setSelectedSeats(bookingData.selectedSeats.map(seat => ({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          price: seat.price,
          seatNumber: seat.seatNumber,
          ticketType: { id: seat.ticketTypeId }
        })));
      }
      
      // Restore selected standing tickets
      if (bookingData.selectedTickets && bookingData.selectedTickets.length > 0) {
        setSelectedStandingTickets(bookingData.selectedTickets.map(ticket => ({
          ticketType: {
            id: ticket.ticketTypeId,
            name: ticket.name,
            price: ticket.price / ticket.quantity,
            type: ticket.type
          },
          quantity: ticket.quantity
        })));
      }
      
      // Update total price
      const seatsPrice = bookingData.selectedSeats?.reduce((sum, seat) => sum + seat.price, 0) || 0;
      const ticketsPrice = bookingData.selectedTickets?.reduce((sum, ticket) => sum + ticket.price, 0) || 0;
      setTotalPrice(seatsPrice + ticketsPrice);
    }
  }, [bookingState?.bookingData]);

  // Handle seated ticket selection completion
  const handleSeatedTicketSelection = (selectionState: SeatingSelectionState) => {
    console.log('🪑 HybridSeatSelectionPage - handleSeatedTicketSelection called with:', selectionState);
    setSelectedSeats(selectionState.selectedSeats);
    updateTotalPrice(selectionState.selectedSeats, selectedStandingTickets);
  };

  // Monitor selectedSeats state changes and log them
  useEffect(() => {
    console.log('🪑 HybridSeatSelectionPage - selectedSeats state changed:', selectedSeats);
  }, [selectedSeats]);

  // Handle standing ticket selection
  const handleStandingTicketSelection = (selections: GeneralTicketSelection[]) => {
    setSelectedStandingTickets(selections);
    updateTotalPrice(selectedSeats, selections);
  };

  // Update total price calculation
  const updateTotalPrice = (seats: any[], standingTickets: GeneralTicketSelection[]) => {
    const seatsPrice = seats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    const standingPrice = standingTickets.reduce((sum, ticket) => sum + (ticket.quantity * ticket.ticketType.price), 0);
    setTotalPrice(seatsPrice + standingPrice);
  };

  // Handle proceeding to checkout
  const handleProceedToCheckout = () => {
    console.log('🚀 HybridSeatSelectionPage - handleProceedToCheckout called!');
    console.log('🚀 Current selectedSeats state:', selectedSeats);
    console.log('🚀 Current selectedStandingTickets state:', selectedStandingTickets);
    
    if (selectedSeats.length === 0 && selectedStandingTickets.length === 0) {
      toast.error('Please select at least one seat or standing ticket');
      return;
    }

    // Create standard booking data structure
    const bookingData: BookingData = {
      eventId: event?.id || state?.eventId,
      eventTitle: event?.title || eventTitle || '',
      bookingType: selectedSeats.length > 0 ? 'seats' : 'tickets', // Dynamic based on selection
      totalAmount: totalPrice,
      imageUrl: event?.imageUrl || `${process.env.PUBLIC_URL}/events/fallback.jpg`,
      selectedSeats: selectedSeats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        price: seat.price || 0,
        ticketTypeId: seat.ticketType?.id || 0,
        seatNumber: seat.seatNumber
      })),
      selectedTickets: selectedStandingTickets.map(ticket => ({
        ticketTypeId: ticket.ticketType.id,
        quantity: ticket.quantity,
        price: ticket.quantity * ticket.ticketType.price,
        name: ticket.ticketType.name,
        type: ticket.ticketType.type
      }))
    };

    console.log('🎯 HybridSeatSelectionPage - Proceeding to food selection with data:', {
      selectedSeats: selectedSeats,
      selectedStandingTickets: selectedStandingTickets,
      finalBookingData: bookingData
    });

    // Update booking context if available
    if (bookingDispatch) {
      try {
        // Set complete booking data in context
        bookingDispatch({
          type: 'SET_BOOKING_DATA',
          payload: bookingData
        });
      } catch (e) {
        console.error('Failed to update booking context:', e);
      }
    }

    // Navigate to food selection with standard BookingData structure
    navigate('/food-selection', {
      state: {
        ...bookingData,
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
        title={`Select Tickets - ${event.title}`}
        description={`Choose your seats and standing tickets for ${event.title}. Secure your preferred options and complete your booking.`}
        image={event.imageUrl}
      />
      
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section */}
        <div className="relative">
          <EventHero 
            title={event.title}
            imageUrl={event.imageUrl || eventDetails?.imageUrl}
            date={event.date}
            location={event.location}
            description={event.description}
            organizationName={eventDetails?.organizationName || (event as any)?.organizer?.organizationName || (event as any)?.organizer?.name}
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
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="max-w-6xl mx-auto">
              {/* Page Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-2">Choose Your Experience</h2>
                <p className="text-gray-300">Select from available seated tickets or standing tickets</p>
              </div>
              
              {/* Hybrid Selection Layout - Streamlined */}
              <div className="space-y-6">
                {/* Seated Tickets Section with Integrated Standing Tickets */}
                <SeatingLayoutV2 
                  key={`seated-${refreshKey}`}
                  eventId={state?.eventId || event?.id}
                  onSelectionComplete={handleSeatedTicketSelection}
                  maxSeats={8}
                  showLegend={true}
                  showSummary={true}
                  className="seating-layout-container"
                  isAdmin={isAdmin()}
                  onAdminToggle={handleAdminSeatToggle}
                  standingTickets={selectedStandingTickets}
                  onClearStandingTickets={() => {
                    setSelectedStandingTickets([]);
                    setClearStandingTickets(true);
                    // Reset the clear flag after a short delay to allow the component to process it
                    setTimeout(() => setClearStandingTickets(false), 100);
                  }}
                  onProceed={handleProceedToCheckout}
                  standingTicketsComponent={
                    <GeneralAdmissionTickets
                      eventId={state?.eventId || event?.id}
                      onTicketChange={handleStandingTicketSelection}
                      standingOnly={true}
                      embedded={true}
                      clearSelections={clearStandingTickets}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HybridSeatSelectionPage;
