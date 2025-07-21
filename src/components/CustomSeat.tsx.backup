import React from 'react';

interface CustomSeatProps {
  seat: any; // The seat object from react-seat-picker
  selectedSeats: number[];
  selectSeat: (seatId: number) => void;
  unselectSeat: (seatId: number) => void;
}

const CustomSeat: React.FC<CustomSeatProps> = ({ 
  seat, 
  selectedSeats = [], 
  selectSeat = () => {}, 
  unselectSeat = () => {} 
}) => {
  if (!seat || seat.isReserved) {
    // Reserved seat
    return (
      <div 
        className="w-6 h-6 rounded-sm bg-gray-400 m-1 cursor-not-allowed"
        title={seat ? seat.tooltip : 'Reserved'}
      />
    );
  }
  
  const isSelected = selectedSeats.includes(seat.id);
  
  return (
    <div
      className={`w-6 h-6 rounded-sm m-1 cursor-pointer transition-colors duration-200 
        ${isSelected ? 'bg-blue-500' : 'bg-white border-2 border-gray-400'}`}
      title={seat.tooltip}
      onClick={() => {
        if (isSelected) {
          unselectSeat(seat.id);
        } else {
          selectSeat(seat.id);
        }
      }}
    />
  );
};

export default CustomSeat;
