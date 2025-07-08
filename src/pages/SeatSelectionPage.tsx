import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { SeatSelectionState } from '../types/seatSelection';
import { SeatingLayoutV2, SeatingSelectionState } from '../components/seating-v2';
import TicketTypeDisplay from '../components/TicketTypeDisplay';
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
    // Convert the new seating selection state to the old format for navigation
    const oldFormatState: SeatSelectionState = {
      mode: selectionState.mode,
      selectedSeats: selectionState.selectedSeats.map(selectedSeat => ({
        seat: {
          id: selectedSeat.seat.id,
          seatNumber: selectedSeat.seat.seatNumber,
          row: selectedSeat.seat.row,
          number: selectedSeat.seat.number,
          x: selectedSeat.seat.x,
          y: selectedSeat.seat.y,
          width: selectedSeat.seat.width,
          height: selectedSeat.seat.height,
          price: selectedSeat.seat.price,
          status: selectedSeat.seat.status,
          sectionId: selectedSeat.seat.sectionId,
          section: selectedSeat.seat.section,
          tableId: selectedSeat.seat.tableId,
          reservedUntil: selectedSeat.seat.reservedUntil
        },
        reservedUntil: selectedSeat.reservedUntil
      })),
      selectedTables: selectionState.selectedTables.map(selectedTable => ({
        table: {
          id: selectedTable.table.id,
          tableNumber: selectedTable.table.tableNumber,
          capacity: selectedTable.table.capacity,
          x: selectedTable.table.x,
          y: selectedTable.table.y,
          width: selectedTable.table.width,
          height: selectedTable.table.height,
          shape: selectedTable.table.shape,
          pricePerSeat: selectedTable.table.pricePerSeat,
          tablePrice: selectedTable.table.tablePrice,
          sectionId: selectedTable.table.sectionId,
          availableSeats: selectedTable.table.availableSeats,
          seats: selectedTable.table.seats
        },
        selectedSeats: selectedTable.selectedSeats,
        isFullTable: selectedTable.isFullTable,
        reservedUntil: selectedTable.reservedUntil
      })),
      generalTickets: selectionState.generalTickets.map(ticket => ({
        ticketType: {
          id: ticket.ticketType.id,
          type: ticket.ticketType.name,
          price: ticket.ticketType.price,
          color: ticket.ticketType.color,
          description: ticket.ticketType.description,
          eventId: selectionState.eventId,
          seatRowAssignments: ticket.ticketType.seatRowAssignments
        },
        quantity: ticket.quantity
      })),
      totalPrice: selectionState.totalPrice,
      sessionId: selectionState.sessionId
    };

    // Combine ticket information with seat selection data
    const navigationState = {
      ...state,
      seatSelection: oldFormatState,
      fromSeatSelection: true
    };

    // Navigate to food selection with combined ticket and seat data
    navigate(`/event/${eventTitle}/food`, { state: navigationState });
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
                  eventId={state.eventId}
                  onSelectionComplete={handleSelectionComplete}
                  maxSeats={8}
                  showLegend={true}
                  className="seating-layout-container"
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
