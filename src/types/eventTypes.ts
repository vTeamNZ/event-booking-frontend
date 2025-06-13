export interface EventDetails {
  id: number;
  date: string;
  isActive?: boolean;
}

export interface SelectedTicket {
  type: string;
  quantity: number;
  price: number;
  unitPrice: number;
}
