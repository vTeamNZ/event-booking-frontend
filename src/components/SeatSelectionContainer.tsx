import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import SEO from './SEO';
import { EventHallSeatLayout } from './EventHallSeatLayout';
import { GeneralAdmissionLayout } from './GeneralAdmissionLayout';
import { SeatLegend } from './SeatLegend';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  seatSelectionMode: 1 | 3; // 1=EventHall, 3=GeneralAdmission
  imageUrl?: string;
}

export const SeatSelectionContainer: React.FC = () => {
  const { eventTitle } = useParams<{ eventTitle: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [ticketTypeId: number]: number }>({});

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        // Get event by title (URL slug)
        const response = await api.get(`/api/events/by-title/${encodeURIComponent(eventTitle || '')}`);
        setEvent(response.data as Event);
      } catch (err: any) {
        setError('Event not found');
        toast.error('Event not found');
      } finally {
        setLoading(false);
      }
    };

    if (eventTitle) {
      loadEvent();
    }
  }, [eventTitle]);

  const handleSeatSelect = (seatId: number, selected: boolean) => {
    setSelectedSeats(prev => 
      selected 
        ? [...prev, seatId]
        : prev.filter(id => id !== seatId)
    );
  };

  const handleTicketSelect = (ticketTypeId: number, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: quantity
    }));
  };

  const getTotalSelections = () => {
    if (event?.seatSelectionMode === 3) {
      return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    } else {
      return selectedSeats.length;
    }
  };

  const handleContinue = () => {
    if (getTotalSelections() === 0) {
      toast.error('Please select seats or tickets before continuing');
      return;
    }

    // Store selections in localStorage for the next step
    const selectionData = {
      eventId: event?.id,
      eventTitle: event?.title,
      seatSelectionMode: event?.seatSelectionMode,
      selectedSeats,
      selectedTickets
    };
    
    localStorage.setItem('seatSelection', JSON.stringify(selectionData));
    
    // Navigate to food selection or payment
    navigate(`/event/${eventTitle}/food`);
  };

  const handleBack = () => {
    navigate(`/event/${eventTitle}/tickets`);
  };

  const getSeatSelectionModeText = (mode: number) => {
    switch (mode) {
      case 1: return 'Event Hall Seating';
      case 3: return 'General Admission';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <button 
            onClick={() => navigate('/events')} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Select Seats - ${event.title}`}
        description={`Choose your seats for ${event.title}. ${getSeatSelectionModeText(event.seatSelectionMode)} available.`}
        keywords={["Seat Selection", "Event Booking", event.title]}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 {new Date(event.date).toLocaleDateString('en-NZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p>📍 {event.location}</p>
                  <p>🎫 {getSeatSelectionModeText(event.seatSelectionMode)}</p>
                </div>
              </div>
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Table Booking Toggle (only for table seating mode) */}
            {/* Table booking mode removed */}
          </div>

          {/* Seat Selection Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {event.seatSelectionMode === 1 && (
              <EventHallSeatLayout
                eventId={event.id}
                onSeatSelect={handleSeatSelect}
                selectedSeats={selectedSeats}
              />
            )}

            {/* Table booking mode removed */}

            {event.seatSelectionMode === 3 && (
              <GeneralAdmissionLayout
                eventId={event.id}
                onTicketSelect={handleTicketSelect}
                selectedTickets={selectedTickets}
              />
            )}

            {/* Seat Legend */}
            <div className="mt-4">
              <SeatLegend showHeld={event.seatSelectionMode === 1} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to Tickets
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {event.seatSelectionMode === 3 
                  ? `${getTotalSelections()} tickets selected`
                  : `${getTotalSelections()} seats selected`
                }
              </p>
              <button
                onClick={handleContinue}
                disabled={getTotalSelections() === 0}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Food Selection →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
