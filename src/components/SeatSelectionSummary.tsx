import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CreditCard, X } from 'lucide-react';
import { 
  SeatSelectionState, 
  SeatSelectionMode 
} from '../types/seatSelection';
import { formatPrice } from '../utils/seatSelection';

interface SeatSelectionSummaryProps {
  selectionState: SeatSelectionState;
  onProceedToCheckout: () => void;
}

const SeatSelectionSummary: React.FC<SeatSelectionSummaryProps> = ({
  selectionState,
  onProceedToCheckout
}) => {
  const hasSelections = 
    selectionState.selectedSeats.length > 0 ||
    selectionState.selectedTables.length > 0 ||
    selectionState.generalTickets.length > 0;

  const getTotalItems = () => {
    return (
      selectionState.selectedSeats.length +
      selectionState.selectedTables.reduce((sum, table) => sum + table.selectedSeats.length, 0) +
      selectionState.generalTickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
    );
  };

  const renderSeatSelections = () => {
    if (selectionState.selectedSeats.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Selected Seats</h4>
        <div className="space-y-2">
          {selectionState.selectedSeats.map(({ seat }) => (
            <div key={seat.id} className="flex justify-between items-center text-sm">
              <span>Seat {seat.seatNumber}</span>
              <span className="font-medium">{formatPrice(seat.price)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTableSelections = () => {
    if (selectionState.selectedTables.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Selected Tables</h4>
        <div className="space-y-3">
          {selectionState.selectedTables.map(({ table, selectedSeats, isFullTable }) => (
            <div key={table.id} className="border-l-4 border-blue-500 pl-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Table {table.tableNumber}</div>
                  <div className="text-xs text-gray-600">
                    {isFullTable ? 'Full table' : `${selectedSeats.length} seats`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatPrice(selectedSeats.reduce((sum, seat) => sum + seat.price, 0))}
                  </div>
                </div>
              </div>
              {!isFullTable && (
                <div className="mt-1 text-xs text-gray-500">
                  Seats: {selectedSeats.map(seat => seat.seatNumber).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGeneralTickets = () => {
    if (selectionState.generalTickets.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Tickets</h4>
        <div className="space-y-2">
          {selectionState.generalTickets.map(({ ticketType, quantity }) => (
            <div key={ticketType.id} className="flex justify-between items-center text-sm">
              <div>
                <div>{ticketType.name}</div>
                <div className="text-xs text-gray-600">Qty: {quantity}</div>
              </div>
              <span className="font-medium">
                {formatPrice(ticketType.price * quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={20} className="text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Booking Summary</h3>
      </div>

      {!hasSelections ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
          <p>No items selected yet</p>
          <p className="text-sm mt-1">
            {selectionState.mode === SeatSelectionMode.GeneralAdmission 
              ? 'Select your tickets to continue'
              : 'Select your seats to continue'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Selection Details */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            {renderSeatSelections()}
            {renderTableSelections()}
            {renderGeneralTickets()}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Total Items: {getTotalItems()}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">
                {formatPrice(selectionState.totalPrice)}
              </span>
            </div>
          </div>

          {/* Reservation Timer */}
          {(selectionState.selectedSeats.length > 0 || selectionState.selectedTables.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  Seats reserved for 10 minutes
                </span>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                Complete your booking to secure your seats
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <motion.button
            onClick={onProceedToCheckout}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CreditCard size={20} />
            Proceed to Checkout
          </motion.button>

          {/* Security Note */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            🔒 Secure payment powered by Stripe
          </div>
        </>
      )}
    </div>
  );
};

export default SeatSelectionSummary;
