// Seating Legend Component - Shows seat types and status
import React from 'react';
import { SeatingLegendProps } from '../../types/seating-v2';
import { formatPrice } from '../../utils/seating-v2/seatingUtils';

const SeatingLegend: React.FC<SeatingLegendProps> = ({
  ticketTypes
}) => {
  // Filter out standing tickets to show only seated ticket types
  const seatedTicketTypes = ticketTypes.filter(type => !type.isStanding);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      {/* Ticket Types */}
      {seatedTicketTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Ticket Types</h3>
          <div className="flex flex-wrap gap-4">
            {seatedTicketTypes.map(type => (
              <div key={type.id} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: type.color }}
                />
                <span>{type.name} - {formatPrice(type.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Seat Status</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2 bg-blue-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2 bg-gray-300 border-2 border-yellow-400" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2 bg-red-500" />
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingLegend;
