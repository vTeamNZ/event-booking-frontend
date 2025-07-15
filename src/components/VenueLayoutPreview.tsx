import React from 'react';

import { TicketTypeData } from '../types/ticketTypes';

interface VenueLayoutPreviewProps {
  layout: any;
  selectedVenue: any;
  className?: string;
  ticketTypes?: TicketTypeData[];
}

// Helper function to generate a stable color from a string (ticket type name)
const getStableColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const VenueLayoutPreview: React.FC<VenueLayoutPreviewProps> = ({
  layout,
  selectedVenue,
  className = "",
  ticketTypes = []
}) => {
  // Debug log to verify props
  console.log('VenueLayoutPreview props:', { ticketTypes, layout });
  console.log('VenueLayoutPreview - ticketTypes detailed:', ticketTypes.map(tt => ({
    type: tt.type,
    price: tt.price,
    seatRows: tt.seatRows,
    hasSeatRows: tt.seatRows && tt.seatRows.length > 0,
    seatRowsWithValues: tt.seatRows?.filter(sr => sr.rowStart && sr.rowEnd)
  })));
  
  if (!layout) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        No layout data available for this venue
      </div>
    );
  }

  const renderAisles = () => {
    if (!selectedVenue) return null;

    const aisles: JSX.Element[] = [];

    // Helper function to parse aisle data (could be string, array, or other format)
    const parseAisleData = (data: any): number[] => {
      if (!data) return [];
      
      if (Array.isArray(data)) {
        return data.filter(item => typeof item === 'number');
      }
      
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'number') : [];
        } catch {
          // If JSON parsing fails, try comma-separated values
          return data.split(',')
            .map(item => parseInt(item.trim()))
            .filter(num => !isNaN(num));
        }
      }
      
      if (typeof data === 'number') {
        return [data];
      }
      
      return [];
    };

    // Horizontal aisles - check both camelCase and PascalCase property names
    const horizontalAislesData = selectedVenue.horizontalAisleRows || selectedVenue.HorizontalAisleRows;
    if (selectedVenue.hasHorizontalAisles || selectedVenue.HasHorizontalAisles) {
      if (horizontalAislesData) {
        const horizontalAisles = parseAisleData(horizontalAislesData);
        horizontalAisles.forEach((rowNum: number) => {
          const y = rowNum * (selectedVenue.rowSpacing || 40);
          aisles.push(
            <div
              key={`h-aisle-${rowNum}`}
              className="absolute bg-gray-100 border-y border-gray-300 flex items-center justify-center"
              style={{
                left: 0,
                top: `${y}px`,
                width: '100%',
                height: `${selectedVenue.aisleWidth || 20}px`
              }}
            >
              <span className="text-xs text-gray-500 whitespace-nowrap px-2">Aisle {rowNum + 1}</span>
            </div>
          );
        });
      }
    }

    // Vertical aisles - check both camelCase and PascalCase property names
    const verticalAislesData = selectedVenue.verticalAisleSeats || selectedVenue.VerticalAisleSeats;
    if (selectedVenue.hasVerticalAisles || selectedVenue.HasVerticalAisles) {
      if (verticalAislesData) {
        const verticalAisles = parseAisleData(verticalAislesData);
        verticalAisles.forEach((seatNum: number) => {
          const x = seatNum * (selectedVenue.seatSpacing || 30);
          aisles.push(
            <div
              key={`v-aisle-${seatNum}`}
              className="absolute bg-gray-100 border-x border-gray-300 flex items-center justify-center"
              style={{
                left: `${x}px`,
                top: 0,
                width: `${selectedVenue.aisleWidth || 20}px`,
                height: '100%'
              }}
            >
              <span 
                className="text-xs text-gray-500 whitespace-nowrap px-2"
                style={{ transform: 'rotate(-90deg)' }}
              >
                Aisle {String.fromCharCode(65 + seatNum)}
              </span>
            </div>
          );
        });
      }
    }

    return aisles;
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">{selectedVenue?.name}</h4>
        <span className="text-sm text-gray-500">
          Capacity: {selectedVenue?.capacity} seats
        </span>
      </div>
      
      {/* Layout visualization */}
      <div className="bg-white rounded-md p-4 border overflow-hidden">
        <div className="relative w-full h-[400px] flex items-center justify-center">
          <div className="relative" style={{ 
            width: `${layout.venue?.width || 800}px`, 
            height: `${layout.venue?.height || 600}px`,
            transform: 'scale(0.35)',
            transformOrigin: 'center',
            margin: '0 auto'
          }}>
            {/* Stage */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg text-center font-bold px-16 py-4 shadow-md">
                <span className="text-white text-lg">STAGE</span>
              </div>
            </div>

            {/* Aisles */}
            {renderAisles()}
            
            {/* Seats */}
            {layout.seats?.map((seat: any, index: number) => {
              // First check if this seat is assigned to a ticket type based on row
              const assignedTicketType = ticketTypes.find(tt => 
                tt.seatRows.some(sr => {
                  if (!sr.rowStart || !sr.rowEnd) return false;
                  const rowStart = sr.rowStart.charCodeAt(0);
                  const rowEnd = sr.rowEnd.charCodeAt(0);
                  const currentRow = seat.row.charCodeAt(0);
                  return currentRow >= rowStart && currentRow <= rowEnd;
                })
              );
              
              const ticketType = assignedTicketType || seat.ticketType;
              const seatColor = ticketType
                ? (ticketType.color || getStableColor(ticketType.name))
                : '#6B7280';
                
              const seatTitle = ticketType
                ? `${seat.row}${seat.number} - ${ticketType.name} ($${ticketType.price})`
                : `${seat.row}${seat.number} - General`;

              return (
                <div
                  key={index}
                  className="absolute w-6 h-6 rounded text-xs flex items-center justify-center text-white font-bold transition-all hover:scale-110 cursor-pointer"
                  style={{
                    left: `${seat.x}px`,
                    top: `${seat.y}px`,
                    backgroundColor: seatColor
                  }}
                  title={seatTitle}
                >
                  {seat.number}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket Type Legend */}
      <div className="mt-4 space-y-4">
        {ticketTypes && ticketTypes.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Ticket Types:</h5>
            <div className="flex flex-wrap gap-3">
              {ticketTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: type.color || getStableColor(type.type) }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {type.type} (${type.price})
                    {type.seatRows?.length > 0 && ` - Rows: ${
                      type.seatRows
                        .filter(sr => sr.rowStart && sr.rowEnd)
                        .map(sr => sr.rowStart === sr.rowEnd ? sr.rowStart : `${sr.rowStart}-${sr.rowEnd}`)
                        .join(', ')
                    }`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueLayoutPreview;
