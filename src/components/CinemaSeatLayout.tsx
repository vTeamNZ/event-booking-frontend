import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  SeatSelectionMode, 
  SeatSelectionState, 
  SeatStatus,
  SeatLayoutResponse,
  Seat as SeatType,
  Section
} from '../types/seatSelection';
import { seatSelectionService } from '../services/seatSelectionService';
import { layoutCacheService } from '../services/layoutCacheService';
import { predefinedLayouts } from '../data/predefinedLayouts';
import { generateSessionId } from '../utils/seatSelection';
import OptimizedSeatMap from './OptimizedSeatMap';

interface CinemaSeatLayoutProps {
  eventId: number;
  onSelectionComplete: (selectionState: SeatSelectionState) => void;
}

const CinemaSeatLayout: React.FC<CinemaSeatLayoutProps> = ({ eventId, onSelectionComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [layout, setLayout] = useState<SeatLayoutResponse | null>(null);
  const [rows, setRows] = useState<any[][]>([]); // Using any to handle nulls for aisles
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  // Load layout data
  useEffect(() => {
    const loadLayout = async () => {
      try {
        console.log(`************* LOADING SEAT LAYOUT FOR CINEMA VIEW *************`);
        console.log(`Loading seat layout for event ID: ${eventId}`);
        setLoading(true);
        
        // Check if eventId is valid
        if (!eventId) {
          console.error('Invalid eventId:', eventId);
          setError('Invalid event ID. Please try again.');
          return;
        }

        // Try to get layout from cache first
        let layoutData = layoutCacheService.getLayout(eventId);
        
        if (layoutData) {
          console.log(`Retrieved layout for event ${eventId} from cache`);
        } else {
          // Fallback to using a predefined layout if available based on venue
          // In a real app, you'd map the event's venueId to a predefined layout
          // For now, we'll use a simple mapping based on eventId ranges
          const venueType = eventId % 3 === 0 ? 'cinema-large' : 
                            eventId % 2 === 0 ? 'cinema-medium' : 
                            'cinema-small';
          
          const predefinedLayout = predefinedLayouts[venueType];
          if (predefinedLayout) {
            console.log(`Using predefined layout for venue type: ${venueType}`);
            // Clone the layout and set the event ID
            layoutData = {
              ...predefinedLayout,
              eventId
            };
          } else {
            // If no predefined layout, fetch from API
            console.log(`Making API call to get seat layout for event ${eventId}`);
            layoutData = await seatSelectionService.getEventSeatLayout(eventId);
            console.log('Seat layout API response:', layoutData);
            
            // Cache the layout for future use
            if (layoutData) {
              layoutCacheService.saveLayout(eventId, layoutData);
            }
          }
        }
        
        if (!layoutData) {
          console.error('Layout data is empty');
          setError('No seat layout data received. Please try again.');
          return;
        }
        
        console.log(`Layout mode: ${layoutData.mode}`);
        console.log(`Seats count: ${layoutData.seats?.length || 0}`);
        console.log(`Sections count: ${layoutData.sections?.length || 0}`);
        
        setLayout(layoutData);
        setSections(layoutData.sections || []);
        
        // Transform the data for our optimized seat map
        console.log('Starting transformation of seat data...');
    
        if (!layoutData.seats || layoutData.seats.length === 0) {
          console.error('No seats data to transform');
          return;
        }
        
        console.log(`Transforming ${layoutData.seats.length} seats`);
        
        // Group seats by row
        const seatsByRow: Record<string, SeatType[]> = {};
        layoutData.seats.forEach(seat => {
          if (!seatsByRow[seat.row]) {
            seatsByRow[seat.row] = [];
          }
          seatsByRow[seat.row].push(seat);
        });
        
        console.log('Grouped seats by row:', Object.keys(seatsByRow).length, 'unique rows');
        
        // Sort rows alphabetically
        const sortedRows = Object.keys(seatsByRow).sort();
        console.log('Sorted rows:', sortedRows);
        
        // Create the row data format for our optimized seat map
        const formattedRows = sortedRows.map((rowKey) => {
          // Sort seats in this row by number
          const rowSeats = seatsByRow[rowKey].sort((a, b) => a.number - b.number);
          
          // Simplified approach: just create an array with exactly what we need
          const rowArray: any[] = [];
          
          // Fill in the actual seats
          rowSeats.forEach(seat => {
            // Ensure layoutData is not null before accessing its properties
            const section = layoutData?.sections?.find(s => s.id === seat.sectionId);
            const isReserved = seat.status === SeatStatus.Reserved; // Only status 2 (Reserved/Occupied) is reserved
            const statusText = isReserved ? 'Reserved' : 'Available';
            const tooltipText = `${seat.seatNumber}\n${section?.name || 'Standard'} - $${seat.price.toFixed(2)}\nStatus: ${statusText}`;
            
            const seatObj = {
              id: seat.id,
              number: seat.number,
              isReserved,
              tooltip: tooltipText,
              originalSeat: seat
            };
            
            // Add to the row array
            rowArray.push(seatObj);
          });
          
          return rowArray;
        });
        
        console.log(`Successfully transformed data into ${formattedRows.length} rows`);
        setRows(formattedRows);
      } catch (err) {
        console.error('************* FAILED TO LOAD SEAT LAYOUT *************');
        console.error('Error loading seat layout:', err);
        setError('Failed to load seat layout. Please try again.');
        toast.error('Failed to load seat layout', {
          position: 'top-right',
          style: {
            background: '#363636',
            color: '#fff',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  const handleSeatSelection = (seats: any[]) => {
    if (!seats) {
      setSelectedSeats([]);
      return;
    }
    
    setSelectedSeats(seats);
    
    if (seats.length > 0) {
      // Safely access originalSeat properties with optional chaining
      const seatsInfo = seats
        .map(seat => seat?.originalSeat?.seatNumber || 'Unknown')
        .join(', ');
      
      const totalPrice = seats.reduce((sum, seat) => 
        sum + (seat?.originalSeat?.price || 0), 0);
      
      toast.success(`Selected seats: ${seatsInfo} - $${totalPrice.toFixed(2)}`, {
        position: 'top-right',
        style: {
          background: '#363636',
          color: '#fff',
        },
      });
    }
  };

  const handleComplete = () => {
    if (!layout) {
      toast.error('Layout data not available', {
        position: 'top-right',
        style: {
          background: '#363636',
          color: '#fff',
        },
      });
      return;
    }
    
    if (selectedSeats.length === 0) {
      toast.error('No seats selected', {
        position: 'top-right',
        style: {
          background: '#363636',
          color: '#fff',
        },
      });
      return;
    }
    
    // Extract the original seat data from the selected seats
    const selectedSeatData: SeatType[] = selectedSeats.map(seat => seat.originalSeat);
    const totalPrice = selectedSeatData.reduce((sum, seat) => sum + seat.price, 0);
    
    // Convert to the format expected by the parent component
    const selectionState: SeatSelectionState = {
      mode: SeatSelectionMode.EventHall,
      selectedSeats: selectedSeatData.map(seat => ({
        seat: {
          ...seat,
          status: SeatStatus.Reserved
        }
      })),
      selectedTables: [], 
      generalTickets: [],
      totalPrice: totalPrice,
      sessionId: sessionId
    };
    
    console.log('Selection complete:', selectionState);
    toast.success(`Selected ${selectedSeatData.length} seat(s) for $${totalPrice.toFixed(2)}`, {
      position: 'top-right',
      style: {
        background: '#363636',
        color: '#fff',
      },
    });
    onSelectionComplete(selectionState);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Cinema Screen */}
          <div className="relative w-full mb-10">
            <div className="w-3/4 h-10 bg-gray-300 mx-auto rounded-t-3xl shadow-lg flex items-center justify-center">
              <p className="text-gray-600 text-sm font-medium">SCREEN</p>
            </div>
            <div className="w-3/4 h-2 bg-gradient-to-b from-gray-300 to-transparent mx-auto" />
          </div>
          
          {/* Section Legend */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded" 
                  style={{ backgroundColor: section.color || '#888888' }}
                />
                <span>{section.name} (${section.basePrice.toFixed(2)})</span>
              </div>
            ))}
          </div>
          
          {/* Seat Map */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-full overflow-auto">
            {rows.length > 0 ? (
              <div className="seat-picker-container" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <OptimizedSeatMap
                  rows={rows}
                  maxSeats={10}
                  onSeatSelected={handleSeatSelection}
                />
              </div>
            ) : (
              <p className="text-gray-500">No seat data available</p>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-gray-400 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded" />
              <span>Reserved</span>
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 px-8 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={handleComplete}
          >
            Continue to Food Selection
          </motion.button>
        </>
      )}
    </div>
  );
};

export default CinemaSeatLayout;
