import { SeatingTicketType } from './index';
import { SeatStatus } from '../seatStatus';

export interface ReservedSeatDTO {
  seatId: number;
  row: string;
  number: number;
  seatNumber: string;
  price: number;
  ticketType?: SeatingTicketType;
  reservedUntil?: string;
  status: SeatStatus;
}
