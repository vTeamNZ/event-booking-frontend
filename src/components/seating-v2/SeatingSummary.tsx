// Seating Summary Component - Shows selection summary and checkout
import React from 'react';
import { X } from 'lucide-react';
import { SeatingSummaryProps } from '../../types/seating-v2';
import { formatPrice } from '../../utils/seating-v2/seatingUtils';

const SeatingSummary: React.FC<SeatingSummaryProps> = ({
  selectedSeats,
  totalPrice,
  onProceed,
  onClear,
  onRemoveSeat,
  onRefresh
}) => {
  const hasSelectedSeats = selectedSeats.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Selected Seats ({selectedSeats.length})</h3>
      
      <div className="space-y-4">
        {/* Selected Seats List or Empty State Message */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {hasSelectedSeats ? (
            selectedSeats.map(selected => (
              <div key={selected.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">
                    Seat {selected.row}{selected.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selected.ticketType?.name || 'General Admission'}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-semibold text-green-600 mr-3">
                    {formatPrice(selected.price || 0)}
                  </div>
                  {onRemoveSeat && (
                    <button 
                      onClick={() => onRemoveSeat(selected)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove seat"
                      aria-label={`Remove seat ${selected.row}${selected.number}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="text-gray-500">
                <div className="text-lg mb-2">No seats selected</div>
                <div className="text-sm">Please select at least one seat to continue</div>
              </div>
            </div>
          )}
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
        <div className="space-y-3 pt-4">
          {/* Main Action Buttons */}
          <div className="flex justify-between items-center space-x-4">
            <button
              onClick={onClear}
              disabled={!hasSelectedSeats}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                hasSelectedSeats
                  ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              Clear Selection
            </button>
            <button
              onClick={onProceed}
              disabled={!hasSelectedSeats}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${
                hasSelectedSeats
                  ? 'text-white bg-primary hover:bg-red-600'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
            >
              Reserve Selected Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingSummary;
