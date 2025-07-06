import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SeatPicker from 'react-seat-picker';
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
import { generateSessionId } from '../utils/seatSelection';

interface CinemaSeatLayoutProps {
  eventId: number;
  onSelectionComplete: (selectionState: SeatSelectionState) => void;
}

const CinemaSeatLayout: React.FC<CinemaSeatLayoutProps> = ({ eventId, onSelectionComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [layout, setLayout] = useState<SeatLayoutResponse | null>(null);
  const [rows, setRows] = useState<any[][]>([]); // Using any to handle nulls for aisles
  const [sections, setSections] = useState<Section[]>([]);
  
  // Generate seat colors based on sections
  const sectionColorMap = useMemo(() => {
    const colorMap: Record<number, string> = {};
    sections.forEach(section => {
      colorMap[section.id] = section.color;
    });
    return colorMap;
  }, [sections]);
  
  // Transform the seats data from the API format to the format required by react-seat-picker
  const transformSeatsToRows = useCallback((layoutData: SeatLayoutResponse) => {
    console.log('Starting transformation of seat data...');
    
    if (!layoutData || !layoutData.seats || layoutData.seats.length === 0) {
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
    
    // Create the row data format required by react-seat-picker
    const formattedRows = sortedRows.map((rowKey, rowIndex) => {
      console.log(`Processing row ${rowKey} (index ${rowIndex})...`);
      
      // Sort seats in this row by number
      const rowSeats = seatsByRow[rowKey].sort((a, b) => a.number - b.number);
      console.log(`Row ${rowKey} has ${rowSeats.length} seats`);
      
      // Simplified approach: just create an array with exactly what we need
      const rowArray: any[] = [];
      
      // Fill in the actual seats
      rowSeats.forEach(seat => {
        const section = layoutData.sections.find(s => s.id === seat.sectionId);
        const isReserved = seat.status !== SeatStatus.Available;
        const tooltipText = `${seat.seatNumber}: ${section?.name || 'Standard'} - $${seat.price.toFixed(2)}`;
        
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
      
      // Add aisle gaps (nulls) every 5 seats for better visualization
      // Insert nulls at indices 4, 9, 14, etc. (after every 5th seat)
      for (let i = 4; i < rowArray.length; i += 6) {
        rowArray.splice(i, 0, null);
      }
      
      console.log(`Row ${rowKey} formatted with ${rowArray.length} entries (including aisles)`);
      return rowArray;
    });
    
    console.log(`Successfully transformed data into ${formattedRows.length} rows`);
    console.log('First row sample:', formattedRows[0]);
    setRows(formattedRows);
  }, []);

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
        
        console.log(`Making API call to get seat layout for event ${eventId}`);
        const layoutData = await seatSelectionService.getEventSeatLayout(eventId);
        console.log('Seat layout API response:', layoutData);
        
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
        
        // Transform the data into the format required by react-seat-picker
        transformSeatsToRows(layoutData);
      } catch (err) {
        console.error('************* FAILED TO LOAD SEAT LAYOUT *************');
        console.error('Error loading seat layout:', err);
        setError('Failed to load seat layout. Please try again.');
        toast.error('Failed to load seat layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId, transformSeatsToRows]);

  const addSeatCallback = ({ row, number, id }: { row: number; number: string | number; id: number }, addCb: (row: number, number: string | number, id: number, tooltip?: string) => void) => {
    console.log(`Adding seat with id ${id}, row ${row}, number ${number}`);
    
    // Find the original seat object
    if (!layout) {
      console.error('Layout data not loaded');
      toast.error('Layout data not loaded');
      return;
    }
    
    const seatObj = layout.seats.find(s => s.id === id);
    if (!seatObj) {
      console.error(`Seat with id ${id} not found in layout`);
      toast.error('Seat not found');
      return;
    }
    
    // Add the seat with a new tooltip
    const section = layout.sections.find(s => s.id === seatObj.sectionId);
    const newTooltip = `${seatObj.seatNumber}: ${section?.name || 'Standard'} - $${seatObj.price.toFixed(2)} (Selected)`;
    
    console.log('Adding seat to selection:', seatObj);
    
    // Add the seat to the callback and our state
    addCb(row, number, id, newTooltip);
    setSelectedSeats(prev => [...prev, seatObj]);
    
    toast.success(`Selected seat ${seatObj.seatNumber}`);
  };

  const removeSeatCallback = ({ row, number, id }: { row: number; number: string | number; id: number }, removeCb: (row: number, number: string | number) => void) => {
    console.log(`Removing seat with id ${id}, row ${row}, number ${number}`);
    
    // Find the original seat object
    if (!layout) {
      console.error('Layout data not loaded');
      toast.error('Layout data not loaded');
      return;
    }
    
    const seatObj = layout.seats.find(s => s.id === id);
    if (!seatObj) {
      console.error(`Seat with id ${id} not found in layout`);
      toast.error('Seat not found');
      return;
    }
    
    console.log('Removing seat from selection:', seatObj);
    
    // Remove the seat via the callback and update our state
    removeCb(row, number);
    setSelectedSeats(prev => prev.filter(seat => seat.id !== id));
    
    toast.success(`Removed seat ${seatObj.seatNumber}`);
  };

  const handleComplete = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    
    // Calculate total price
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    
    // Convert our selectedSeats to the format expected by the parent component
    const selectionState: SeatSelectionState = {
      mode: SeatSelectionMode.EventHall,
      selectedSeats: selectedSeats.map(seat => ({
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
              <SeatPicker
                rows={rows}
                maxReservableSeats={10}
                alpha
                visible
                selectedByDefault
                loading={false}
                tooltipProps={{ multiline: true }}
                addSeatCallback={addSeatCallback}
                removeSeatCallback={removeSeatCallback}
                continuous={false}
              />
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

          {/* Selected Seats Summary */}
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Selected Seats ({selectedSeats.length})</h3>
            {selectedSeats.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {seat.seatNumber} - ${seat.price.toFixed(2)}
                    </div>
                  ))}
                </div>
                <div className="text-right font-bold">
                  Total: ${selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No seats selected</p>
            )}
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-8 px-8 py-3 rounded-lg font-medium text-white ${selectedSeats.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={handleComplete}
            disabled={selectedSeats.length === 0}
          >
            Continue to Food Selection
          </motion.button>
        </>
      )}
    </div>
  );
};

export default CinemaSeatLayout;
