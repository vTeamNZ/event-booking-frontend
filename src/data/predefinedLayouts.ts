import { SeatLayoutResponse, SeatSelectionMode } from '../types/seatSelection';
import { SeatStatus } from '../types/seatStatus';

// Sample predefined layouts that can be used for different venues
// These would be replaced with actual venue layouts in production

/**
 * Default small cinema layout
 * - 10 rows (A-J)
 * - 12 seats per row
 * - 2 sections (Standard and Premium)
 */
export const smallCinemaLayout: SeatLayoutResponse = {
  mode: SeatSelectionMode.EventHall,
  eventId: 0, // This will be replaced with actual event ID
  sections: [
    {
      id: 1,
      name: "Standard",
      basePrice: 15.00,
      color: "#888888"
    },
    {
      id: 2,
      name: "Premium",
      basePrice: 25.00,
      color: "#d4af37"
    }
  ],
  tables: [], // No tables for cinema layout
  seats: generateCinemaSeats(10, 12, [
    // Rows A-D are premium
    { rowStart: 0, rowEnd: 3, sectionId: 2, basePrice: 25.00 },
    // Rows E-J are standard
    { rowStart: 4, rowEnd: 9, sectionId: 1, basePrice: 15.00 }
  ])
};

/**
 * Default medium cinema layout
 * - 15 rows (A-O)
 * - 18 seats per row
 * - 3 sections (Standard, Premium, VIP)
 */
export const mediumCinemaLayout: SeatLayoutResponse = {
  mode: SeatSelectionMode.EventHall,
  eventId: 0, // This will be replaced with actual event ID
  sections: [
    {
      id: 1,
      name: "Standard",
      basePrice: 15.00,
      color: "#888888"
    },
    {
      id: 2,
      name: "Premium",
      basePrice: 25.00,
      color: "#d4af37"
    },
    {
      id: 3,
      name: "VIP",
      basePrice: 35.00,
      color: "#b76e79"
    }
  ],
  tables: [], // No tables for cinema layout
  seats: generateCinemaSeats(15, 18, [
    // Rows A-C are VIP
    { rowStart: 0, rowEnd: 2, sectionId: 3, basePrice: 35.00 },
    // Rows D-H are premium
    { rowStart: 3, rowEnd: 7, sectionId: 2, basePrice: 25.00 },
    // Rows I-O are standard
    { rowStart: 8, rowEnd: 14, sectionId: 1, basePrice: 15.00 }
  ])
};

/**
 * Default large cinema layout
 * - 20 rows (A-T)
 * - 24 seats per row
 * - 3 sections (Standard, Premium, VIP)
 */
export const largeCinemaLayout: SeatLayoutResponse = {
  mode: SeatSelectionMode.EventHall,
  eventId: 0, // This will be replaced with actual event ID
  sections: [
    {
      id: 1,
      name: "Standard",
      basePrice: 15.00,
      color: "#888888"
    },
    {
      id: 2,
      name: "Premium",
      basePrice: 25.00,
      color: "#d4af37"
    },
    {
      id: 3,
      name: "VIP",
      basePrice: 35.00,
      color: "#b76e79"
    }
  ],
  tables: [], // No tables for cinema layout
  seats: generateCinemaSeats(20, 24, [
    // Rows A-D are VIP
    { rowStart: 0, rowEnd: 3, sectionId: 3, basePrice: 35.00 },
    // Rows E-L are premium
    { rowStart: 4, rowEnd: 11, sectionId: 2, basePrice: 25.00 },
    // Rows M-T are standard
    { rowStart: 12, rowEnd: 19, sectionId: 1, basePrice: 15.00 }
  ])
};

/**
 * Map of predefined layouts by venue ID
 * In a real application, this would be loaded from a config file or API
 */
export const predefinedLayouts: Record<string, SeatLayoutResponse> = {
  'cinema-small': smallCinemaLayout,
  'cinema-medium': mediumCinemaLayout,
  'cinema-large': largeCinemaLayout
};

/**
 * Helper function to generate seat data for a cinema layout
 */
function generateCinemaSeats(
  rowCount: number, 
  seatsPerRow: number, 
  sections: { rowStart: number, rowEnd: number, sectionId: number, basePrice: number }[]
): any[] {
  const seats: any[] = [];
  let seatId = 1;
  
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, etc.
    const section = sections.find(s => rowIndex >= s.rowStart && rowIndex <= s.rowEnd);
    
    if (!section) continue; // Skip if no section mapping found
    
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      // Create a few random reserved seats for realism
      const isReserved = Math.random() < 0.1; // 10% of seats are reserved
      
      seats.push({
        id: seatId++,
        sectionId: section.sectionId,
        row: rowLabel,
        seatNumber: `${rowLabel}${seatNum}`,
        number: seatNum,
        status: isReserved ? SeatStatus.Reserved : SeatStatus.Available,
        price: section.basePrice
      });
    }
  }
  
  return seats;
}
