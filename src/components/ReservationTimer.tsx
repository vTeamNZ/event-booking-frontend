import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { SelectedSeat } from '../types/seatSelection';
import { getTimeRemaining, formatTimeRemaining } from '../utils/seatSelection';

interface ReservationTimerProps {
  reservedSeats: SelectedSeat[];
  onExpiry: (seatId: number) => void;
}

const ReservationTimer: React.FC<ReservationTimerProps> = ({
  reservedSeats,
  onExpiry
}) => {
  const [timeRemaining, setTimeRemaining] = useState<Record<number, number>>({});

  useEffect(() => {
    const updateTimers = () => {
      const newTimeRemaining: Record<number, number> = {};
      
      reservedSeats.forEach(({ seat, reservedUntil }) => {
        if (reservedUntil) {
          const remaining = getTimeRemaining(reservedUntil.toISOString());
          
          if (remaining <= 0) {
            // Seat reservation expired
            onExpiry(seat.id);
          } else {
            newTimeRemaining[seat.id] = remaining;
          }
        }
      });
      
      setTimeRemaining(newTimeRemaining);
    };

    // Update immediately
    updateTimers();
    
    // Update every second
    const interval = setInterval(updateTimers, 1000);
    
    return () => clearInterval(interval);
  }, [reservedSeats, onExpiry]);

  if (reservedSeats.length === 0) {
    return null;
  }

  const minTimeRemaining = Math.min(...Object.values(timeRemaining));
  const isWarning = minTimeRemaining <= 120; // Warning when less than 2 minutes
  const isCritical = minTimeRemaining <= 60; // Critical when less than 1 minute

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        isCritical 
          ? 'bg-red-50 border-red-200' 
          : isWarning 
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 ${
          isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-blue-700'
        }`}>
          {isCritical ? (
            <AlertTriangle size={20} className="animate-pulse" />
          ) : (
            <Clock size={20} />
          )}
          <span className="font-medium">
            {isCritical 
              ? 'Reservation Expiring Soon!' 
              : isWarning 
                ? 'Reservation Warning'
                : 'Seats Reserved'
            }
          </span>
        </div>
        
        <div className={`text-lg font-bold ${
          isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-blue-600'
        }`}>
          {formatTimeRemaining(minTimeRemaining)}
        </div>
      </div>
      
      <div className={`text-sm mt-2 ${
        isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-blue-600'
      }`}>
        {reservedSeats.length === 1 
          ? `Your seat reservation will expire in ${formatTimeRemaining(minTimeRemaining)}`
          : `Your seat reservations will expire in ${formatTimeRemaining(minTimeRemaining)}`
        }
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              isCritical 
                ? 'bg-red-500' 
                : isWarning 
                  ? 'bg-orange-500' 
                  : 'bg-blue-500'
            }`}
            initial={{ width: '100%' }}
            animate={{ 
              width: `${Math.max(0, (minTimeRemaining / 600) * 100)}%` // 600 seconds = 10 minutes
            }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      
      {/* Individual seat timers (for detailed view) */}
      {reservedSeats.length > 1 && (
        <div className="mt-3 space-y-1">
          {reservedSeats.map(({ seat }) => {
            const seatTime = timeRemaining[seat.id] || 0;
            return (
              <div key={seat.id} className="flex justify-between text-xs">
                <span>Seat {seat.seatNumber}</span>
                <span className="font-medium">
                  {formatTimeRemaining(seatTime)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ReservationTimer;
