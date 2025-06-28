// src/pages/EventsList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import config from '../config/api';
import SEO from '../components/SEO';

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
}

interface Event extends EventFromAPI {
  isActive: boolean;
  organizerName: string;
  city: string;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  organizerSlug: string;
}

// Helper function to create URL-friendly slug
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .trim();                  // Trim - from start and end
};

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
        // First, fetch all events
        const eventsResponse = await axios.get<EventFromAPI[]>(`${config.apiBaseUrl}/Events`);
        console.log('Events from API:', eventsResponse.data);
        
        // Get unique organizer IDs from events
        const organizerIds = eventsResponse.data
          .map(event => event.organizerId)
          .filter((value, index, self) => self.indexOf(value) === index)
          .filter(id => id != null); // Filter out null organizerIds
        
        console.log('Fetching organizers for IDs:', organizerIds);
        
        // Fetch organizer details for each unique organizerId
        const organizerPromises = organizerIds.map(id => 
          axios.get<Organizer>(`${config.apiBaseUrl}/Organizers/${id}`)
        );
        const organizerResponses = await Promise.all(organizerPromises);
        
        // Debug organizer responses
        console.log('Organizer Responses:', organizerResponses.map(r => r.data));
        
        // Create a map of organizerId to organizer details
        const organizerMap = new Map<number, Organizer>(
          organizerResponses.map(response => [response.data.id, response.data])
        );
        
        // Extract city and combine event data with organizer names and active status
        const eventsWithDetails = eventsResponse.data.map(event => {
          // Extract city from location (assumes format like "Venue Name, Street, City, Region")
          const locationParts = event.location.split(',').map(part => part.trim());
          const city = locationParts[locationParts.length - 2] || locationParts[0];
          const organizer = event.organizerId ? organizerMap.get(event.organizerId) : null;
          const organizerName = organizer?.name || 'Unknown Organizer';
          
          const eventWithDetails = {
            ...event,
            isActive: event.date ? new Date(event.date) > new Date() : false,
            organizerName,
            city,
            facebookUrl: organizer?.facebookUrl || null,
            youtubeUrl: organizer?.youtubeUrl || null,
            organizerSlug: createSlug(organizerName)
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
    return events.filter(event => {
      const matchesOrganizer = !organizerSlug || createSlug(event.organizerName || '') === organizerSlug;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      return matchesOrganizer && matchesCity;
    });
  }, [events, organizerSlug, selectedCity]);
  const createUrlSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .trim();                  // Trim - from start and end
  };
  
  const handleEventClick = (event: Event) => {
    if (!event.isActive) return;
    const eventSlug = createUrlSlug(event.title);
    navigate(`/event/${eventSlug}/tickets`, {
      state: {
        eventId: event.id,
        eventTitle: event.title,
        eventPrice: event.price,
        eventDate: event.date,
        eventLocation: event.location,
        eventDescription: event.description,
        organizerName: event.organizerName
      },
    });
  };

  const handleSocialClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };
  return (
    <>
      <SEO 
        title={organizerSlug 
          ? `${events.find(e => createSlug(e.organizerName || '') === organizerSlug)?.organizerName || 'Events'}`
          : "Browse Local Events Now"
        }
        description={organizerSlug
          ? `Book tickets for events organized by ${events.find(e => createSlug(e.organizerName || '') === organizerSlug)?.organizerName}. Simple and secure ticket booking with optional food ordering.`
          : "KiwiLanka brings you the best events from Christchurch to Auckland. Find your next event today."
        }
        keywords={[
          'Find Sri Lankan Events NZ', 
          'Events for Everyone in NZ', 
          'Browse Local Events Now',
          selectedCity !== 'all' ? `Events in ${selectedCity}` : ''
        ].filter(Boolean)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="mb-8 space-y-6">
            {/* Page Title with Organizer if present */}
            {organizerSlug && (
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {events.find(e => createSlug(e.organizerName || '') === organizerSlug)?.organizerName || 'Events'}
                  </h1>
                  <Link 
                    to="/"
                    className="text-primary hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    ← All Events
                  </Link>
                </div>
              </div>
            )}            {/* City Filter - Pills Style */}
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${selectedCity === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              {organizerSlug && ' for this organizer'}
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedCity('all');
                }}
                className="mt-4 text-primary hover:text-red-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`relative bg-white rounded-xl shadow-lg transition-all duration-300 group overflow-hidden
                    ${event.isActive ? 'hover:shadow-xl' : ''}`}
                >
                  {/* Image Container - Clickable */}
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => event.isActive && handleEventClick(event)}
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
                        <span className="bg-primary text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 text-lg">
                          🎫 BUY TICKETS
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">                        <div className="mb-2">
                          <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{event.description}</p>
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
                            className="p-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                            aria-label="Visit Facebook page"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                            </svg>
                          </button>
                        )}                        {event.youtubeUrl && event.youtubeUrl !== 'null' && (
                          <button
                            onClick={(e) => handleSocialClick(event.youtubeUrl!, e)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                            aria-label="Visit YouTube channel"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>      )}
        </>
      )}
    </div>
    </>
  );
};

export default EventsList;
