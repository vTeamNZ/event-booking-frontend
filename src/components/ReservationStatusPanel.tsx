// 🎯 INDUSTRY STANDARD: Reservation Status Panel
// Shows when user returns to seat selection with active reservation
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import reservationTimer, { ReservationData } from '../services/reservationTimerService';

interface ReservationStatusPanelProps {
  eventId: number;
  onModify: () => void;
  onContinue: () => void;
  onCancel: () => void;
  className?: string;
}

export const ReservationStatusPanel: React.FC<ReservationStatusPanelProps> = ({
  eventId,
  onModify,
  onContinue,
  onCancel,
  className = ''
}) => {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const updateReservationState = () => {
      const currentReservation = reservationTimer.getReservation();
      const currentTimeLeft = reservationTimer.getTimeLeft();
      
      // Only show if reservation exists, matches this event, and has time left
      if (currentReservation && currentReservation.eventId === eventId && currentTimeLeft > 0) {
        setReservation(currentReservation);
        setTimeLeft(currentTimeLeft);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Update immediately
    updateReservationState();
    
    // Update every second
    const interval = setInterval(updateReservationState, 1000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  if (!isVisible || !reservation) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const getStatusColor = () => {
    if (minutes < 1) return 'border-red-200 bg-red-50';
    if (minutes < 3) return 'border-orange-200 bg-orange-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getStatusIcon = () => {
    if (minutes < 1) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (minutes < 3) return <AlertCircle className="h-5 w-5 text-orange-600" />;
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  const getTextColor = () => {
    if (minutes < 1) return 'text-red-900';
    if (minutes < 3) return 'text-orange-900';
    return 'text-blue-900';
  };

  const getDetailColor = () => {
    if (minutes < 1) return 'text-red-700';
    if (minutes < 3) return 'text-orange-700';
    return 'text-blue-700';
  };

  return (
    <div className={`${getStatusColor()} border-2 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${minutes < 1 ? 'bg-red-100' : minutes < 3 ? 'bg-orange-100' : 'bg-blue-100'}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className={`font-semibold ${getTextColor()}`}>
              You have {reservation.seatsCount} seat{reservation.seatsCount > 1 ? 's' : ''} reserved
            </h3>
            <p className={`text-sm ${getDetailColor()}`}>
              Time remaining: {minutes}:{seconds.toString().padStart(2, '0')} • 
              Total: ${reservation.totalPrice.toFixed(2)}
            </p>
            {minutes < 2 && (
              <p className="text-sm font-medium text-red-600 mt-1">
                ⚠️ Complete your booking soon to avoid losing these seats!
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onModify}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Seats
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue to Food
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationStatusPanel;
