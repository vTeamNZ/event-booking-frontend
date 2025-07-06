declare module 'react-seat-picker' {
  interface SeatProps {
    id: number;
    number: number | string;
    isReserved?: boolean;
    isSelected?: boolean;
    tooltip?: string;
    orientation?: 'north' | 'south' | 'east' | 'west';
  }

  interface SeatPickerProps {
    rows: (SeatProps | null)[][];
    maxReservableSeats?: number;
    alpha?: boolean;
    visible?: boolean;
    selectedByDefault?: boolean;
    loading?: boolean;
    continuous?: boolean;
    addSeatCallback?: (
      { row, number, id }: { row: number; number: number | string; id: number }, 
      addCb: (row: number, number: number | string, id: number, tooltip?: string) => void
    ) => void;
    removeSeatCallback?: (
      { row, number, id }: { row: number; number: number | string; id: number }, 
      removeCb: (row: number, number: number | string) => void
    ) => void;
    tooltipProps?: any;
  }

  const SeatPicker: React.FC<SeatPickerProps>;
  export default SeatPicker;
}
