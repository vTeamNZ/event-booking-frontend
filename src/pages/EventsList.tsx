// src/pages/EventsList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/authService';
import SEO from '../components/SEO';
import { createEventSlug, createOrganizerSlug, navigateToEvent } from '../utils/slugUtils';
import toast from 'react-hot-toast';

interface Organizer {
  id: number;
  name: string;
  contactEmail: string;
  phoneNumber: string;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  userId: string;
}

interface EventFromAPI {
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
  status?: number; // 0=Draft, 1=Pending, 2=Active, 3=Inactive
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
}

interface Event extends Omit<EventFromAPI, 'seatSelectionMode'> {
  isActive: boolean;
  isAdminApproved: boolean;
  status?: number;
  organizerName: string;
  city: string;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  organizerSlug: string;
  seatSelectionMode?: 1 | 3; // Only EventHall or GeneralAdmission
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { organizerSlug } = useParams<{ organizerSlug?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if current user is an organizer
        const currentUser = authService.getCurrentUser();
        const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
        
        let eventsResponse;
        let eventsWithDetails;
        
        if (isOrganizer) {
          // Fetch organizer's events using the by-organizer endpoint
          eventsResponse = await api.get<EventFromAPI[]>('/Events/by-organizer');
          console.log('Organizer events from API:', eventsResponse.data);
          
          // Ensure we have a valid array
          const organizerEvents = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
          
          // For organizer view, we don't need to fetch additional organizer details
          // since they're viewing their own events
          eventsWithDetails = organizerEvents.map(event => {
            // Extract city from location
            const locationParts = event.location.split(',').map(part => part.trim());
            const city = locationParts[locationParts.length - 2] || locationParts[0];
            
            return {
              ...event,
              isActive: (event.date ? new Date(event.date) > new Date() : false) && event.isActive,
              isAdminApproved: event.isActive, // Store original admin approval status
              status: event.status, // Include status from API
              organizerName: currentUser.fullName || 'My Events',
              city,
              facebookUrl: null,
              youtubeUrl: null,
              organizerSlug: createOrganizerSlug(currentUser.fullName || 'my-events')
            };
          });
        } else {
          // Original logic for public view - fetch all events
          eventsResponse = await api.get<EventFromAPI[]>('/Events');
          console.log('Events from API:', eventsResponse.data);
          
          // Ensure we have a valid array
          const publicEvents = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
          
          // Get unique organizer IDs from events
          const organizerIds = publicEvents
            .map(event => event.organizerId)
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter(id => id != null); // Filter out null organizerIds
          
          console.log('Fetching organizers for IDs:', organizerIds);
          
          // Fetch organizer details for each unique organizerId
          const organizerPromises = organizerIds.map(id => 
            api.get<Organizer>(`/Organizers/${id}`)
          );
          const organizerResponses = await Promise.all(organizerPromises);
          
          // Debug organizer responses
          console.log('Organizer Responses:', organizerResponses.map(r => r.data));
          
          // Create a map of organizerId to organizer details
          const organizerMap = new Map<number, Organizer>(
            organizerResponses.map(response => [response.data.id, response.data])
          );
          
          // Extract city and combine event data with organizer names and active status
          eventsWithDetails = publicEvents.map(event => {
            // Extract city from location (assumes format like "Venue Name, Street, City, Region")
            const locationParts = event.location.split(',').map(part => part.trim());
            const city = locationParts[locationParts.length - 2] || locationParts[0];
            const organizer = event.organizerId ? organizerMap.get(event.organizerId) : null;
            const organizerName = organizer?.name || 'Unknown Organizer';
            
            const eventWithDetails = {
              ...event,
              isActive: (event.date ? new Date(event.date) > new Date() : false) && event.isActive, // Consider both future date AND admin approval
              isAdminApproved: event.isActive, // Store original admin approval status
              status: event.status, // Include status from API
              organizerName,
              city,
              facebookUrl: organizer?.facebookUrl || null,
              youtubeUrl: organizer?.youtubeUrl || null,
              organizerSlug: createOrganizerSlug(organizerName)
            };
            
            // Debug event social media URLs
            console.log(`Event ${event.id} (${event.title}) social URLs:`, {
              organizerId: event.organizerId,
              organizer: organizer,
              facebookUrl: eventWithDetails.facebookUrl,
              youtubeUrl: eventWithDetails.youtubeUrl
            });
            
            return eventWithDetails;
          });
        }
        
        setEvents(eventsWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data: any, status: number } };
          console.error('API Error Details:', {
            response: axiosError.response?.data,
            status: axiosError.response?.status
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const cities = useMemo(() => {
    const uniqueCities = events
      .map(event => event.city)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return ['all', ...uniqueCities];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const currentUser = authService.getCurrentUser();
    const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
    
    const filtered = events.filter(event => {
      const matchesOrganizer = !organizerSlug || createOrganizerSlug(event.organizerName || '') === organizerSlug;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      
      // Get event status (default to Active if not specified)
      const eventStatus = event.status ?? (event.isActive ? 2 : 3);
      
      if (isOrganizer) {
        // Organizers can see all their events including drafts for testing
        return matchesCity;
      } else if (isAdmin) {
        // Admins can see active events + pending events for review
        const canSeeEvent = eventStatus === 2 || eventStatus === 1; // Active or Pending
        return matchesOrganizer && matchesCity && canSeeEvent;
      } else {
        // Public users can only see active events
        return matchesOrganizer && matchesCity && eventStatus === 2;
      }
    });

    // Sort events: upcoming first (soonest first), then past events (most recent first)
    return filtered.sort((a, b) => {
      const now = new Date();
      const dateA = a.date ? new Date(a.date) : null;
      const dateB = b.date ? new Date(b.date) : null;

      // Handle events without dates - put them at the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      const isUpcomingA = dateA > now;
      const isUpcomingB = dateB > now;

      // If both are upcoming or both are past
      if (isUpcomingA === isUpcomingB) {
        if (isUpcomingA) {
          // Both upcoming: sort ascending (soonest first)
          return dateA.getTime() - dateB.getTime();
        } else {
          // Both past: sort descending (most recent first)
          return dateB.getTime() - dateA.getTime();
        }
      }

      // One upcoming, one past: upcoming comes first
      return isUpcomingA ? -1 : 1;
    });
  }, [events, organizerSlug, selectedCity]);
  
  const handleEventClick = (event: Event) => {
    const currentUser = authService.getCurrentUser();
    const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
    const eventStatus = event.status ?? (event.isActive ? 2 : 3);
    
    // Allow booking for:
    // - Active events (everyone)
    // - Draft events (organizers for testing)
    // - Pending events (admins for review)
    const canBook = eventStatus === 2 || 
                   (eventStatus === 0 && isOrganizer) || 
                   (eventStatus === 1 && isAdmin);
    
    if (!canBook) {
      return;
    }
    
    // Get the event's seat selection mode, defaulting to GeneralAdmission if not specified
    const seatMode = event.seatSelectionMode ?? 3;
    
    // Use centralized navigation
    navigateToEvent(event.title, navigate, {
      eventId: event.id,
      eventTitle: event.title,
      eventPrice: event.price,
      eventDate: event.date,
      eventLocation: event.location,
      eventDescription: event.description,
      organizerName: event.organizerName,
      seatSelectionMode: seatMode,
      venue: event.venue
    });
  };

  const handleSocialClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleShareEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const eventSlug = createEventSlug(event.title);
    const directUrl = `${window.location.origin}/${eventSlug}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: directUrl,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(directUrl).then(() => {
        toast.success('Event link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (event: Event) => {
    const currentUser = authService.getCurrentUser();
    const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
    
    // Only show status badges to organizers and admins
    if (!isOrganizer && !isAdmin) return null;
    
    const eventStatus = event.status ?? (event.isActive ? 2 : 3);
    
    const statusConfig = {
      0: { color: 'bg-gray-200 text-gray-800', text: '📝 Draft - Test Ready', testLabel: 'Test Booking' },
      1: { color: 'bg-warning/20 text-warning', text: '⏳ Pending Review', testLabel: 'Review & Test' },
      2: { color: 'bg-success/20 text-success', text: '✅ Active', testLabel: '' },
      3: { color: 'bg-error/20 text-error', text: '❌ Inactive', testLabel: '' }
    };
    
    const config = statusConfig[eventStatus as keyof typeof statusConfig] || statusConfig[2];
    
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
        {(eventStatus === 0 || eventStatus === 1) && config.testLabel && (
          <span className="text-xs text-info font-medium">
            👆 {config.testLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <SEO 
        title={organizerSlug 
          ? `${events.find(e => createOrganizerSlug(e.organizerName || '') === organizerSlug)?.organizerName || 'Events'}`
          : "Browse Local Events Now"
        }
        description={organizerSlug
          ? `Book tickets for events organized by ${events.find(e => createOrganizerSlug(e.organizerName || '') === organizerSlug)?.organizerName}. Simple and secure ticket booking with optional food ordering.`
          : "KiwiLanka brings you the best events from Christchurch to Auckland. Find your next event today."
        }
        keywords={[
          'Find Sri Lankan Events NZ', 
          'Events for Everyone in NZ', 
          'Browse Local Events Now',
          selectedCity !== 'all' ? `Events in ${selectedCity}` : ''
        ].filter(Boolean)}
      />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : (
        <>
            {/* Filters Section */}
            <div className="mb-8 space-y-6">
              {/* Page Title with Organizer if present */}
              {organizerSlug && (
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">
                      {events.find(e => createOrganizerSlug(e.organizerName || '') === organizerSlug)?.organizerName || 'Events'}
                    </h1>
                    <Link 
                      to="/"
                      className="text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
                    >
                      ← All Events
                    </Link>
                  </div>
                </div>
              )}
              
              {!organizerSlug && (
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-white mb-4">Discover Amazing Events</h1>
                  <p className="text-gray-400 text-lg">Find and book tickets for the best events in New Zealand</p>
                </div>
              )}

              {/* City Filter - Pills Style */}
              <div className="w-full">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      ${selectedCity === 'all'
                        ? 'bg-primary text-black shadow-md'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                      }`}
                  >
                    All Cities
                  </button>
                  {cities.filter(city => city !== 'all').map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${selectedCity === city
                          ? 'bg-primary text-black shadow-md'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              {organizerSlug && ' for this organizer'}
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your filters.</p>
              <p className="text-gray-400 text-sm mt-2">Events must be approved by an admin before they appear here.</p>
              <button
                onClick={() => {
                  setSelectedCity('all');
                }}
                className="mt-4 text-primary hover:text-primary-dark font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`relative bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 group overflow-hidden
                    ${event.isActive ? 'hover:shadow-3xl' : ''}`}
                >
                  {/* Image Container - Clickable */}
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <img
                      src={event.imageUrl || '/events/fallback.jpg'}
                      alt={event.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/events/fallback.jpg';
                      }}
                      className="w-full h-[450px] object-cover transition duration-300 rounded-t-xl"
                      loading="lazy"
                    />
                    {/* Overlay for past events */}
                    {!event.isActive && (
                      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-gray-900/80 text-white px-6 py-3 rounded-full shadow-md">
                          PAST EVENT
                        </div>
                      </div>
                    )}

                    {/* Hover overlay for active events */}
                    {event.isActive && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <span className="bg-primary text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 text-lg">
                          🎫 BUY TICKETS
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">                        <div className="mb-2 flex items-start justify-between">
                          <h2 className="text-xl font-bold text-white flex-1">{event.title}</h2>
                          {getStatusBadge(event)}
                        </div>
                        <p className="text-sm text-gray-300 mb-2 line-clamp-3">{event.description}</p>
                        <p className="text-sm text-gray-500 mb-1" style={{ textIndent: '-1.7em', paddingLeft: '1.7em' }}> 📍 {event.location}</p>
                        <p className="text-sm text-gray-500 mb-1" style={{ textIndent: '-1.2em', paddingLeft: '1.2em' }}> 
                          🕒 {event.date ? new Date(event.date).toLocaleString() : 'No date set'}
                          {!event.isActive && (
                            <span className="ml-2 text-primary font-medium">(Event Ended)</span>
                          )}
                        </p>
                      </div>                      <div className="flex flex-col gap-2">                        {event.facebookUrl && event.facebookUrl !== 'null' && (
                          <button
                            onClick={(e) => handleSocialClick(event.facebookUrl!, e)}
                            className="p-2 text-info hover:text-info/80 transition-colors duration-200"
                            aria-label="Visit Facebook page"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                            </svg>
                          </button>
                        )}                        {event.youtubeUrl && event.youtubeUrl !== 'null' && (
                          <button
                            onClick={(e) => handleSocialClick(event.youtubeUrl!, e)}
                            className="p-2 text-error hover:text-error/80 transition-colors duration-200"
                            aria-label="Visit YouTube channel"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </button>
                        )}
                        
                        {/* Share Button */}
                        <button
                          onClick={(e) => handleShareEvent(event, e)}
                          className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
                          aria-label="Share event"
                          title="Share event link"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Status Badge - Only for Organizer and Admin */}
                    {getStatusBadge(event)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </>
  );
};

export default EventsList;
