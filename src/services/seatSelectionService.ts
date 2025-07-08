import { api } from './api';
import {
  SeatLayoutResponse,
  PricingResponse,
  ReserveSeatRequest,
  ReserveTableRequest,
  Seat,
  Table
} from '../types/seatSelection';
import { TicketType } from '../types/ticketTypes';
import { SeatStatus, convertFromBackendStatus } from '../types/seatStatus';

export type { TicketType } from '../types/ticketTypes';

// Helper function to generate a large number of seats for testing
const generateLargeSeatingLayout = (rows: number, seatsPerRow: number): SeatLayoutResponse => {
  const seats: Seat[] = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // For very large layouts, we'll use double letters after Z (AA, AB, etc.)
  const getRowLabel = (rowIndex: number) => {
    if (rowIndex < 26) return rowLetters[rowIndex];
    const firstChar = rowLetters[Math.floor(rowIndex / 26) - 1];
    const secondChar = rowLetters[rowIndex % 26];
    return `${firstChar}${secondChar}`;
  };
  
  // Calculate a reasonable layout size for a cinema with 330 seats
  const spacing = 36; // Space between seats (slightly reduced for better fit)
  const seatSize = 28; // Width/height of seats (slightly reduced for better fit)
  const startX = 120;
  const startY = 180; // More space for the screen at the top
  
  let id = 1;
  for (let r = 0; r < rows; r++) {
    const rowLabel = getRowLabel(r);
    
    for (let s = 0; s < seatsPerRow; s++) {
      // Determine section based on row (first third VIP, rest standard)
      const sectionId = r < Math.floor(rows / 3) ? 1 : 2;
      const sectionInfo = sectionId === 1 
        ? { id: 1, name: "VIP", color: "#FF0000" }
        : { id: 2, name: "Standard", color: "#0000FF" };
      const price = sectionId === 1 ? 80.00 : 60.00;
      
      // Add small variations to create a more natural looking theater layout
      // Center rows have more seats (slight curve)
      const rowWidth = seatsPerRow * spacing;
      const rowCenter = rowWidth / 2;
      const position = s * spacing;
      const offset = Math.abs(position - rowCenter) / 20;
      
      // Add empty seats for aisles - reduced aisles to get closer to 330 seats
      if ((s === Math.floor(seatsPerRow / 2)) && r > 3) {
        continue; // Skip this seat position to create a center aisle
      }
      
      // Random status (mostly available, some reserved/booked)
      const randomStatus = Math.random() < 0.85 ? SeatStatus.Available : SeatStatus.Reserved;

      seats.push({
        id: id++,
        seatNumber: `${rowLabel}${s + 1}`,
        row: rowLabel,
        number: s + 1,
        x: startX + (s * spacing),
        y: startY + (r * spacing) - offset,
        width: seatSize,
        height: seatSize,
        price: price,
        status: randomStatus,
        sectionId: sectionId,
        section: sectionInfo
      });
    }
  }
  
  return {
    eventId: 1,
    mode: 1, // EventHall mode
    seats: seats,
    sections: [
      {
        id: 1,
        name: "VIP",
        color: "#FF0000",
        basePrice: 80.00
      },
      {
        id: 2,
        name: "Standard",
        color: "#0000FF",
        basePrice: 60.00
      }
    ],
    venue: {
      id: 1,
      name: "KiwiLanka Cinema",
      width: Math.max(1000, startX + seatsPerRow * spacing + 120),
      height: Math.max(850, startY + rows * spacing + 100)
    },
    stage: {
      x: (startX + seatsPerRow * spacing / 2) - 250,
      y: 50,
      width: 500, // Wider screen for cinema experience
      height: 60  // Taller screen for cinema experience
    },
    tables: []
  };
};

export const seatSelectionService = {
  // Get seat layout for an event
  async getEventSeatLayout(eventId: number): Promise<SeatLayoutResponse> {
    console.log(`************* SEAT SELECTION SERVICE API CALL *************`);
    console.log(`Making API call to: ${api.defaults.baseURL}/api/seats/event/${eventId}/layout`);
    
    try {
      console.log('API call parameters:', { eventId });
      
      // Check that API base URL is set
      if (!api.defaults.baseURL) {
        console.error('API base URL is not set!');
        throw new Error('API base URL not configured');
      }
      
      const response = await api.get<SeatLayoutResponse>(`/api/seats/event/${eventId}/layout`);
      console.log('Seat layout API response status:', response.status);
      console.log('Seat layout API response data:', response.data);
      
      // Validate the response structure
      if (!response.data) {
        console.error('Empty response data received');
        throw new Error('Empty response from API');
      } else {
        console.log('Response mode:', response.data.mode);
        console.log('Response event ID:', response.data.eventId);
        console.log('Response seats count:', response.data.seats?.length || 0);
        return response.data;
      }
    } catch (error) {
      console.error('************* ERROR IN SEAT SELECTION SERVICE - FALLING BACK TO MOCK DATA *************');
      console.error('Error in getEventSeatLayout:', error);
      
      // Fallback to mock data when API is not available
      console.log('USING MOCK DATA AS FALLBACK');
      
      // Generate a cinema layout with approximately 330 seats (22 rows x 15 seats)
      console.log('Generating cinema seat layout with 330 seats');
      return generateLargeSeatingLayout(22, 15);
    }
  },

  // Get pricing information for an event
  async getEventPricing(eventId: number): Promise<PricingResponse> {
    const response = await api.get<PricingResponse>(`/api/seats/pricing/${eventId}`);
    return response.data;
  },

  // Reserve a single seat
  async reserveSeat(request: ReserveSeatRequest): Promise<{
    message: string;
    reservedUntil: string;
    seatNumber: string;
    price: number;
  }> {
    const response = await api.post<{
      message: string;
      reservedUntil: string;
      seatNumber: string;
      price: number;
    }>('/api/seats/reserve', request);
    return response.data;
  },

  // Reserve table or specific seats at a table
  async reserveTable(request: ReserveTableRequest): Promise<{
    message: string;
    reservedSeats: number;
    totalPrice: number;
    reservedUntil: string;
  }> {
    const response = await api.post<{
      message: string;
      reservedSeats: number;
      totalPrice: number;
      reservedUntil: string;
    }>('/api/seats/reserve-table', request);
    return response.data;
  },

  // Release a reserved seat
  async releaseSeat(seatId: number, sessionId: string): Promise<{
    message: string;
  }> {
    const response = await api.post<{ message: string }>('/api/seats/release', {
      seatId,
      sessionId
    });
    return response.data;
  },

  // Get all seats for an event (fallback)
  async getSeats(eventId: number): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/api/seats/event/${eventId}`);
    return response.data;
  },

  // Get all tables for an event (if needed)
  async getTables(): Promise<Table[]> {
    const response = await api.get<Table[]>('/api/tables');
    return response.data;
  },
  
  // Get ticket types for an event
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      console.log('Fetching ticket types for event:', eventId);
      const response = await api.get<TicketType[]>(`/api/TicketTypes/event/${eventId}`);
      console.log('Received ticket types:', response.data);
      
      // Process ticket types to parse row assignments if available
      return response.data.map(ticket => {
        // Add parsedAssignments field for easier consumption by components
        return ticket;
      });
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      throw error; // Let the component handle the error instead of using fallback data
    }
  },
};
