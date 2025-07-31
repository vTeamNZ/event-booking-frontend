import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { createEventSlug, slugToSearchTerm } from '../utils/slugUtils';
import { authService } from '../services/authService';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string | null;
  location: string;
  price: number | null;
  capacity: number | null;
  organizerId: number | null;
  imageUrl: string | null;
  isActive: boolean;
  status?: number;
  seatSelectionMode?: 1 | 3; // 1=EventHall, 3=GeneralAdmission
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
  organizer?: {
    id: number;
    name: string;
    contactEmail: string;
  } | null;
}

const EventPage: React.FC = () => {
  const { eventTitle } = useParams<{ eventTitle: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventTitle) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert slug back to search term
        const searchTerm = slugToSearchTerm(eventTitle);
        
        // Try to get event by title
        const response = await api.get<Event>(`/Events/by-title/${encodeURIComponent(searchTerm)}`);
        const event = response.data;

        // Verify we have valid event data
        if (!event || !event.title) {
          throw new Error('Event not found or missing title');
        }

        // Verify the slug matches (to handle exact matching)
        const expectedSlug = createEventSlug(event.title);
        if (expectedSlug !== eventTitle) {
          // Redirect to the correct slug
          navigate(`/${expectedSlug}`, { replace: true });
          return;
        }

        // Check if event is accessible - apply same logic as EventsList
        const currentUser = authService.getCurrentUser();
        const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
        const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
        const eventStatus = event.status ?? (event.isActive ? 2 : 3);
        
        // Allow access for:
        // - Active events (everyone)
        // - Draft events (organizers for testing)
        // - Pending events (admins for review)
        const canAccess = eventStatus === 2 || 
                         (eventStatus === 0 && isOrganizer) || 
                         (eventStatus === 1 && isAdmin);
        
        if (!canAccess) {
          setError('This event is not currently available for booking.');
          return;
        }

        // Determine the appropriate route based on seat selection mode
        const seatMode = event.seatSelectionMode ?? 3;
        const targetRoute = seatMode === 1 
          ? `/event/${eventTitle}/seats` 
          : `/event/${eventTitle}/tickets`;

        // Navigate to the appropriate booking page with event data
        navigate(targetRoute, {
          state: {
            eventId: event.id,
            eventTitle: event.title,
            eventPrice: event.price,
            eventDate: event.date,
            eventLocation: event.location,
            eventDescription: event.description,
            organizerName: event.organizer?.name,
            seatSelectionMode: seatMode,
            venue: event.venue,
            imageUrl: event.imageUrl
          },
          replace: true
        });

      } catch (error: any) {
        console.error('Error loading event:', error);
        if (error.response?.status === 404) {
          setError('Event not found. The event may have been removed or the URL is incorrect.');
        } else {
          setError('Failed to load event. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventTitle, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // This should not be reached as we navigate away in useEffect
  return null;
};

export default EventPage;
