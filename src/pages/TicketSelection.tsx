import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { TicketType, TicketTypeDisplay, getTicketTypesForEvent } from '../services/ticketTypeService';
import SEO from '../components/SEO';
import EventStructuredData from '../components/SEO/EventStructuredData';
import { toast } from 'react-hot-toast';

interface Event {
  id: number;
  date: string;
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
  type: string;
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

  useEffect(() => {
    if (!state?.eventId) {
      navigate('/');
      return;
    }
    // Fetch event details to check if it's active
    api.get<Event>(`/api/Events/${state.eventId}`)
      .then(response => {
        const event = response.data;
        const active = new Date(event.date) > new Date();
        setIsActive(active);
        
        // Store the seat selection mode
        if (event.seatSelectionMode) {
          console.log(`Event ${state.eventId} has seat selection mode: ${event.seatSelectionMode}`);
          setEventSeatSelectionMode(event.seatSelectionMode);
        } else {
          console.log(`Event ${state.eventId} has no seat selection mode, defaulting to General Admission`);
        }
        
        if (!active) {
          setTimeout(() => {
            navigate('/');
          }, 5000); // Redirect after 5 seconds
        }
      })
      .catch(error => {
        console.error('Error fetching event:', error);
        setIsActive(false);
      });
  }, [state?.eventId, navigate]);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      if (!state?.eventId) return;
      try {
        setLoading(true);
        const types = await getTicketTypesForEvent(state.eventId);
        setTicketTypes(types || []);
        // Initialize quantities for each ticket type
        const initialQuantities = (types || []).reduce((acc, ticket) => {
          acc[ticket.id] = 0;
          return acc;
        }, {} as Record<number, number>);
        setQuantities(initialQuantities);
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

  // If we know the event is not active, show the message
  if (isActive === false) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">This Event Has Ended</h1>
        <p className="text-gray-600 mb-8">
          Sorry, this event is no longer available for booking. You will be redirected to the events page in a few seconds.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const handleQtyChange = (ticketId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + delta),
    }));
  };

  const total = ticketTypes.reduce(
    (sum, ticket) => sum + (quantities[ticket.id] || 0) * ticket.price,
    0
  );

  const selectedTickets = ticketTypes
    .map(ticket => ({
      type: ticket.name,
      quantity: quantities[ticket.id] || 0,
      unitPrice: ticket.price,
      price: (quantities[ticket.id] || 0) * ticket.price,
    }))
    .filter(ticket => ticket.quantity > 0);

  const proceed = () => {
    if (!eventTitle || total === 0) {
      toast.error('Please select at least one ticket');
      return;
    }
    
    // Common navigation state for both paths
    const navigationState = {
      eventId: state?.eventId,
      eventTitle: state?.eventTitle,
      ticketPrice: total,
      ticketDetails: selectedTickets,
      eventDate: state?.eventDate,
      eventLocation: state?.eventLocation,
      venue: state?.venue,
      seatSelectionMode: eventSeatSelectionMode
    };
    
    // For events with allocated seating (Event Hall), go to seat selection
    if (eventSeatSelectionMode === SEAT_SELECTION_MODE.EVENT_HALL) {
      navigate(`/event/${eventTitle}/seats`, { state: navigationState });
    } else {
      // For general admission, go directly to food selection
      navigate(`/event/${eventTitle}/food`, { state: navigationState });
    }
  };
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
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Tickets</h1>
        <h2 className="text-xl text-gray-600 mb-2">{state?.eventTitle}</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>📍 {state?.eventLocation}</p>
          <p>🕒 {state?.eventDate ? new Date(state.eventDate).toLocaleString() : 'Date not specified'}</p>
          {state?.venue && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">📍 Venue Information</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-medium">Name:</span> {state.venue.name}</p>
                <p><span className="font-medium">Address:</span> {state.venue.address}, {state.venue.city}</p>
                <p><span className="font-medium">Layout:</span> {state.venue.layoutType}</p>
                <p><span className="font-medium">Capacity:</span> {state.venue.capacity} people</p>
                {state.venue.description && (
                  <p><span className="font-medium">About:</span> {state.venue.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading ticket types...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((ticket) => (
            <div 
              key={ticket.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="text-lg font-semibold text-gray-800 capitalize">{ticket.name}</span>
                  <span className="ml-2 text-sm text-gray-500">ticket</span>
                </div>
                <div className="text-gray-600 font-medium">
                  ${ticket.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleQtyChange(ticket.id, -1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={quantities[ticket.id] === 0}
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-gray-800">
                  {quantities[ticket.id] || 0}
                </span>
                <button 
                  onClick={() => handleQtyChange(ticket.id, 1)}
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
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <span className="mr-2">←</span> Back
          </button>

          <button
            disabled={total === 0}
            onClick={proceed}
            className={`flex-1 px-6 py-3 rounded-lg ${
              total === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-red-600'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            Next
          </button>        </div>
      </div>
    </div>
    </>
  );
};

export default TicketSelection;
