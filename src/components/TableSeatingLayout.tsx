import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X } from 'lucide-react';
import { 
  SeatLayoutResponse, 
  SelectedTable, 
  Table,
  Seat,
  SeatStatus 
} from '../types/seatSelection';
import { cn, formatPrice } from '../utils/seatSelection';

interface TableSeatingLayoutProps {
  layout: SeatLayoutResponse;
  selectedTables: SelectedTable[];
  onTableSelect: (tableId: number, seatIds: number[], fullTable?: boolean) => void;
}

const TableSeatingLayout: React.FC<TableSeatingLayoutProps> = ({
  layout,
  selectedTables,
  onTableSelect
}) => {
  const [selectedTableForSeats, setSelectedTableForSeats] = useState<Table | null>(null);
  const [tempSelectedSeats, setTempSelectedSeats] = useState<number[]>([]);

  const isTableSelected = (tableId: number) => {
    return selectedTables.some(st => st.table.id === tableId);
  };

  const getTableClass = (table: Table) => {
    const isSelected = isTableSelected(table.id);
    const hasAvailableSeats = table.availableSeats > 0;
    
    if (isSelected) {
      return 'border-blue-600 bg-blue-100 text-blue-900';
    }
    
    if (!hasAvailableSeats) {
      return 'border-red-300 bg-red-50 text-red-600 cursor-not-allowed opacity-60';
    }
    
    return 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-md cursor-pointer';
  };

  const getSeatClass = (seat: Seat, isTemp: boolean = false) => {
    if (isTemp) {
      return 'bg-blue-200 border-blue-400 text-blue-900';
    }
    
    switch (seat.status) {
      case SeatStatus.Available:
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case SeatStatus.Reserved:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed';
      case SeatStatus.Booked:
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
      case SeatStatus.Unavailable:
        return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-500';
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.availableSeats === 0 || isTableSelected(table.id)) return;
    
    // Open seat selection modal for this table
    setSelectedTableForSeats(table);
    setTempSelectedSeats([]);
  };

  const handleSeatToggle = (seatId: number) => {
    setTempSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleFullTableSelect = () => {
    if (!selectedTableForSeats) return;
    
    const availableSeats = selectedTableForSeats.seats
      .filter(seat => seat.status === SeatStatus.Available)
      .map(seat => seat.id);
    
    onTableSelect(selectedTableForSeats.id, availableSeats, true);
    setSelectedTableForSeats(null);
    setTempSelectedSeats([]);
  };

  const handleConfirmSeatSelection = () => {
    if (!selectedTableForSeats || tempSelectedSeats.length === 0) return;
    
    onTableSelect(selectedTableForSeats.id, tempSelectedSeats, false);
    setSelectedTableForSeats(null);
    setTempSelectedSeats([]);
  };

  const renderTable = (table: Table) => {
    const isSelected = isTableSelected(table.id);
    const selectedTable = selectedTables.find(st => st.table.id === table.id);
    
    return (
      <div
        key={table.id}
        className={cn(
          'absolute border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center p-2 min-w-20 min-h-20',
          getTableClass(table)
        )}
        style={{
          left: `${table.x}px`,
          top: `${table.y}px`,
          width: `${Math.max(table.width, 80)}px`,
          height: `${Math.max(table.height, 80)}px`,
          borderRadius: table.shape === 'round' ? '50%' : '8px'
        }}
        onClick={() => handleTableClick(table)}
      >
        <div className="text-center">
          <div className="font-semibold text-sm">{table.tableNumber}</div>
          <div className="flex items-center justify-center gap-1 text-xs">
            <Users size={12} />
            <span>
              {isSelected 
                ? `${selectedTable?.selectedSeats.length}/${table.capacity}`
                : `${table.availableSeats}/${table.capacity}`
              }
            </span>
          </div>
          <div className="text-xs font-medium">
            {table.tablePrice 
              ? formatPrice(table.tablePrice)
              : formatPrice(table.pricePerSeat)
            }
          </div>
        </div>
        
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"
          >
            <Check size={14} />
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {layout.venue?.name || 'Restaurant'} Table Layout
        </h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span>Available Tables</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-600 rounded"></div>
            <span>Selected Tables</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
            <span>Fully Booked</span>
          </div>
        </div>
      </div>

      {/* Stage */}
      {layout.stage && (
        <div className="mb-8 flex justify-center">
          <div 
            className="bg-gray-800 text-white text-center py-4 px-8 rounded-lg shadow-lg"
            style={{
              width: `${Math.max(layout.stage.width, 200)}px`,
              height: `${Math.max(layout.stage.height, 60)}px`,
            }}
          >
            <div className="text-lg font-semibold">STAGE</div>
          </div>
        </div>
      )}

      {/* Table Map */}
      <div className="relative overflow-auto">
        <div 
          className="relative bg-gray-50 rounded-lg p-4 min-h-96"
          style={{
            width: Math.max(layout.venue?.width || 800, 600),
            height: Math.max(layout.venue?.height || 600, 400)
          }}
        >
          {layout.tables.map(renderTable)}
        </div>
      </div>

      {/* Seat Selection Modal */}
      <AnimatePresence>
        {selectedTableForSeats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTableForSeats(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Select Seats at Table {selectedTableForSeats.tableNumber}
                </h3>
                <button
                  onClick={() => setSelectedTableForSeats(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {selectedTableForSeats.seats.map(seat => {
                  const isTemp = tempSelectedSeats.includes(seat.id);
                  const isClickable = seat.status === SeatStatus.Available;
                  
                  return (
                    <button
                      key={seat.id}
                      className={cn(
                        'aspect-square border-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center',
                        getSeatClass(seat, isTemp)
                      )}
                      onClick={() => isClickable && handleSeatToggle(seat.id)}
                      disabled={!isClickable}
                      title={`Seat ${seat.seatNumber} - ${formatPrice(seat.price)}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Selected: {tempSelectedSeats.length} seats
                {tempSelectedSeats.length > 0 && (
                  <span className="ml-2 font-medium">
                    Total: {formatPrice(
                      tempSelectedSeats.reduce((sum, seatId) => {
                        const seat = selectedTableForSeats.seats.find(s => s.id === seatId);
                        return sum + (seat?.price || 0);
                      }, 0)
                    )}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFullTableSelect}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  disabled={selectedTableForSeats.availableSeats === 0}
                >
                  Book Full Table
                  {selectedTableForSeats.tablePrice && (
                    <span className="block text-xs">
                      {formatPrice(selectedTableForSeats.tablePrice)}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleConfirmSeatSelection}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={tempSelectedSeats.length === 0}
                >
                  Book Selected Seats
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableSeatingLayout;
