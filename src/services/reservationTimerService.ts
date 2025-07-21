// Simple Reservation Timer Service
import { toast } from 'react-hot-toast';
import config from '../config/api';

export interface ReservationData {
  reservationId: string;
  eventId: number;
  sessionId: string;
  expiresAt: string;
  seatIds: number[];
  seatsCount: number;
  totalPrice: number;
}

export interface ReservationWarning {
  level: 'info' | 'warning' | 'critical' | 'expired';
  timeLeft: number;
  message: string;
}

type WarningCallback = (warning: ReservationWarning) => void;
type ExpiredCallback = () => void;

class ReservationTimerService {
  private reservation: ReservationData | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private warningCallbacks: WarningCallback[] = [];
  private expiredCallbacks: ExpiredCallback[] = [];
  private warningsSent: Set<string> = new Set();

  private readonly WARNING_LEVELS = [
    { minutes: 5, level: 'info' as const, message: '5 minutes remaining to complete your booking' },
    { minutes: 2, level: 'warning' as const, message: 'Only 2 minutes left! Please complete your purchase soon' },
    { minutes: 0.5, level: 'critical' as const, message: 'URGENT: Only 30 seconds remaining!' }
  ];

  // ========== CORE TIMER METHODS ==========

  async startTimer(reservationData: ReservationData): Promise<void> {
    try {
      this.reservation = reservationData;
      this.warningsSent.clear();
      this.startCountdown();
      
      console.log('🎯 Timer started:', reservationData);
      toast.success(`${reservationData.seatsCount} seats reserved for 10 minutes!`);
    } catch (error) {
      console.error('❌ Failed to start timer:', error);
      toast.error('Failed to start reservation timer');
    }
  }

  // ========== STATE MANAGEMENT ==========

  getTimeLeft(): number {
    if (!this.reservation) return 0;
    
    const now = new Date().getTime();
    const expiry = new Date(this.reservation.expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }

  getReservation(): ReservationData | null {
    return this.reservation;
  }

  isActive(): boolean {
    return this.reservation !== null && this.getTimeLeft() > 0;
  }

  // ========== WARNING SYSTEM ==========

  private checkWarnings(): void {
    if (!this.reservation) return;

    const timeLeft = this.getTimeLeft();
    const minutesLeft = timeLeft / 60;

    for (const warning of this.WARNING_LEVELS) {
      const warningKey = `${warning.minutes}min`;
      
      if (minutesLeft <= warning.minutes && !this.warningsSent.has(warningKey)) {
        this.warningsSent.add(warningKey);
        
        const warningData: ReservationWarning = {
          level: warning.level,
          timeLeft,
          message: warning.message
        };

        this.notifyWarningCallbacks(warningData);
        console.log(`⚠️ Warning sent: ${warning.message}`);
      }
    }
  }

  // ========== EXPIRY HANDLING ==========

  private async handleExpired(): Promise<void> {
    console.log('⏰ Reservation expired');
    
    this.cleanup();
    this.notifyExpiredCallbacks();
    
    toast.error('Reservation expired! Please select seats again.', {
      duration: 5000,
      icon: '⏰'
    });
  }

  // ========== COUNTDOWN MANAGEMENT ==========

  private startCountdown(): void {
    this.stopCountdown();

    this.countdownInterval = setInterval(() => {
      if (!this.reservation) return;

      const timeLeft = this.getTimeLeft();
      if (timeLeft <= 0) {
        this.handleExpired();
        return;
      }

      this.checkWarnings();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  // ========== EVENT CALLBACKS ==========

  onWarning(callback: WarningCallback): void {
    this.warningCallbacks.push(callback);
  }

  onExpired(callback: ExpiredCallback): void {
    this.expiredCallbacks.push(callback);
  }

  private notifyWarningCallbacks(warning: ReservationWarning): void {
    this.warningCallbacks.forEach(callback => {
      try {
        callback(warning);
      } catch (error) {
        console.error('❌ Warning callback error:', error);
      }
    });
  }

  private notifyExpiredCallbacks(): void {
    this.expiredCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ Expired callback error:', error);
      }
    });
  }

  // ========== CLEANUP ==========

  cleanup(): void {
    console.log('🧹 Cleaning up timer service');
    
    this.stopCountdown();
    this.reservation = null;
    this.warningsSent.clear();
  }

  // ========== PAYMENT SUCCESS ==========

  clearAfterPayment(): void {
    console.log('💳 Payment successful - clearing timer');
    
    this.stopCountdown();
    this.reservation = null;
    this.warningsSent.clear();
    
    toast.success('🎉 Payment successful! Your seats are now confirmed');
  }
}

// Singleton instance
export const reservationTimer = new ReservationTimerService();
export default reservationTimer;
