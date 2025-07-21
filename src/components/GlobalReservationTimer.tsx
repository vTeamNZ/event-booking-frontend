import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';

interface GlobalReservationTimerProps {
  sessionId: string;
  onExpiry?: () => void;
  onRelease?: () => void;
}

export const GlobalReservationTimer: React.FC<GlobalReservationTimerProps> = ({
  sessionId,
  onExpiry,
  onRelease
}) => {
  const [reservationData, setReservationData] = useState<{
    reservationId: string;
    expiresAt: string;
    seatsCount: number;
    totalPrice: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check reservation status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkReservationStatus = async () => {
      try {
        const status = await seatingAPIService.getReservationStatus(sessionId);
        
        if (status.hasActiveReservation && status.expiresAt) {
          setReservationData({
            reservationId: status.reservationId!,
            expiresAt: status.expiresAt,
            seatsCount: status.seatsCount || 0,
            totalPrice: status.totalPrice || 0
          });

          const remaining = new Date(status.expiresAt).getTime() - Date.now();
          setTimeLeft(Math.max(0, remaining));

          if (remaining <= 0) {
            // Timer expired
            handleExpiry();
          }
        } else {
          setReservationData(null);
          setTimeLeft(0);
        }
      } catch (error) {
        console.error('Error checking reservation status:', error);
      }
    };

    // Check immediately
    checkReservationStatus();

    // Then check every second
    interval = setInterval(checkReservationStatus, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId]);

  const handleExpiry = async () => {
    console.log('⏰ Reservation timer expired - auto-releasing seats');
    try {
      if (reservationData?.reservationId) {
        await seatingAPIService.releaseReservation(sessionId, reservationData.reservationId);
      }
      setReservationData(null);
      setTimeLeft(0);
      onExpiry?.();
    } catch (error) {
      console.error('Error auto-releasing expired reservation:', error);
    }
  };

  const handleManualRelease = async () => {
    try {
      if (reservationData?.reservationId) {
        await seatingAPIService.releaseReservation(sessionId, reservationData.reservationId);
      }
      setReservationData(null);
      setTimeLeft(0);
      setIsVisible(false);
      onRelease?.();
    } catch (error) {
      console.error('Error releasing reservation:', error);
    }
  };

  // Don't render if no active reservation or user dismissed
  if (!reservationData || timeLeft <= 0 || !isVisible) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = minutes < 2; // Show red warning when less than 2 minutes

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isUrgent 
          ? 'bg-red-500 animate-pulse' 
          : 'bg-yellow-500'
      }`}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <span className="font-medium">
              {reservationData.seatsCount === 1 
                ? '1 seat reserved' 
                : `${reservationData.seatsCount} seats reserved`
              }
            </span>
            <span className="text-sm opacity-90">
              Total: ${reservationData.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${isUrgent ? 'text-red-100' : 'text-white'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs opacity-75">
              {isUrgent ? 'Time running out!' : 'Time remaining'}
            </div>
          </div>

          <button
            onClick={handleManualRelease}
            className="p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            title="Release seats"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isUrgent && (
        <div className="bg-red-600 py-1 text-center">
          <span className="text-sm text-red-100">
            ⚠️ Complete your purchase soon or your seats will be released!
          </span>
        </div>
      )}
    </div>
  );
};

export default GlobalReservationTimer;
