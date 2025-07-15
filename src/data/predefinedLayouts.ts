import { SeatLayoutResponse, SeatSelectionMode } from '../types/seatSelection';
import { SeatStatus } from '../types/seatStatus';

// This file previously contained predefined mock layouts
// Now we're using real data from the API instead

// Export an empty object to avoid breaking any imports
export const predefinedLayouts = {};

/**
 * Default medium cinema layout
 * - 15 rows (A-O)
 * - 18 seats per row
 * - 3 ticket types (Standard, Premium, VIP)
 */
export const mediumCinemaLayout: SeatLayoutResponse = {
  mode: SeatSelectionMode.EventHall,
  eventId: 0, // This will be replaced with actual event ID
  ticketTypes: [
    {
      id: 1,
      type: "Standard",
      name: "Standard",
      price: 15.00,
      color: "#888888",
      description: "Standard seating",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'I', rowEnd: 'O' }
      ])
    },
    {
      id: 2,
      type: "Premium",
      name: "Premium",
      price: 25.00,
      color: "#d4af37",
      description: "Better view and more comfortable seats",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'D', rowEnd: 'H' }
      ])
    },
    {
      id: 3,
      type: "VIP",
      name: "VIP",
      price: 35.00,
      color: "#b76e79",
      description: "Best seats with extra legroom",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'A', rowEnd: 'C' }
      ])
    }
  ],
  seats: generateCinemaSeats(15, 18, [
    // Rows A-C are VIP
    { rowStart: 0, rowEnd: 2, ticketTypeId: 3, basePrice: 35.00 },
    // Rows D-H are premium
    { rowStart: 3, rowEnd: 7, ticketTypeId: 2, basePrice: 25.00 },
    // Rows I-O are standard
    { rowStart: 8, rowEnd: 14, ticketTypeId: 1, basePrice: 15.00 }
  ])
};

/**
 * Default large cinema layout
 * - 20 rows (A-T)
 * - 24 seats per row
 * - 3 ticket types (Standard, Premium, VIP)
 */
export const largeCinemaLayout: SeatLayoutResponse = {
  mode: SeatSelectionMode.EventHall,
  eventId: 0, // This will be replaced with actual event ID
  ticketTypes: [
    {
      id: 1,
      type: "Standard",
      name: "Standard",
      price: 15.00,
      color: "#888888",
      description: "Standard seating",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'M', rowEnd: 'T' }
      ])
    },
    {
      id: 2,
      type: "Premium",
      name: "Premium",
      price: 25.00,
      color: "#d4af37",
      description: "Better view and more comfortable seats",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'E', rowEnd: 'L' }
      ])
    },
    {
      id: 3,
      type: "VIP",
      name: "VIP",
      price: 35.00,
      color: "#b76e79",
      description: "Best seats with extra legroom",
      eventId: 0,
      seatRowAssignments: JSON.stringify([
        { rowStart: 'A', rowEnd: 'D' }
      ])
    }
  ],
  seats: generateCinemaSeats(20, 24, [
    // Rows A-D are VIP
    { rowStart: 0, rowEnd: 3, ticketTypeId: 3, basePrice: 35.00 },
    // Rows E-L are premium
    { rowStart: 4, rowEnd: 11, ticketTypeId: 2, basePrice: 25.00 },
    // Rows M-T are standard
    { rowStart: 12, rowEnd: 19, ticketTypeId: 1, basePrice: 15.00 }
  ])
};

/**
 * Helper function to generate seat data for a cinema layout
 */
function generateCinemaSeats(
  rowCount: number, 
  seatsPerRow: number, 
  ticketTypeAssignments: { rowStart: number, rowEnd: number, ticketTypeId: number, basePrice: number }[]
): any[] {
  const seats: any[] = [];
  let seatId = 1;
  
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, etc.
    const assignment = ticketTypeAssignments.find(s => rowIndex >= s.rowStart && rowIndex <= s.rowEnd);
    
    if (!assignment) continue; // Skip if no ticket type mapping found
    
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      // Create a few random reserved seats for realism
      const isReserved = Math.random() < 0.1; // 10% of seats are reserved
      
      seats.push({
        id: seatId++,
        ticketTypeId: assignment.ticketTypeId,
        row: rowLabel,
        seatNumber: `${rowLabel}${seatNum}`,
        number: seatNum,
        status: isReserved ? SeatStatus.Reserved : SeatStatus.Available,
        price: assignment.basePrice
      });
    }
  }
  
  return seats;
}
