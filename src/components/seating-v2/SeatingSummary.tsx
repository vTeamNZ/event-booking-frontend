// Seating Summary Component - Shows selection summary and checkout
import React from 'react';
import { SeatingSummaryProps } from '../../types/seating-v2';
import { formatPrice } from '../../utils/seating-v2/seatingUtils';

const SeatingSummary: React.FC<SeatingSummaryProps> = ({
  selectedSeats,
  totalPrice,
  onProceed,
  onClear
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Selected Seats ({selectedSeats.length})</h3>
      
      <div className="space-y-4">
        {/* Selected Seats List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedSeats.map(selected => (
            <div key={selected.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="font-medium">
                  Seat {selected.row}{selected.number}
                </div>
                <div className="text-sm text-gray-600">
                  {selected.ticketType?.name || 'General Admission'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  {formatPrice(selected.price || 0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 space-x-4">
          <button
            onClick={onClear}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatingSummary;
