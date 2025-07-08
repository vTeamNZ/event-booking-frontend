import React, { useState, useEffect } from 'react';
import { TicketType } from '../types/ticketTypes';
import { seatSelectionService } from '../services/seatSelectionService';

interface TicketTypeDisplayProps {
  eventId: number;
}

const TicketTypeDisplay: React.FC<TicketTypeDisplayProps> = ({ eventId }) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        setLoading(true);
        const data = await seatSelectionService.getEventTicketTypes(eventId);
        setTicketTypes(data);
      } catch (err) {
        console.error('Error fetching ticket types:', err);
        setError('Failed to load ticket types');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketTypes();
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!ticketTypes.length) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No ticket types available for this event.
      </div>
    );
  }

  // Filter out "General ($0.00)" ticket type if it's not explicitly defined by the organizer
  const filteredTicketTypes = ticketTypes.filter(ticket => 
    ticket.price > 0 || ticket.type !== "General"
  );
  
  if (!filteredTicketTypes.length) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No ticket types available for this event.
      </div>
    );
  }

  // Return an empty fragment to hide this component completely
  return null;
};

export default TicketTypeDisplay;
