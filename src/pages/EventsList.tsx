import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

const navigate = useNavigate(); 

  useEffect(() => {
    axios.get<Event[]>('http://localhost:5290/api/Events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  return (
    <>
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
                onClick={() =>
                    navigate(`/event/${event.id}/tickets`, {
                    state: {
                        eventTitle: event.title,
                        eventPrice: event.price,
                    },
                    })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
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

export default EventsList;
