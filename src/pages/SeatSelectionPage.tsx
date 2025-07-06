import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { SeatSelectionState } from '../types/seatSelection';
import SeatSelection from '../components/SeatSelection';
import CinemaSeatLayout from '../components/CinemaSeatLayout';
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
    console.log("************* SEAT SELECTION PAGE MOUNTED *************");
    console.log("Received state:", state);
    console.log("Event title from URL params:", eventTitle);
    
    if (!state?.eventId) {
      console.error("No eventId in state, navigating to home");
      navigate('/');
      return;
    }

    const fetchEvent = async () => {
      try {
        console.log(`Fetching event with ID: ${state.eventId}`);
        setLoading(true);
        const response = await api.get<Event>(`/api/Events/${state.eventId}`);
        console.log("Event data received:", response.data);
        
        const eventData = response.data;
        setEvent(eventData);
        
        const active = new Date(eventData.date) > new Date();
        console.log(`Event active status: ${active}`);
        setIsActive(active);
        
        console.log(`Event seat selection mode: ${eventData.seatSelectionMode}`);
        
        if (!active) {
          console.log("Event is not active, will redirect to home page");
          setError('This event has already passed and is no longer available for booking.');
          setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        console.error('Error details:', JSON.stringify(err));
        setError('Failed to load event details');
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [state?.eventId, navigate, eventTitle]);

  const handleSelectionComplete = (selectionState: SeatSelectionState) => {
    // Navigate to food selection or payment page with the selection data
    navigate('/food-selection', {
      state: {
        eventId: state.eventId,
        eventTitle: event?.title,
        seatSelection: selectionState,
        fromSeatSelection: true
      }
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
          {/* Debug info */}
          <div className="bg-gray-100 p-4 mb-4 rounded-lg">
            <h4 className="font-bold">Debug Information</h4>
            <div className="text-sm font-mono mt-2">
              <div>Event ID: {state?.eventId}</div>
              <div>Event Title: {event?.title}</div>
              <div>Event Mode: {event?.seatSelectionMode}</div>
              <div>Event Date: {event?.date}</div>
              <div>Browser Location: {window.location.href}</div>
            </div>
          </div>
          
          {/* Make sure we have a valid eventId */}
          {state?.eventId ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-4xl mx-auto">
                {/* Toggle between old and new seat UI */}
                <div className="mb-6 flex justify-center space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    Cinema Style (Hoyts-like)
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">
                    Original Style
                  </button>
                </div>
                
                {/* New Cinema Style Seat Selection */}
                <CinemaSeatLayout 
                  eventId={state.eventId}
                  onSelectionComplete={handleSelectionComplete}
                />
                
                {/* Original Seat Selection (currently hidden) */}
                <div className="hidden">
                  <SeatSelection
                    eventId={state.eventId}
                    onSelectionComplete={handleSelectionComplete}
                  />
                </div>
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
