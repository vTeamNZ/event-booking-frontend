import { useState, useCallback } from 'react';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';

interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  number: number;
  price: number;
  ticketTypeId: number;
  ticketTypeName: string;
  ticketTypeColor: string;
  status: 'Available' | 'Reserved' | 'Booked';
}

interface UseIndustryStandardSeatSelectionProps {
  eventId: number;
  sessionId: string;
  userId?: string;
}

interface ReservationData {
  reservationId: string;
  expiresAt: string;
  totalPrice: number;
  seatsCount: number;
  reservedSeats: Array<{
    seatId: number;
    seatNumber: string;
    row: string;
    number: number;
    price: number;
    ticketTypeId: number;
    ticketTypeName: string;
    ticketTypeColor: string;
  }>;
}

export const useIndustryStandardSeatSelection = ({
  eventId,
  sessionId,
  userId
}: UseIndustryStandardSeatSelectionProps) => {
  // ✅ CLIENT-SIDE ONLY: No database calls during selection
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  // ✅ INSTANT UI UPDATE: Toggle seat selection (no API calls)
  const toggleSeatSelection = useCallback((seat: Seat) => {
    console.log(`🎯 TOGGLING SEAT ${seat.seatNumber} (ID: ${seat.id})`);
    
    setSelectedSeatIds(prev => {
      const isSelected = prev.includes(seat.id);
      
      if (isSelected) {
        // Remove from selection
        console.log(`➖ REMOVING seat ${seat.seatNumber} from selection`);
        setSelectedSeats(prevSeats => prevSeats.filter(s => s.id !== seat.id));
        return prev.filter(id => id !== seat.id);
      } else {
        // Add to selection
        console.log(`➕ ADDING seat ${seat.seatNumber} to selection`);
        setSelectedSeats(prevSeats => [...prevSeats, seat]);
        return [...prev, seat.id];
      }
    });
  }, []);

  // ✅ INDUSTRY STANDARD: Check availability before proceeding
  const checkAvailability = useCallback(async () => {
    if (selectedSeatIds.length === 0) {
      throw new Error('No seats selected');
    }

    console.log(`🔍 CHECKING AVAILABILITY for ${selectedSeatIds.length} seats`);
    
    const availabilityResponse = await seatingAPIService.checkSeatAvailabilityBatch(eventId, selectedSeatIds);
    
    if (availabilityResponse.unavailableSeatIds.length > 0) {
      const unavailableSeats = availabilityResponse.unavailableDetails.map(s => s.seatNumber).join(', ');
      throw new Error(`Some seats are no longer available: ${unavailableSeats}`);
    }

    return availabilityResponse;
  }, [eventId, selectedSeatIds]);

  // ✅ INDUSTRY STANDARD: Single reservation call for all selected seats
  const reserveSelection = useCallback(async () => {
    if (selectedSeatIds.length === 0) {
      throw new Error('No seats selected');
    }

    setIsReserving(true);
    try {
      console.log(`🎯 BATCH RESERVING ${selectedSeatIds.length} seats`);
      
      // First check availability
      await checkAvailability();
      
      // Then reserve all seats in one transaction
      const reservation = await seatingAPIService.reserveSeatSelection(
        eventId, 
        selectedSeatIds, 
        sessionId, 
        userId
      );
      
      setReservationData(reservation);
      console.log(`✅ RESERVATION SUCCESS:`, reservation);
      
      return reservation;
    } catch (error) {
      console.error('❌ RESERVATION FAILED:', error);
      throw error;
    } finally {
      setIsReserving(false);
    }
  }, [eventId, selectedSeatIds, sessionId, userId, checkAvailability]);

  // ✅ INDUSTRY STANDARD: Release all reserved seats
  const releaseReservation = useCallback(async () => {
    if (!reservationData) {
      return;
    }

    setIsReleasing(true);
    try {
      console.log(`🧹 RELEASING RESERVATION ${reservationData.reservationId}`);
      
      await seatingAPIService.releaseReservation(sessionId, reservationData.reservationId);
      
      // Clear local state
      setReservationData(null);
      setSelectedSeatIds([]);
      setSelectedSeats([]);
      
      console.log(`✅ RESERVATION RELEASED`);
    } catch (error) {
      console.error('❌ RELEASE FAILED:', error);
      throw error;
    } finally {
      setIsReleasing(false);
    }
  }, [reservationData, sessionId]);

  // ✅ Clear selection without API calls
  const clearSelection = useCallback(() => {
    console.log(`🧹 CLEARING ${selectedSeatIds.length} seats from selection`);
    setSelectedSeatIds([]);
    setSelectedSeats([]);
  }, [selectedSeatIds.length]);

  // ✅ Check if seat is selected
  const isSeatSelected = useCallback((seatId: number) => {
    return selectedSeatIds.includes(seatId);
  }, [selectedSeatIds]);

  // ✅ Calculate total price
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return {
    // Selection state (client-side only)
    selectedSeatIds,
    selectedSeats,
    totalPrice,
    
    // Reservation state
    reservationData,
    isReserving,
    isReleasing,
    
    // Actions
    toggleSeatSelection,    // ✅ Instant UI update (no API)
    reserveSelection,       // ✅ Single batch API call
    releaseReservation,     // ✅ Release all seats
    clearSelection,         // ✅ Clear selection (no API)
    checkAvailability,      // ✅ Pre-validate availability
    isSeatSelected,         // ✅ Check selection state
    
    // Computed values
    hasSelection: selectedSeatIds.length > 0,
    selectionCount: selectedSeatIds.length,
    hasActiveReservation: !!reservationData,
  };
};

export default useIndustryStandardSeatSelection;
