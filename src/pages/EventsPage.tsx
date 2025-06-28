import React, { useEffect, useState } from 'react';
import { getAllEvents, Event } from '../services/eventService';
import SEO from '../components/SEO';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch((err) => console.error("Failed to load events", err));
  }, []);

  return (
    <>
      <SEO 
        title="Events Calendar" 
        description="Browse all upcoming Sri Lankan cultural events across New Zealand. Find dates, venues, and book your tickets online with ease." 
        keywords={["Sri Lankan Events NZ", "Cultural Events Calendar", "Upcoming Events", "Event Tickets Online"]}
      />
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        📅 Upcoming Events
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-4 shadow rounded-lg">
              <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
              <p className="text-gray-700 mb-1">{event.description}</p>
              <p className="text-sm text-gray-600 mb-1">
                📍 {event.location} | 🕒 {new Date(event.date).toLocaleString()}
              </p>
              <p className="font-semibold mb-3">💵 ${event.price}</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => alert(`TODO: Book ticket for event #${event.id}`)}
              >
                🎫 Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EventsPage;
