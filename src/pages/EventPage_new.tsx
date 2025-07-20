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
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerDetails, setOrganizerDetails] = useState<OrganizerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventSlug) {
        setError('Event not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert slug back to search term
        const searchTerm = slugToSearchTerm(eventSlug);
        console.log(`[EventPage] Searching for event with term: "${searchTerm}"`);

        // Fetch all events and find matching one
        const response = await api.get('/events');
        const events: Event[] = response.data as Event[];

        // Find event that matches the slug
        const matchingEvent = events.find(e => 
          createEventSlug(e.title) === eventSlug
        );

        if (!matchingEvent) {
          console.log(`[EventPage] No event found for slug: ${eventSlug}`);
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
  }, [eventSlug]);

  const handleBookTickets = () => {
    if (!event) return;

    const currentUser = authService.getCurrentUser();
    const seatMode = event.seatSelectionMode || 3; // Default to GeneralAdmission

    navigate('/checkout', {
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
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBA';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return date.toLocaleDateString('en-NZ', options);
  };

  const getSeatModeDisplay = (mode?: number) => {
    switch (mode) {
      case 1: return 'Reserved Seating';
      case 3: return 'General Admission';
      default: return 'General Admission';
    }
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
          <p className="text-gray-300 mb-6">{error || 'Event not found'}</p>
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

  const fallbackImage = '/events/fallback.jpg';
  const eventImage = event.imageUrl || fallbackImage;

  return (
    <>
      <SEO 
        title={`${event.title} - Event Details`}
        description={event.description || `Join us for ${event.title}. ${event.location ? `Located at ${event.location}.` : ''}`}
        keywords={['Event Details', event.title, 'KiwiLanka Events', 'Event Booking']}
        image={event.imageUrl || undefined}
        article={true}
      />
      
      <EventStructuredData event={{
        id: event.id,
        title: event.title,
        description: event.description || 'Join us for this exciting event',
        startDate: event.date || new Date().toISOString(),
        location: event.location,
        price: event.price || undefined,
        organizer: organizerDetails?.name || event.organizer?.name
      }} />

      <div className="min-h-screen bg-gray-900">
        {/* Event Flyer Showcase Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Event Flyer Image */}
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  {/* Main Image Container with Cinema Frame */}
                  <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-700 group-hover:border-primary/50 transition-all duration-500">
                    <img 
                      src={eventImage}
                      alt={`${event.title} Event Flyer`}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '70vh' }}
                    />
                    
                    {/* Subtle overlay for contrast on image corners */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10 pointer-events-none"></div>
                    
                    {/* Organizer Watermark */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                        <div className="text-white text-xs">
                          <div className="font-bold text-primary text-sm">
                            {organizerDetails?.organizationName || organizerDetails?.name || event.organizer?.name || 'KiwiLanka Events'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Frame Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl -z-10 opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
              </div>

              {/* Right Column - Event Information */}
              <div className="order-1 lg:order-2 space-y-8">
                {/* Event Title */}
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {event.title}
                  </h1>
                  
                  {/* Event Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-primary text-black px-4 py-2 rounded-xl font-bold text-sm">
                      {formatDate(event.date).split(',')[0]} {/* Day of week */}
                    </div>
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                      {getSeatModeDisplay(event.seatSelectionMode)}
                    </div>
                    {event.price && (
                      <div className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                        From ${event.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Event Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg">{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg">{event.location}</span>
                  </div>

                  {event.capacity && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-lg">{event.capacity} attendees</span>
                    </div>
                  )}
                </div>

                {/* Description Preview */}
                {event.description && (
                  <div>
                    <p className="text-gray-300 text-lg leading-relaxed line-clamp-4">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Main CTA */}
                <div className="pt-4">
                  <button
                    onClick={handleBookTickets}
                    className="bg-primary hover:bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    Book Tickets Now
                  </button>
                  
                  {event.price && (
                    <p className="text-gray-400 text-sm mt-2">Starting from ${event.price}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Section */}
        <div className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Event Details Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-8">Event Details</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm font-medium">Date & Time</div>
                      <div className="text-white text-lg font-semibold">{formatDate(event.date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm font-medium">Location</div>
                      <div className="text-white text-lg font-semibold">{event.location}</div>
                    </div>
                  </div>

                  {event.capacity && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm font-medium">Capacity</div>
                        <div className="text-white text-lg font-semibold">{event.capacity} attendees</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm font-medium">Selection Mode</div>
                      <div className="text-white text-lg font-semibold">{getSeatModeDisplay(event.seatSelectionMode)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-8">About This Event</h2>
                
                {event.description ? (
                  <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                    {event.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-lg">Event description will be available soon.</p>
                )}

                {/* Organizer Information */}
                {organizerDetails && (
                  <div className="mt-8 pt-6 border-t border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Event Organizer</h3>
                    <div className="space-y-3">
                      <div className="text-primary text-lg font-semibold">
                        {organizerDetails.organizationName || organizerDetails.name}
                      </div>
                      <div className="text-gray-400">{organizerDetails.contactEmail}</div>
                      {organizerDetails.website && (
                        <div>
                          <a 
                            href={organizerDetails.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-yellow-400 transition-colors duration-300 inline-flex items-center gap-2"
                          >
                            Visit Website
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPage;
