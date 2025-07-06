import { api } from './api';
import {
  SeatLayoutResponse,
  PricingResponse,
  ReserveSeatRequest,
  ReserveTableRequest,
  Seat,
  Table
} from '../types/seatSelection';

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
      
      // Random status (mostly available, some reserved/occupied)
      const randomStatus = Math.random() < 0.85 ? 1 : 2; // 85% available, 15% reserved/occupied

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
        status: randomStatus, // 1 = Available, 2 = Reserved/Occupied
        sectionId: sectionId
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
    
    // Add mock data fallback for testing/debugging
    const useMockData = true; // Set to false in production
    const useLargeLayout = false; // Set to true to use cinema layout with 330 seats
    
    if (useMockData) {
      console.log('USING MOCK DATA FOR DEBUGGING');
      
      if (useLargeLayout) {
        // Generate a cinema layout with approximately 330 seats (22 rows x 15 seats)
        console.log('Generating cinema seat layout with 330 seats');
        return generateLargeSeatingLayout(22, 15);
      }
      
      // Return mock data with 20 seats, 5 reserved in front row
      const seats = [];
      
      // Front row (A) - 10 seats, first 5 are reserved
      for (let i = 1; i <= 10; i++) {
        seats.push({
          id: i,
          seatNumber: `A${i}`,
          row: "A",
          number: i,
          x: 100 + (i - 1) * 40,
          y: 100,
          width: 30,
          height: 30,
          price: 80.00,
          status: i <= 5 ? 2 : 1, // First 5 are reserved (status 2), rest available (status 1)
          sectionId: 1
        });
      }
      
      // Back row (B) - 10 seats, all available
      for (let i = 1; i <= 10; i++) {
        seats.push({
          id: i + 10,
          seatNumber: `B${i}`,
          row: "B",
          number: i,
          x: 100 + (i - 1) * 40,
          y: 140,
          width: 30,
          height: 30,
          price: 60.00,
          status: 1, // Available
          sectionId: 2
        });
      }
      
      return {
        eventId: eventId,
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
          name: "Test Theater",
          width: 800,
          height: 600
        },
        stage: {
          x: 300,
          y: 50,
          width: 200,
          height: 40
        },
        tables: []
      };
    }
    
    try {
      console.log('API call parameters:', { eventId });
      
      // Check that API base URL is set
      if (!api.defaults.baseURL) {
        console.error('API base URL is not set!');
      }
      
      const response = await api.get<SeatLayoutResponse>(`/api/seats/event/${eventId}/layout`);
      console.log('Seat layout API response status:', response.status);
      console.log('Seat layout API response data:', response.data);
      
      // Validate the response structure
      if (!response.data) {
        console.error('Empty response data received');
      } else {
        console.log('Response mode:', response.data.mode);
        console.log('Response event ID:', response.data.eventId);
        console.log('Response seats count:', response.data.seats?.length || 0);
      }
      
      return response.data;
    } catch (error) {
      console.error('************* ERROR IN SEAT SELECTION SERVICE *************');
      console.error('Error in getEventSeatLayout:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data: any, status: number, headers?: any } };
        console.error('API Error Details:', {
          response: axiosError.response?.data,
          status: axiosError.response?.status,
          headers: axiosError.response?.headers,
        });
      } else {
        console.error('Unknown error type:', typeof error);
      }
      
      throw error;
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
  async getSeats(): Promise<Seat[]> {
    const response = await api.get<Seat[]>('/api/seats');
    return response.data;
  },

  // Get all tables for an event (if needed)
  async getTables(): Promise<Table[]> {
    const response = await api.get<Table[]>('/api/tables');
    return response.data;
  }
};
