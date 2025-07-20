import React, { useState, useEffect } from 'react';
import { TicketType } from '../types/ticketTypes';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';

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
        const data = await seatingAPIService.getEventTicketTypes(eventId);
        // Transform to include eventId for compatibility
        const transformedData = data.map((ticketType: any) => ({
          ...ticketType,
          eventId: eventId
        }));
        setTicketTypes(transformedData);
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

  // Display the ticket types with their colors
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Types</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTicketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: ticket.color }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{ticket.type}</div>
              <div className="text-sm text-gray-600">${ticket.price.toFixed(2)}</div>
              {ticket.description && (
                <div className="text-xs text-gray-500 mt-1">{ticket.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTypeDisplay;
