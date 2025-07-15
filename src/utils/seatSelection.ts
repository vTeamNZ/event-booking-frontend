import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(price);
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function isReservationExpired(reservedUntil?: string): boolean {
  if (!reservedUntil) return false;
  return new Date(reservedUntil) < new Date();
}

export function getTimeRemaining(reservedUntil: string): number {
  const remaining = new Date(reservedUntil).getTime() - new Date().getTime();
  return Math.max(0, Math.floor(remaining / 1000)); // Returns seconds
}

export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
