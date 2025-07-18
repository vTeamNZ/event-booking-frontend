import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { TicketType, TicketTypeDisplay, getTicketTypesForEvent } from '../services/ticketTypeService';
import { useBooking } from '../contexts/BookingContext';
import { BookingNavigator } from '../utils/BookingNavigator';
import { BookingData } from '../types/booking';
import SEO from '../components/SEO';
import EventStructuredData from '../components/SEO/EventStructuredData';
import { toast } from 'react-hot-toast';
import { createEventSlug, slugToSearchTerm } from '../utils/slugUtils';
import EventHero from '../components/EventHero';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
  seatSelectionMode?: number;
  venueId?: number | null;
  venue?: {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    layoutType: string;
    capacity: number;
  } | null;
}

interface TicketDetail {
  ticketTypeId: number;
  type: string;
  name: string;
  quantity: number;
  price: number;
  unitPrice: number;
}

// Constants for seat selection modes
const SEAT_SELECTION_MODE = {
  EVENT_HALL: 1,
  TABLE_SEATING: 2,
  GENERAL_ADMISSION: 3
}

const TicketSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventTitle } = useParams();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeDisplay[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [eventSeatSelectionMode, setEventSeatSelectionMode] = useState<number>(SEAT_SELECTION_MODE.GENERAL_ADMISSION);
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<TicketDetail[]>([]);
  
  const { state: bookingState, dispatch } = useBooking() ?? { state: null, dispatch: () => {} };

  // Handle event loading and initialization
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
            navigate(`/event/${expectedSlug}/tickets`, { 
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
          navigate('/');
          return;
        }
        
        setEvent(eventData);
        
        // Check if event is today or in the future (same logic as backend)
        const today = new Date();
        const eventDay = new Date(eventData.date);
        today.setHours(0, 0, 0, 0);
        eventDay.setHours(0, 0, 0, 0);
        const active = eventDay >= today;
        setIsActive(active);
        
        if (eventData.seatSelectionMode) {
          setEventSeatSelectionMode(eventData.seatSelectionMode);
        }
        
        if (!active) {
          setTimeout(() => navigate('/'), 5000);
        }
        
      } catch (error) {
        console.error('Error fetching event:', error);
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [state?.eventId, eventTitle, navigate]);

  // Handle loading ticket types
  useEffect(() => {
    const fetchTicketTypes = async () => {
      if (!state?.eventId) return;
      try {
        setLoading(true);
        const types = await getTicketTypesForEvent(state.eventId);
        setTicketTypes(types || []);
        setQuantities((types || []).reduce((acc, ticket) => {
          acc[ticket.id] = 0;
          return acc;
        }, {} as Record<number, number>));
        setError(null);
      } catch (err) {
        console.error('Error fetching ticket types:', err);
        setError('Failed to load ticket types. Please try again later.');
        setTicketTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketTypes();
  }, [state?.eventId]);

  // Update selected tickets whenever quantities change
  useEffect(() => {
    const updatedTickets = ticketTypes
      .map(ticket => ({
        ticketTypeId: ticket.id,
        type: ticket.type,
        name: ticket.name || ticket.type,
        quantity: quantities[ticket.id] || 0,
        unitPrice: ticket.price,
        price: (quantities[ticket.id] || 0) * ticket.price,
      }))
      .filter(ticket => ticket.quantity > 0);

    setSelectedTickets(updatedTickets);

    // Update booking context if available
    if (dispatch && event) {
      const totalAmount = updatedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      
      dispatch({
        type: 'SET_BOOKING_DATA',
        payload: {
          eventId: event.id,
          eventTitle: state?.eventTitle || eventTitle || '',
          bookingType: 'tickets',
          totalAmount,
          selectedTickets: updatedTickets,
        },
      });
    }
  }, [quantities, ticketTypes, event, dispatch, state?.eventTitle]);

  const handleQtyChange = (ticketId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + delta),
    }));
  };

  const total = selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  const proceed = () => {
    if (!eventTitle || total === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    // Build unified booking data
    const bookingData: BookingData = {
      eventId: state?.eventId,
      eventTitle: state?.eventTitle,
      bookingType: eventSeatSelectionMode === SEAT_SELECTION_MODE.EVENT_HALL ? 'seats' : 'tickets',
      totalAmount: total,
      selectedTickets,
      selectedFoodItems: [],
    };

    // Navigate to the next step based on event type
    if (eventSeatSelectionMode === SEAT_SELECTION_MODE.EVENT_HALL) {
      // For events with allocated seating, we need to go through the seat selection
      navigate(`/event/${eventTitle}/seats`, { state: bookingData });
    } else {
      // For general admission, go directly to food selection
      BookingNavigator.toFoodSelection(navigate, bookingData);
    }
  };

  // If we know the event is not active, show the message
  if (isActive === false) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-gray-800 rounded-xl shadow-2xl text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-4">This Event Has Ended</h1>
        <p className="text-gray-300 mb-8">
          Sorry, this event is no longer available for booking. You will be redirected to the events page in a few seconds.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors duration-200 font-semibold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Book Tickets - ${state?.eventTitle}`}
        description={`Secure Your Event Tickets for ${state?.eventTitle}. Simple and secure ticket booking with optional food ordering.`}
        keywords={['Secure Your Event Tickets', 'Instant Ticket Booking', 'Easy Event Ticketing']}
        article={true}
      />
      {state?.eventId && (
        <EventStructuredData event={{
          id: state.eventId,
          title: state.eventTitle || 'Event',
          description: state.eventDescription || 'Join us for this exciting event',
          startDate: state.eventDate || new Date().toISOString(),
          location: state.eventLocation,
          price: state.eventPrice,
          organizer: state.organizerName
        }} />
      )}
      
      {/* Event Hero Section */}
      {(event || state) && (
        <EventHero 
          title={(event?.title || state?.eventTitle) || 'Event'}
          imageUrl={event?.imageUrl || (state as any)?.imageUrl}
          date={event?.date || state?.eventDate}
          location={event?.location || state?.eventLocation}
          description={event?.description || state?.eventDescription}
          className="mb-8"
        />
      )}
      
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Tickets</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <div className="text-gray-300">Loading ticket types...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400">{error}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {ticketTypes.map((ticket) => (
              <div 
                key={ticket.id} 
                className="flex items-center justify-between p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="text-lg font-semibold text-white capitalize">{ticket.name}</span>
                    <span className="ml-2 text-sm text-gray-400">ticket</span>
                  </div>
                  <div className="text-yellow-500 font-medium">
                    ${ticket.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleQtyChange(ticket.id, -1)}
                    className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200"
                    disabled={quantities[ticket.id] === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold text-white">
                    {quantities[ticket.id] || 0}
                  </span>
                  <button 
                    onClick={() => handleQtyChange(ticket.id, 1)}
                    className="w-10 h-10 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-300 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">←</span> Back
            </button>

            <button
              disabled={total === 0}
              onClick={proceed}
              className={`flex-1 px-6 py-3 rounded-lg ${
                total === 0 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-black font-semibold'
              } transition-colors duration-200 flex items-center justify-center`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketSelection;
