import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import OptimizedSeatMap from './OptimizedSeatMap';
import AisleRenderer from './venue/AisleRenderer';
import { layoutCacheService } from '../services/layoutCacheService';
import { seatSelectionService } from '../services/seatSelectionService';
import { TicketTypeDisplay } from '../types/ticketTypes';
import { Section, SeatSelectionState, SeatSelectionMode } from '../types/seatSelection';

// Utility function to generate a consistent color from a string
const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a distinct, visually pleasing color
  // We'll use predefined colors for better visual appeal
  const colors = [
    '#4299E1', // blue
    '#48BB78', // green
    '#ED8936', // orange
    '#9F7AEA', // purple
    '#F56565', // red
    '#38B2AC', // teal
    '#D69E2E', // yellow
    '#805AD5', // purple
    '#DD6B20', // orange
    '#3182CE', // blue
  ];
  
  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface Props {
  eventId: number;
  onSelectionComplete: (selectionState: SeatSelectionState) => void;
}

const CinemaSeatLayout: React.FC<Props> = ({ eventId, onSelectionComplete }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<any>(null);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        console.log('=== CINEMA SEAT LAYOUT DEBUG START ===');
        console.log('Loading seat layout for event:', eventId);
        setLoading(true);
        
        // Try to get layout from cache first
        let layoutData = layoutCacheService.getLayout(eventId);
        
        if (!layoutData) {
          console.log('No cached layout found, fetching from API');
          console.log('API base URL:', (window as any).API_BASE_URL || 'not set');
          layoutData = await seatSelectionService.getEventSeatLayout(eventId);
          console.log('=== RECEIVED LAYOUT DATA ===');
          console.log('Full layout data:', JSON.stringify(layoutData, null, 2));
          
          // Cache the layout for future use
          if (layoutData) {
            layoutCacheService.saveLayout(eventId, layoutData);
          }
        } else {
          console.log('Using cached layout data');
        }
        
        if (!layoutData) {
          console.error('Layout data is empty');
          setError('No seat layout data received. Please try again.');
          return;
        }
        
        console.log('=== PROCESSING LAYOUT DATA ===');
        console.log('Layout seats count:', layoutData.seats?.length || 0);
        console.log('First few seats:', layoutData.seats?.slice(0, 3));
        
        setLayout(layoutData);
        setSections(layoutData.sections || []);
        
        // Transform seats into rows
        const formattedRows = [];
        const seatsByRow = new Map();
        
        // Group seats by row
        layoutData.seats.forEach((seat: any) => {
          if (!seatsByRow.has(seat.row)) {
            seatsByRow.set(seat.row, []);
          }
          seatsByRow.get(seat.row).push(seat);
        });
        
        // Sort rows and seats within each row
        const sortedRows = Array.from(seatsByRow.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        // Get ticket types first so we can map them to seats
        try {
          console.log('=== FETCHING TICKET TYPES ===');
          console.log('Fetching ticket types for event:', eventId);
          const ticketTypesData = await seatSelectionService.getEventTicketTypes(eventId);
          console.log('=== RECEIVED TICKET TYPES ===');
          console.log('Full ticket types data:', JSON.stringify(ticketTypesData, null, 2));
          console.log('Ticket types count:', ticketTypesData?.length || 0);
          
          // Parse seat row assignments from each ticket type
          const ticketTypesWithAssignments = ticketTypesData.map(ticket => {
            console.log('=== PROCESSING TICKET TYPE ===');
            console.log('Ticket type ID:', ticket.id);
            console.log('Ticket type name:', ticket.type);
            console.log('Ticket type price:', ticket.price);
            console.log('Raw seat row assignments:', ticket.seatRowAssignments);

            let seatRowAssignments = [];
            if (ticket.seatRowAssignments) {
              try {
                seatRowAssignments = JSON.parse(ticket.seatRowAssignments);
                console.log('Parsed row assignments:', seatRowAssignments);
              } catch (e) {
                console.error('Failed to parse seat row assignments:', e);
              }
            } else {
              console.log('No row assignments for this ticket type');
            }

            const result = {
              ...ticket,
              parsedAssignments: seatRowAssignments
            };
            console.log('Final processed ticket type:', result);
            return result;
          });
          
          // Transform TicketType to TicketTypeDisplay
          setTicketTypes(ticketTypesData.map(ticket => ({
            id: ticket.id,
            name: ticket.type,    // Map the 'type' field to 'name' for display
            price: ticket.price,
            description: ticket.description,
            eventId: ticket.eventId
          })));
          
          console.log('=== PROCESSING SEATS WITH TICKET TYPES ===');
          for (const [row, seats] of sortedRows) {
            const sortedSeats = seats.sort((a: any, b: any) => a.number - b.number);
            const rowArray = sortedSeats.map((seat: any) => {
              const section = layoutData?.sections?.find((s: any) => s.id === seat.sectionId);
              const isReserved = seat.status === 'Reserved' || seat.status === 'Booked';
              
              // Find if this seat is assigned to a specific ticket type based on its row
              const assignedTicketType = ticketTypesWithAssignments.find(tt => {
                if (!tt.parsedAssignments || !Array.isArray(tt.parsedAssignments)) {
                  return false;
                }

                return tt.parsedAssignments.some((assignment: any) => {
                  if (!assignment.rowStart || !assignment.rowEnd) {
                    return false;
                  }

                  const rowStart = assignment.rowStart.toUpperCase();
                  const rowEnd = assignment.rowEnd.toUpperCase();
                  const currentRow = seat.row.toUpperCase();
                  
                  // Compare the row letters using localeCompare for proper string comparison
                  const isInRange = 
                    currentRow.localeCompare(rowStart) >= 0 && 
                    currentRow.localeCompare(rowEnd) <= 0;
                  
                  return isInRange;
                });
              });
              
              // Generate a color for the ticket type
              const ticketTypeColor = assignedTicketType ? getColorFromString(assignedTicketType.type) : undefined;
              
              console.log(`Seat ${seat.row}-${seat.number}:`, {
                assignedTicketType: assignedTicketType?.type || 'none',
                ticketTypeColor,
                sectionColor: section?.color,
                seatPrice: seat.price
              });
              
              // Use ticket type information for the tooltip if available
              const sectionText = section ? `${section.name} Section` : '';
              const ticketTypeText = assignedTicketType ? `${assignedTicketType.type} ($${assignedTicketType.price.toFixed(2)})` : '';
              
              // If we have a ticket type, use its price; otherwise, use the seat price
              const displayPrice = assignedTicketType ? assignedTicketType.price : seat.price;
              
              const tooltipText = [
                `Row ${seat.row} Seat ${seat.number}`,
                ticketTypeText || sectionText, // Prioritize ticket type over section
                isReserved ? 'Reserved' : 'Available',
                `Price: $${displayPrice.toFixed(2)}`
              ].filter(Boolean).join('\n');
              
              // Use ticket type color if available, otherwise fall back to section color
              const seatColor = ticketTypeColor || section?.color || '#ffffff';
              
              const finalSeat = {
                id: seat.id,
                row: seat.row,
                number: seat.number,
                isReserved,
                tooltip: tooltipText,
                sectionColor: section?.color,
                ticketType: assignedTicketType,
                ticketTypeColor: ticketTypeColor,
                color: seatColor,
                originalSeat: seat
              };
              
              console.log(`Final seat object for ${seat.row}-${seat.number}:`, finalSeat);
              return finalSeat;
            });
            
            formattedRows.push(rowArray);
          }
        } catch (ticketError) {
          console.error('=== ERROR FETCHING TICKET TYPES ===');
          console.error('Failed to fetch ticket types:', ticketError);
          toast.error('Failed to load ticket information');
          
          // Fallback to just using section colors if ticket types can't be loaded
          for (const [row, seats] of sortedRows) {
            const sortedSeats = seats.sort((a: any, b: any) => a.number - b.number);
            const rowArray = sortedSeats.map((seat: any) => {
              const section = layoutData?.sections?.find((s: any) => s.id === seat.sectionId);
              const isReserved = seat.status === 'Reserved' || seat.status === 'Booked';
              
              const sectionText = section ? `${section.name} Section` : '';
              const tooltipText = [
                `Row ${seat.row} Seat ${seat.number}`,
                sectionText,
                isReserved ? 'Reserved' : 'Available',
                `Price: $${seat.price.toFixed(2)}`
              ].filter(Boolean).join('\n');
              
              return {
                id: seat.id,
                row: seat.row,
                number: seat.number,
                isReserved,
                tooltip: tooltipText,
                sectionColor: section?.color,
                originalSeat: seat
              };
            });
            
            formattedRows.push(rowArray);
          }
        }
        
        console.log('=== LAYOUT PROCESSING COMPLETE ===');
        console.log(`Successfully transformed data into ${formattedRows.length} rows`);
        console.log('Sample seat from first row:', formattedRows[0]?.[0]);
        setRows(formattedRows);
        
        // Also fetch ticket types
        try {
          console.log('Fetching ticket types for event:', eventId);
          const ticketTypesData = await seatSelectionService.getEventTicketTypes(eventId);
          console.log('Retrieved ticket types:', ticketTypesData);
          // Transform TicketType to TicketTypeDisplay
          setTicketTypes(ticketTypesData.map(ticket => ({
            id: ticket.id,
            name: ticket.type,    // Map the 'type' field to 'name' for display
            price: ticket.price,
            description: ticket.description,
            eventId: ticket.eventId
          })));
        } catch (ticketError) {
          console.error('Failed to fetch ticket types:', ticketError);
          toast.error('Failed to load ticket information');
        }
      } catch (err) {
        console.error('Error loading seat layout:', err);
        setError('Failed to load seat layout. Please try again.');
        toast.error('Failed to load seat layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  const handleSeatSelection = useCallback((seats: any[]) => {
    if (!seats) {
      setSelectedSeats([]);
      return;
    }
    
    setSelectedSeats(seats);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stage Area */}
      <div className="text-center">
        <div className="bg-gray-800 text-white py-2 rounded-t-lg">
          STAGE
        </div>
        <div className="w-3/4 h-2 bg-gradient-to-b from-gray-300 to-transparent mx-auto" />
      </div>
      
      {/* Ticket Type Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {ticketTypes.map((ticketType) => (
          <div key={ticketType.id} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded" 
              style={{ backgroundColor: getColorFromString(ticketType.name) }}
            />
            <span>{ticketType.name} (${ticketType.price.toFixed(2)})</span>
          </div>
        ))}
        
        {/* Only show section legend if there are sections but no ticket types */}
        {ticketTypes.length === 0 && sections.map((section) => (
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
          <div className="relative seat-picker-container" style={{ maxWidth: '100%', overflowX: 'auto' }}>
            {/* Aisles Overlay */}
            {layout && (
              <AisleRenderer
                layoutData={layout}
                containerWidth={rows[0]?.length * 40 || 800}
                containerHeight={rows.length * 40 || 600}
                rowSpacing={40}
                seatSpacing={40}
              />
            )}
            
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
    </div>
  );
};

export default CinemaSeatLayout;
