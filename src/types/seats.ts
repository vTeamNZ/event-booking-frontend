export interface BaseSeat {
  id: number;
  row: string;
  number: number;
  seatNumber?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  price?: number;
  status?: 'Available' | 'Reserved' | 'Booked' | 'Unavailable';
  sectionId?: number;
  section?: {
    id: number;
    name: string;
    color: string;
    basePrice: number;
  };
}

export interface DisplaySeat extends BaseSeat {
  isReserved: boolean;
  tooltip: string;
  sectionColor?: string;
  ticketType?: any;
  ticketTypeColor?: string;
  color?: string;
  originalSeat: BaseSeat;
}

export interface SelectedSeat extends DisplaySeat {
  resolvedPrice?: number;
}
