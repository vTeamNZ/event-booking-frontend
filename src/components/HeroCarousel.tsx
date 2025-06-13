import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
}

const HeroCarousel: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get<Event[]>('https://kiwilanka.co.nz/api/Events')
      .then(res => {
        setEvents(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
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

  return (
    <div className="relative w-full overflow-hidden pt-20">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
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
          speed={3000} // Smooth transition speed (1s)
          autoplay={{
            delay: 0, // Slower autoplay delay (5s between slides)
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          >
          {events.map((event) => (
            <SwiperSlide
              key={event.id}
              style={{ width: '300px' }}
              className="cursor-pointer"              onClick={() => {
                const eventSlug = event.title
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^\w\-]+/g, '')
                  .replace(/\-\-+/g, '-')
                  .trim();
                navigate(`/event/${eventSlug}/tickets`, {
                  state: {
                    eventId: event.id,
                    eventTitle: event.title,
                    eventPrice: event.price,
                  },
                });
              }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img
                  src={event.imageUrl || '/events/fallback.jpg'}
                  alt={event.title}
                  className="w-full h-[420px] object-cover"
                />
                <div className="p-3 text-center font-semibold text-sm text-gray-700">
                  {event.title}
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
