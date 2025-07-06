import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface TableSeatLayoutProps {
  eventId: number;
  onSeatSelect: (seatId: number, selected: boolean) => void;
  onTableSelect: (tableId: number, selected: boolean) => void;
  selectedSeats: number[];
  selectedTables: number[];
  allowTableBooking: boolean;
}

interface Section {
  id: number;
  name: string;
  color: string;
  basePrice: number;
}

interface Seat {
  id: number;
  row: string;
  number: number;
  seatNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  status: 'Available' | 'Reserved' | 'Booked' | 'Unavailable';
  tableId?: number;
}

interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'round' | 'square' | 'rectangle';
  pricePerSeat: number;
  tablePrice?: number;
  sectionId?: number;
  section?: Section;
  seats: Seat[];
}

interface TableSeatLayout {
  tables: Table[];
  sections: Section[];
  stagePosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const TableSeatLayout: React.FC<TableSeatLayoutProps> = ({
  eventId,
  onSeatSelect,
  onTableSelect,
  selectedSeats,
  selectedTables,
  allowTableBooking
}) => {
  const [layout, setLayout] = useState<TableSeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/tables/event/${eventId}/layout`);
        setLayout(response.data as TableSeatLayout);
      } catch (err: any) {
        setError('Failed to load table layout');
        toast.error('Failed to load table layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  const handleTableClick = (table: Table) => {
    if (!allowTableBooking) return;
    
    const isSelected = selectedTables.includes(table.id);
    onTableSelect(table.id, !isSelected);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'Available' || allowTableBooking) return;
    
    const isSelected = selectedSeats.includes(seat.id);
    onSeatSelect(seat.id, !isSelected);
  };

  const getTableClassName = (table: Table) => {
    const isSelected = selectedTables.includes(table.id);
    const hasBookedSeats = table.seats.some(seat => seat.status === 'Booked');
    const allSeatsBooked = table.seats.every(seat => seat.status === 'Booked');
    
    let baseClasses = "table absolute border-2 flex items-center justify-center font-bold text-sm transition-all duration-200";
    
    if (table.shape === 'round') {
      baseClasses += " rounded-full";
    } else if (table.shape === 'square') {
      baseClasses += " rounded-lg";
    } else {
      baseClasses += " rounded";
    }

    if (allowTableBooking) {
      baseClasses += " cursor-pointer hover:scale-105";
      
      if (allSeatsBooked) {
        return `${baseClasses} bg-red-200 border-red-400 text-red-800 cursor-not-allowed`;
      } else if (isSelected) {
        return `${baseClasses} bg-green-500 border-green-700 text-white`;
      } else if (hasBookedSeats) {
        return `${baseClasses} bg-yellow-200 border-yellow-400 text-yellow-800`;
      } else {
        return `${baseClasses} bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200`;
      }
    } else {
      if (allSeatsBooked) {
        return `${baseClasses} bg-red-200 border-red-400 text-red-800`;
      } else if (hasBookedSeats) {
        return `${baseClasses} bg-yellow-200 border-yellow-400 text-yellow-800`;
      } else {
        return `${baseClasses} bg-blue-100 border-blue-300 text-blue-800`;
      }
    }
  };

  const getSeatClassName = (seat: Seat) => {
    if (allowTableBooking) {
      return "seat-indicator absolute w-2 h-2 rounded-full";
    }
    
    const isSelected = selectedSeats.includes(seat.id);
    const baseClasses = "seat absolute cursor-pointer border rounded-full text-xs flex items-center justify-center font-bold transition-all duration-200";
    
    switch (seat.status) {
      case 'Available':
        return `${baseClasses} ${isSelected 
          ? 'bg-green-500 border-green-700 text-white' 
          : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'}`;
      case 'Reserved':
        return `${baseClasses} bg-yellow-200 border-yellow-400 text-yellow-800 cursor-not-allowed`;
      case 'Booked':
        return `${baseClasses} bg-red-200 border-red-400 text-red-800 cursor-not-allowed`;
      case 'Unavailable':
        return `${baseClasses} bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading table layout...</span>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error || 'Failed to load layout'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxX = Math.max(...layout.tables.map(t => t.x + t.width));
  const maxY = Math.max(...layout.tables.map(t => t.y + t.height));

  return (
    <div className="table-layout">
      {/* Booking Mode Toggle */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          {allowTableBooking 
            ? "Table Booking Mode: Click on tables to select entire tables"
            : "Individual Seat Mode: Click on individual seats around tables"
          }
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        {allowTableBooking ? (
          <>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
              <span>Available Table</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 border-2 border-green-700 rounded mr-2"></div>
              <span>Selected Table</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded mr-2"></div>
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-200 border-2 border-red-400 rounded mr-2"></div>
              <span>Fully Booked</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded-full mr-2"></div>
              <span>Available Seat</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 border-2 border-green-700 rounded-full mr-2"></div>
              <span>Selected Seat</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded-full mr-2"></div>
              <span>Reserved Seat</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded-full mr-2"></div>
              <span>Booked Seat</span>
            </div>
          </>
        )}
      </div>

      {/* Table Map */}
      <div 
        className="relative border border-gray-300 rounded-lg bg-gray-50 mx-auto"
        style={{ 
          width: Math.max(800, maxX + 50), 
          height: Math.max(500, maxY + 50),
          minHeight: '500px'
        }}
      >
        {/* Stage */}
        {layout.stagePosition && (
          <div
            className="absolute bg-gray-800 text-white flex items-center justify-center font-bold rounded"
            style={{
              left: layout.stagePosition.x,
              top: layout.stagePosition.y,
              width: layout.stagePosition.width,
              height: layout.stagePosition.height
            }}
          >
            STAGE
          </div>
        )}

        {/* Tables */}
        {layout.tables.map((table) => (
          <div key={table.id}>
            {/* Table */}
            <div
              className={getTableClassName(table)}
              style={{
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height
              }}
              onClick={() => handleTableClick(table)}
              title={`Table ${table.tableNumber} - ${table.capacity} seats - ${table.tablePrice ? `$${table.tablePrice} (full table)` : `$${table.pricePerSeat}/seat`}`}
            >
              {table.tableNumber}
            </div>

            {/* Individual Seats (for non-table booking mode) */}
            {!allowTableBooking && table.seats.map((seat) => (
              <div
                key={seat.id}
                className={getSeatClassName(seat)}
                style={{
                  left: seat.x,
                  top: seat.y,
                  width: 20,
                  height: 20
                }}
                onClick={() => handleSeatClick(seat)}
                title={`${seat.seatNumber} - $${seat.price}`}
              >
                {seat.number}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tables Info */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Tables & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layout.tables.map((table) => (
            <div key={table.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Table {table.tableNumber}</h4>
                <span className="text-sm text-gray-600">{table.capacity} seats</span>
              </div>
              <div className="text-sm text-gray-600">
                {table.tablePrice ? (
                  <>
                    <p>Full table: ${table.tablePrice}</p>
                    <p>Per seat: ${table.pricePerSeat}</p>
                  </>
                ) : (
                  <p>Per seat: ${table.pricePerSeat}</p>
                )}
                {table.section && (
                  <p className="mt-1">
                    <span 
                      className="inline-block w-3 h-3 rounded mr-1"
                      style={{ backgroundColor: table.section.color }}
                    ></span>
                    {table.section.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
