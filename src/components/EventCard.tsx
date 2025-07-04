// Example: EventCard component
import React from 'react';
import { isEventActive, isEventExpired, getEventStatusText } from '../utils/eventUtils';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    date: string;
    imageUrl: string;
    location: string;
  };
  onBookClick: (eventId: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onBookClick }) => {
  const eventIsActive = isEventActive(event.date);
  const eventIsExpired = isEventExpired(event.date);
  const statusText = getEventStatusText(event.date);

  return (
    <div className={`event-card ${eventIsExpired ? 'event-expired' : ''}`}>
      <div className="event-image-container">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className={`event-image ${eventIsExpired ? 'grayscale opacity-50' : ''}`}
        />
        {eventIsExpired && (
          <div className="event-status-overlay">
            <span className="status-badge bg-red-500 text-white">
              {statusText}
            </span>
          </div>
        )}
      </div>
      
      <div className="event-details">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">
          {new Date(event.date).toLocaleDateString()}
        </p>
        <p className="event-location">{event.location}</p>
        
        <div className="event-actions">
          {eventIsActive ? (
            <button 
              className="btn btn-primary"
              onClick={() => onBookClick(event.id)}
            >
              Book Now
            </button>
          ) : (
            <button 
              className="btn btn-secondary" 
              disabled
            >
              {statusText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
