// Seating Reservation Timer Component
import React, { useState, useEffect } from 'react';
import { SeatingReservationTimerProps } from '../../types/seating-v2';
import { formatTimeRemaining, isReservationExpiring } from '../../utils/seating-v2/seatingUtils';

const SeatingReservationTimer: React.FC<SeatingReservationTimerProps> = ({
  sessionId,
  onExpiry
}) => {
  const [timeRemaining, setTimeRemaining] = useState('10:00');
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const timer = setInterval(() => {
      const remaining = formatTimeRemaining(reservedUntil);
      setTimeRemaining(remaining);
      setIsExpiring(isReservationExpiring(reservedUntil));

      if (remaining === 'Expired') {
        clearInterval(timer);
        onExpiry();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, onExpiry]);

  const bgColor = isExpiring ? 'bg-red-50' : 'bg-yellow-50';
  const textColor = isExpiring ? 'text-red-700' : 'text-yellow-700';
  const borderColor = isExpiring ? 'border-red-400' : 'border-yellow-400';

  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}>
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">Reservation Time Remaining</p>
          <p className="text-sm">{timeRemaining}</p>
        </div>
      </div>
    </div>
  );
};

export default SeatingReservationTimer;
