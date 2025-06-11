import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
}

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  axios.get<Event>('https://kiwilanka.co.nz/api/Events/${id}')
    .then(response => {
      setEvent(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error loading event:', error);
      setLoading(false);
    });
}, [id]);

  if (loading) return <p>Loading event details...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
      <p className="mb-2">{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Price:</strong> ${event.price}</p>

      <Link
        to="/payment"
        className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Proceed to Payment
      </Link>
    </div>
  );
};

export default EventDetails;
