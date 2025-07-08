// These values must match the backend SeatStatus enum
export enum SeatStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Booked = 'Booked'
}

// Type guard to check if a string is a valid SeatStatus
export function isSeatStatus(status: string): status is SeatStatus {
  return Object.values(SeatStatus).includes(status as SeatStatus);
}

// Helper to convert from backend numeric enum if needed
export function convertFromBackendStatus(status: number): SeatStatus {
  switch (status) {
    case 0:
      return SeatStatus.Available;
    case 1:
      return SeatStatus.Reserved;
    case 2:
      return SeatStatus.Booked;
    default:
      return SeatStatus.Available;
  }
}

// Helper to get CSS classes for each status
export function getSeatStatusClasses(status: SeatStatus): string {
  switch (status) {
    case SeatStatus.Available:
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:scale-105';
    case SeatStatus.Reserved:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed';
    case SeatStatus.Booked:
      return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
    default:
      return 'bg-gray-100 text-gray-500 border-gray-300';
  }
}
