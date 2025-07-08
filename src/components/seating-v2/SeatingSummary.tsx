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
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Selected Seats</h3>
      
      <div className="space-y-4">
        {/* Selected Seats List */}
        <div className="space-y-2">
          {selectedSeats.map(selected => (
            <div key={selected.seat.id} className="flex justify-between">
              <span>
                {selected.seat.row}{selected.seat.number} - {selected.seat.ticketType?.name || 'General'}
                {selected.ticketType && ` (${selected.ticketType.name})`}
              </span>
              <span>{formatPrice(selected.seat.price)}</span>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="pt-4 border-t">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={onClear}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear Selection
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatingSummary;
