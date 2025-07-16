import React, { useState, useEffect } from 'react';
import { AlertCircle, Users } from 'lucide-react';
import AisleRenderer from './AisleRenderer';
import type { LayoutElement, Section } from './types';

interface SeatSelectionViewProps {
  venueLayout: {
    sections: Section[];
    elements: LayoutElement[];
    // Aisle configuration
    hasHorizontalAisles?: boolean;
    horizontalAisleRows?: string;
    hasVerticalAisles?: boolean;
    verticalAisleSeats?: string;
    aisleWidth?: number;
  };
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSelections?: number;
  onError?: (message: string) => void;
}

const SeatSelectionView: React.FC<SeatSelectionViewProps> = ({
  venueLayout,
  selectedSeats,
  onSeatSelect,
  maxSelections = 10,
  onError
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSeatClick = (seatId: string) => {
    const seat = venueLayout.elements.find(e => e.id === seatId && e.type === 'seat');
    if (!seat) return;

    if (seat.properties.isBlocked) {
      // Visual feedback is sufficient - seat appears grayed out
      return;
    }

    if (seat.properties.isReserved) {
      // Visual feedback is sufficient - seat appears red
      return;
    }

    if (selectedSeats.includes(seatId)) {
      onSeatSelect(seatId); // Will remove the seat
    } else if (selectedSeats.length < maxSelections) {
      onSeatSelect(seatId); // Will add the seat
    } else {
      onError?.(`You can only select up to ${maxSelections} seats`);
    }
  };

  const getSeatColor = (seat: LayoutElement): string => {
    if (seat.properties.isBlocked) return '#cbd5e1';
    if (seat.properties.isReserved) return '#ef4444';
    if (selectedSeats.includes(seat.id)) return '#22c55e';
    if (hoveredSeat === seat.id) return '#3b82f6';
    
    const section = venueLayout.sections.find(s => s.id === seat.sectionId);
    return section?.color || '#e2e8f0';
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Select Your Seats</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{selectedSeats.length} of {maxSelections} selected</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {venueLayout.sections.map(section => (
            <div
              key={section.id}
              className="px-3 py-1.5 rounded text-sm font-medium"
              style={{ backgroundColor: section.color + '20', color: section.color }}
            >
              {section.name}
            </div>
          ))}
        </div>

        <div className="relative w-full aspect-[4/3] border rounded-lg overflow-hidden">
          {/* Aisles Overlay */}
          <AisleRenderer
            layoutData={venueLayout}
            containerWidth={800}
            containerHeight={600}
            rowSpacing={40}
            seatSpacing={30}
          />
          
          {/* Seat rendering */}
          <div className="absolute inset-0 grid place-items-center text-gray-400">
            {loading ? (
              <p>Loading seat map...</p>
            ) : (
              <div className="grid grid-cols-10 gap-2 p-4">
                {venueLayout.elements
                  .filter(element => element.type === 'seat')
                  .map(seat => (
                    <button
                      key={seat.id}
                      className="w-6 h-6 rounded transition-colors"
                      style={{ backgroundColor: getSeatColor(seat) }}
                      onClick={() => handleSeatClick(seat.id)}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={seat.properties.isBlocked || seat.properties.isReserved}
                    >
                      {seat.properties.seatNumber}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#22c55e]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#ef4444]" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#cbd5e1]" />
              <span>Not Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionView;
