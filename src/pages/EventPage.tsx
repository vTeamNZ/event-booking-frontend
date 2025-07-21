import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { createEventSlug, slugToSearchTerm } from '../utils/slugUtils';
import { authService } from '../services/authService';
import SEO from '../components/SEO';
import EventStructuredData from '../components/SEO/EventStructuredData';

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
    phoneNumber?: string;
    organizationName?: string;
    website?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    isVerified?: boolean;
  } | null;
}

interface OrganizerDetails {
  id: number;
  name: string;
  contactEmail: string;
  phoneNumber: string;
  organizationName?: string;
  website?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  isVerified?: boolean;
}

const EventPage: React.FC = () => {
  const { eventTitle } = useParams<{ eventTitle: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerDetails, setOrganizerDetails] = useState<OrganizerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventTitle) {
        setError('Event not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert slug back to search term
        const searchTerm = slugToSearchTerm(eventTitle);
        console.log(`[EventPage] Searching for event with term: "${searchTerm}"`);

        // Check if current user is an organizer
        const currentUser = authService.getCurrentUser();
        const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');

        let allEvents: Event[] = [];

        // Fetch public events
        const publicResponse = await api.get('/events');
        const publicEvents: Event[] = Array.isArray(publicResponse.data) ? publicResponse.data : [];
        allEvents.push(...publicEvents);

        // If user is an organizer, also fetch their draft events
        if (isOrganizer) {
          try {
            const organizerResponse = await api.get('/Events/by-organizer');
            const organizerEvents: Event[] = Array.isArray(organizerResponse.data) ? organizerResponse.data : [];
            
            // Add organizer events that aren't already in public events (to avoid duplicates)
            organizerEvents.forEach(orgEvent => {
              if (!allEvents.find(pubEvent => pubEvent.id === orgEvent.id)) {
                allEvents.push(orgEvent);
              }
            });
          } catch (err) {
            console.log('Could not fetch organizer events:', err);
          }
        }

        // Find event that matches the slug
        const matchingEvent = allEvents.find(e => 
          createEventSlug(e.title) === eventTitle
        );

        if (!matchingEvent) {
          console.log(`[EventPage] No event found for slug: ${eventTitle}`);
          setError('Event not found');
          setLoading(false);
          return;
        }

        console.log(`[EventPage] Found event:`, matchingEvent);
        setEvent(matchingEvent);

        // Fetch organizer details if available
        if (matchingEvent.organizerId) {
          try {
            const organizerResponse = await api.get(`/organizers/${matchingEvent.organizerId}`);
            setOrganizerDetails(organizerResponse.data as OrganizerDetails);
          } catch (err) {
            console.log('Could not fetch organizer details:', err);
          }
        }

      } catch (err) {
        console.error('[EventPage] Error fetching event:', err);
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventTitle]);

  const handleBookTickets = () => {
    if (!event) return;

    const seatMode = event.seatSelectionMode || 3; // Default to GeneralAdmission
    const eventSlug = createEventSlug(event.title);

    // Navigate to appropriate selection page based on seat mode
    if (seatMode === 1) {
      // Reserved Seating - go to seat selection
      navigate(`/event/${eventSlug}/seats`, {
        state: {
          eventId: event.id,
          eventTitle: event.title,
          eventPrice: event.price,
          eventDate: event.date,
          eventLocation: event.location,
          eventDescription: event.description,
          organizerName: organizerDetails?.name || event.organizer?.name,
          seatSelectionMode: seatMode,
          venue: event.venue,
          imageUrl: event.imageUrl
        }
      });
    } else {
      // General Admission - go to ticket selection
      navigate(`/event/${eventSlug}/tickets`, {
        state: {
          eventId: event.id,
          eventTitle: event.title,
          eventPrice: event.price,
          eventDate: event.date,
          eventLocation: event.location,
          eventDescription: event.description,
          organizerName: organizerDetails?.name || event.organizer?.name,
          seatSelectionMode: seatMode,
          venue: event.venue,
          imageUrl: event.imageUrl
        }
      });
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Date TBD';
    
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Date TBD';
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

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

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'The requested event could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const currentUser = authService.getCurrentUser();
  const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
  const eventStatus = event.status ?? (event.isActive ? 2 : 3);
  
  // Check if user can access this event
  const canAccess = eventStatus === 2 || 
                   (eventStatus === 0 && isOrganizer) || 
                   (eventStatus === 1 && isAdmin);

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Event Unavailable</h1>
          <p className="text-gray-300 mb-6">This event is not currently available for booking.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg transition-colors font-semibold"
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
        title={`${event.title} | Event Details`}
        description={event.description}
        image={event.imageUrl || undefined}
      />
      <EventStructuredData event={{
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.date || new Date().toISOString(),
        location: event.location,
        venue: event.venue ? {
          name: event.venue.name,
          address: event.venue.address,
          city: event.venue.city
        } : undefined,
        price: event.price ?? undefined,
        imageUrl: event.imageUrl ?? undefined,
        organizer: organizerDetails?.name || event.organizer?.name
      }} />
      
      <div className="min-h-screen bg-gray-900">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-20 lg:pt-16 pb-8">
          
          {/* Cinema-style Back Button */}
          <div className="mb-12">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center space-x-3 text-gray-400 hover:text-yellow-500 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-yellow-500 flex items-center justify-center transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-lg font-medium">Back to Events</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Column - Event Flyer */}
            <div className="space-y-6">
              <div className="relative group">
                <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700 group-hover:border-yellow-500 transition-colors duration-300">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4zm16 2v12H4V6h16zM8 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14l2-2 2 2 4-4 4 4v2H6v-2z"/>
                        </svg>
                        <p className="text-lg">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button for Mobile */}
              <div className="lg:hidden">
                <button
                  onClick={handleBookTickets}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg"
                >
                  Book Tickets
                </button>
              </div>
            </div>

            {/* Right Column - Event Information */}
            <div className="space-y-8">
              
              {/* Event Title & Basic Info */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {event.title}
                </h1>
                
                {/* Organizer name below title */}
                {(organizerDetails?.organizationName || organizerDetails?.name || event.organizer?.organizationName || event.organizer?.name) && (
                  <div className="flex items-center space-x-2 text-lg">
                    <span className="text-gray-400">Organized by</span>
                    <span className="text-yellow-500 font-medium">
                      {organizerDetails?.organizationName || organizerDetails?.name || event.organizer?.organizationName || event.organizer?.name}
                    </span>
                    {organizerDetails?.isVerified && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Date & Time</h3>
                    <p className="text-gray-300 text-base">{formatDateTime(event.date)}</p>
                  </div>
                </div>
              </div>

              {/* Venue Information */}
              {event.venue && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Venue</h3>
                      <p className="text-gray-300 text-base font-medium">{event.venue.name}</p>
                      <p className="text-gray-400 text-sm">{event.venue.address}, {event.venue.city}</p>
                      {event.venue.description && (
                        <p className="text-gray-400 text-sm mt-2">{event.venue.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Organizer Information */}
              {(organizerDetails || event.organizer) && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Organized By</h3>
                      <div className="space-y-1">
                        <p className="text-gray-300 font-medium">
                          {organizerDetails?.name || event.organizer?.name}
                          {organizerDetails?.isVerified && (
                            <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Verified
                            </span>
                          )}
                        </p>
                        {organizerDetails?.organizationName && (
                          <p className="text-gray-400 text-sm">{organizerDetails.organizationName}</p>
                        )}
                        <p className="text-gray-400 text-sm">
                          {organizerDetails?.contactEmail || event.organizer?.contactEmail}
                        </p>
                        
                        {/* Social Links */}
                        {(organizerDetails?.website || organizerDetails?.facebookUrl || organizerDetails?.youtubeUrl) && (
                          <div className="flex space-x-3 mt-3">
                            {organizerDetails?.website && (
                              <a
                                href={organizerDetails.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </a>
                            )}
                            {organizerDetails?.facebookUrl && (
                              <a
                                href={organizerDetails.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </a>
                            )}
                            {organizerDetails?.youtubeUrl && (
                              <a
                                href={organizerDetails.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button for Desktop */}
              <div className="hidden lg:block">
                <button
                  onClick={handleBookTickets}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-.55.45-1 1-1h18c.55 0 1 .45 1 1zM4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4z"/>
                  </svg>
                  <span>Book Tickets</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Width Event Description Section */}
          <div className="mt-12">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">About This Event</h2>
                </div>
                <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-light">
                  {event.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPage;
