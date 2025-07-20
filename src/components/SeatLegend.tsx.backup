import React from 'react';

interface SeatLegendProps {
  showHeld?: boolean;
}

export const SeatLegend: React.FC<SeatLegendProps> = ({ showHeld = false }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-3">Seat Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border-2 border-green-700 rounded"></div>
          <span className="text-sm">Selected</span>
        </div>
        {showHeld && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-200 border-2 border-orange-400 rounded"></div>
            <span className="text-sm">Held (10 min)</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
          <span className="text-sm">Reserved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>
    </div>
  );
};
