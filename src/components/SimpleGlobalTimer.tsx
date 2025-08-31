// 🎯 PRIORITY 1: Simple Global Reservation Timer
// Clean implementation for production deployment
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import reservationTimer, { 
  ReservationData, 
  ReservationWarning 
} from '../services/reservationTimerService';

interface TimerDisplayProps {
  timeLeft: number;
  status: string;
  seatsCount: number;
  totalPrice: number;
  onExtend?: () => void;
  onCancel?: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeLeft, 
  status, 
  seatsCount, 
  totalPrice, 
  onExtend, 
  onCancel 
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-600';
      case 'warning': return 'bg-orange-500';
      case 'active': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'active': return '⏰';
      default: return '🕐';
    }
  };

  return (
    <div className={`${getStatusColor()} text-white px-4 py-3 shadow-lg relative z-[60] transition-all duration-300 w-full`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <span className="font-bold text-lg">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="ml-2 text-sm opacity-90">
              {seatsCount} seats reserved • ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status === 'critical' && (
            <span className="text-sm font-semibold animate-pulse">
              COMPLETE PAYMENT NOW!
            </span>
          )}
          
          {/* Future: Add extend button for Priority 2 */}
          {onExtend && minutes < 2 && (
            <button
              onClick={onExtend}
              className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Extend
            </button>
          )}
          
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const SimpleGlobalTimer: React.FC = () => {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // ========== TIMER UPDATE ==========
  const updateTimer = useCallback(() => {
    const currentReservation = reservationTimer.getReservation();
    const currentTimeLeft = reservationTimer.getTimeLeft();
    
    setReservation(currentReservation);
    setTimeLeft(currentTimeLeft);
    setIsVisible(currentReservation !== null && currentTimeLeft > 0);
  }, []);

  // ========== WARNING HANDLER ==========
  const handleWarning = useCallback((warning: ReservationWarning) => {
    console.log('🎯 Timer warning:', warning);
    
    switch (warning.level) {
      case 'info':
        toast(warning.message, { icon: 'ℹ️', duration: 5000 });
        break;
      case 'warning':
        toast(warning.message, { icon: '⚠️', duration: 8000 });
        break;
      case 'critical':
        toast.error(warning.message, { 
          duration: 10000,
          style: {
            background: '#dc2626',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        break;
      case 'expired':
        handleExpired();
        break;
    }
  }, []);

  // ========== EXPIRY HANDLER ==========
  const handleExpired = useCallback(() => {
    console.log('⏰ Timer expired - redirecting to events');
    setIsVisible(false);
    
    toast.error('Your seat reservation has expired. Please select seats again.', {
      duration: 10000,
      icon: '⏰'
    });
    
    // Redirect to events list after a brief delay
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, [navigate]);

  // ========== INITIALIZATION ==========
  useEffect(() => {
    console.log('🎯 SimpleGlobalTimer: Setting up event listeners');
    
    // Register callbacks
    reservationTimer.onWarning(handleWarning);
    reservationTimer.onExpired(handleExpired);
    
    // Initial state check
    updateTimer();
    
    // Set up polling for updates
    const interval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(interval);
      console.log('🎯 SimpleGlobalTimer: Cleaned up event listeners');
    };
  }, []); // Fixed: Remove circular dependencies

  // ========== HEADER POSITIONING ==========
  useEffect(() => {
    // Set CSS variable for timer height
    if (isVisible) {
      document.documentElement.style.setProperty('--timer-height', '60px');
    } else {
      document.documentElement.style.setProperty('--timer-height', '0px');
    }
  }, [isVisible]);

  // ========== STEP TRACKING ==========
  useEffect(() => {
    if (!reservation) return;
    
    const path = location.pathname;
    let step: 'seats' | 'food' | 'payment' | 'processing' = 'seats';
    
    if (path.includes('/food')) step = 'food';
    else if (path.includes('/payment')) step = 'payment';
    else if (path.includes('/processing')) step = 'processing';
    
    // Note: Step tracking removed for simple version
  }, [location.pathname, reservation]);

  // ========== CANCEL RESERVATION ==========
  const handleCancel = useCallback(async () => {
    if (!reservation) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to cancel your reservation for ${reservation.seatsCount} seats?`
    );
    
    if (confirmed) {
      console.log('🎯 User cancelled reservation');
      reservationTimer.cleanup();
      setIsVisible(false);
      toast.success('Reservation cancelled', { icon: '✅' });
      navigate('/');
    }
  }, [reservation, navigate]);

  // ========== EXTEND RESERVATION (Future Priority 2) ==========
  const handleExtend = useCallback(async () => {
    console.log('🎯 Extend reservation requested (Priority 2 feature)');
    toast('Extend feature coming in next update!', { icon: '🚧' });
  }, []);

  // ========== RENDER ==========
  if (!isVisible || !reservation) {
    return null;
  }
  // Calculate simple status based on time left
  const getStatus = () => {
    if (timeLeft <= 30) return 'critical';
    if (timeLeft <= 120) return 'warning';
    return 'active';
  };

  return (
    <>
      <TimerDisplay
        timeLeft={timeLeft}
        status={getStatus()}
        seatsCount={reservation.seatsCount}
        totalPrice={reservation.totalPrice}
        onExtend={handleExtend}
        onCancel={handleCancel}
      />
      
      {/* 🎯 REMOVED: Scary sync status message - users don't need to know about technical sync issues */}
      {/* Timer continues working locally even if sync fails - no need to alarm users */}
    </>
  );
};

export default SimpleGlobalTimer;
