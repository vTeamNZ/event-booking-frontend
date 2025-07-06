export enum SeatSelectionMode {
  EventHall = 1,
  TableSeating = 2,
  GeneralAdmission = 3
}

export enum SeatStatus {
  Available = 0,
  Reserved = 1,
  Booked = 2,
  Unavailable = 3
}

export interface Venue {
  id: number;
  name: string;
  width: number;
  height: number;
}

export interface Stage {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Section {
  id: number;
  name: string;
  color: string;
  basePrice: number;
}

export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  status: SeatStatus;
  sectionId?: number;
  tableId?: number;
  reservedUntil?: string;
}

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: string;
  pricePerSeat: number;
  tablePrice?: number;
  sectionId?: number;
  availableSeats: number;
  seats: Seat[];
}

export interface SeatLayoutResponse {
  eventId: number;
  mode: SeatSelectionMode;
  venue?: Venue;
  stage?: Stage;
  seats: Seat[];
  tables: Table[];
  sections: Section[];
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface PricingResponse {
  eventId: number;
  mode: SeatSelectionMode;
  sectionPricing: Record<string, number>;
  ticketTypes: TicketType[];
}

export interface ReserveSeatRequest {
  seatId: number;
  sessionId: string;
}

export interface ReserveTableRequest {
  tableId: number;
  sessionId: string;
  fullTable: boolean;
  seatIds: number[];
}

export interface SelectedSeat {
  seat: Seat;
  reservedUntil?: Date;
}

export interface SelectedTable {
  table: Table;
  selectedSeats: Seat[];
  isFullTable: boolean;
  reservedUntil?: Date;
}

export interface GeneralTicketSelection {
  ticketType: TicketType;
  quantity: number;
}

export interface SeatSelectionState {
  mode: SeatSelectionMode;
  selectedSeats: SelectedSeat[];
  selectedTables: SelectedTable[];
  generalTickets: GeneralTicketSelection[];
  totalPrice: number;
  sessionId: string;
}
