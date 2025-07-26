import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { navigateToEvent } from '../utils/slugUtils';

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  date: string | null;
  location: string;
  isActive: boolean;
  status?: number; // 0=Draft, 1=Pending, 2=Active, 3=Inactive
  seatSelectionMode?: 1 | 3; // 1=EventHall, 3=GeneralAdmission
  organizerName?: string;
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

const HeroCarousel: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Get current user to determine what events to show
        const currentUser = authService.getCurrentUser();
        const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');

        let eventsData: Event[] = [];

        if (isOrganizer) {
          // Organizers see their own events (including drafts for testing)
          const response = await api.get<Event[]>('/Events/by-organizer');
          eventsData = Array.isArray(response.data) ? response.data : [];
          
          // Filter organizer events to show upcoming events and recent drafts/pending
          eventsData = eventsData.filter(event => {
            // Show all events with dates in the future
            if (event.date) {
              const eventDate = new Date(event.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return eventDate >= today;
            }
            // For events without dates, only show if they're draft or pending (for testing)
            const eventStatus = event.status ?? (event.isActive ? 2 : 3);
            return eventStatus === 0 || eventStatus === 1; // Draft or Pending
          });
        } else {
          // Public users see active events only (API already filters this)
          const response = await api.get<Event[]>('/Events');
          eventsData = Array.isArray(response.data) ? response.data : [];
        }

        console.log('Carousel events data:', eventsData);
        console.log('Valid events with images:', eventsData.filter(event => event.imageUrl));
        
        // Only show events with images for better carousel display
        const validEvents = Array.isArray(eventsData) ? eventsData.filter(event => event.imageUrl) : [];

        setEvents(validEvents);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching events for carousel:', err);
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data: any, status: number } };
          console.error('API Error Details:', {
            response: axiosError.response?.data,
            status: axiosError.response?.status
          });
        }
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Only show carousel if we have events
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden pt-20 min-h-[400px] flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="relative w-full overflow-hidden pt-20 min-h-[400px] flex items-center justify-center">
        <div className="text-white text-xl">No events available</div>
      </div>
    );
  }

  // Debug carousel configuration
  console.log('Carousel configuration:', {
    eventsCount: events.length,
    loopEnabled: events.length > 2,
    autoplayDelay: 4000,
    speed: 1000
  });

  return (
    <div className="relative w-full overflow-hidden pt-20">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/background.jpg')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Swiper carousel */}
      <div className="relative z-10 py-10 px-4 max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, EffectCoverflow]}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={events.length > 2} // Only enable loop mode if we have more than 2 slides
          speed={1000} // Smooth transition speed (1s)
          autoplay={{
            delay: 4000, // 4 seconds between slides
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            reverseDirection: false,
          }}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          watchSlidesProgress={true}
          allowTouchMove={true}
          >
          {events.map((event) => (
            <SwiperSlide
              key={event.id}
              style={{ width: '300px' }}
              className="cursor-pointer"
              onClick={() => {
                // Get current user to determine navigation logic
                const currentUser = authService.getCurrentUser();
                const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
                const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');
                
                // Check event status
                const eventStatus = event.status ?? (event.isActive ? 2 : 3);
                
                // Allow booking for:
                // - Active events (everyone)
                // - Draft events (organizers for testing)
                // - Pending events (admins for review)
                const canBook = eventStatus === 2 || 
                               (eventStatus === 0 && isOrganizer) || 
                               (eventStatus === 1 && isAdmin);
                
                if (!canBook) {
                  // Navigate to events list for non-bookable events
                  if (isOrganizer) {
                    navigate('/organizer/dashboard');
                  } else if (isAdmin) {
                    navigate('/admin/events');
                  } else {
                    navigate('/events');
                  }
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
              }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg relative">
                {/* Status badge for organizers */}
                {(() => {
                  const currentUser = authService.getCurrentUser();
                  const isOrganizer = currentUser && currentUser.roles && currentUser.roles.includes('Organizer');
                  const eventStatus = event.status ?? (event.isActive ? 2 : 3);
                  
                  if (isOrganizer && eventStatus === 0) {
                    return (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-info text-black text-xs px-2 py-1 rounded-full">
                          🧪 TEST
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <img
                  src={event.imageUrl || `${process.env.PUBLIC_URL}/events/fallback.jpg`}
                  alt={event.title}
                  className="w-full h-[420px] object-cover"
                />
                <div className="p-3">
                  <div className="text-center font-semibold text-sm text-gray-700 mb-1">
                    {event.title}
                  </div>
                  {event.date && (
                    <div className="text-center text-xs text-gray-500 mb-1">
                      {new Date(event.date).toLocaleDateString('en-NZ', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {event.location && (
                    <div className="text-center text-xs text-gray-500 truncate">
                      📍 {event.location}
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HeroCarousel;
