// src/pages/EventsList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<Event[]>('https://kiwilanka.co.nz/api/Events')
      .then(response => {
        const eventsWithActive = response.data.map(event => ({
          ...event,
          isActive: new Date(event.date) > new Date()
        }));
        setEvents(eventsWithActive);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  const handleEventClick = (event: Event) => {
    if (!event.isActive) return; // Don't navigate if event is inactive
    navigate(`/event/${event.id}/tickets`, {
      state: {
        eventTitle: event.title,
        eventPrice: event.price,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* <h1 className="text-2xl font text-center text-primary mb-10">The Place to discover Sri Lankan Events in New Zealand</h1> */}
      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`relative cursor-pointer bg-white rounded-xl shadow-lg transition-all duration-300 group overflow-hidden
                ${event.isActive 
                  ? 'hover:shadow-xl' 
                  : 'hover:cursor-not-allowed'
                }`}
                >
                {/* Image Container */}
                <div className="relative">
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
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{event.description}</p>
                    <p className="text-sm text-gray-500 mb-1" style={{ textIndent: '-1.7em', paddingLeft: '1.7em' }}> 📍 {event.location}</p>
                    <p className="text-sm text-gray-500 mb-1" style={{ textIndent: '-1.2em', paddingLeft: '1.2em' }}> 
                      🕒 {new Date(event.date).toLocaleString()}
                      {!event.isActive && (
                        <span className="ml-2 text-primary font-medium">(Event Ended)</span>
                      )}
                    </p>
                </div>
                </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
