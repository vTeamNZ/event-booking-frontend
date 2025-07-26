// Example: EventDetails page
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isEventActive, isEventExpired, getEventStatusText, checkEventStatusFromServer } from '../utils/eventUtils';
import config from '../config/api';

interface EventData {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/events/${id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEventData(data);
        
        // Optional: Double-check with server status
        const serverStatus = await checkEventStatusFromServer(data.id);
        if (serverStatus) {
          console.log('Server event status:', serverStatus);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!eventData) return <div>Event not found</div>;

  const eventIsActive = isEventActive(eventData.date);
  const eventIsExpired = isEventExpired(eventData.date);
  const statusText = getEventStatusText(eventData.date);

  return (
    <div className="event-details">
      <div className="event-header">
        <img 
          src={eventData.imageUrl} 
          alt={eventData.title}
          className={`event-hero-image ${eventIsExpired ? 'grayscale opacity-75' : ''}`}
        />
        <h1>{eventData.title}</h1>
      </div>
      
      {/* Event Status Alert */}
      <div className={`alert ${eventIsExpired ? 'alert-warning' : 'alert-success'}`}>
        <h3>{statusText}</h3>
        <p>Event date: {new Date(eventData.date).toLocaleDateString()}</p>
        {eventIsExpired && (
          <p className="text-red-600">This event has ended and is no longer available for booking.</p>
        )}
      </div>

      {/* Event Information */}
      <div className="event-info">
        <p>{eventData.description}</p>
        <p><strong>Location:</strong> {eventData.location}</p>
        <p><strong>Date:</strong> {new Date(eventData.date).toLocaleString()}</p>
      </div>

      {/* Booking Section - Only show if event is active */}
      {eventIsActive ? (
        <div className="booking-section">
          <h2>Book Your Tickets</h2>
          <button className="btn btn-primary btn-lg">
            Proceed to Booking
          </button>
        </div>
      ) : (
        <div className="booking-disabled">
          <h2>Booking Unavailable</h2>
          <p>This event has ended. Booking is no longer available.</p>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
