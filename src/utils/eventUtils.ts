// Frontend utility to match backend logic exactly
export const isEventActive = (eventDate: string | null): boolean => {
  if (!eventDate) return false;
  
  const today = new Date();
  const eventDay = new Date(eventDate);
  
  // Set both dates to start of day for comparison (same logic as backend)
  today.setHours(0, 0, 0, 0);
  eventDay.setHours(0, 0, 0, 0);
  
  // Event is active if it's today or in the future
  return eventDay >= today;
};

export const isEventExpired = (eventDate: string | null): boolean => {
  if (!eventDate) return true;
  
  const today = new Date();
  const eventDay = new Date(eventDate);
  
  // Set both dates to start of day for comparison
  today.setHours(0, 0, 0, 0);
  eventDay.setHours(0, 0, 0, 0);
  
  // Event is expired if it's in the past
  return eventDay < today;
};

import config from '../config/api';

// API call to check event status from server (most reliable)
export const checkEventStatusFromServer = async (eventId: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/payment/check-event-status/${eventId}`);
    if (!response.ok) {
      throw new Error('Failed to check event status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking event status:', error);
    return null;
  }
};

export const getEventStatusText = (eventDate: string | null): string => {
  if (!eventDate) return 'Unknown';
  
  if (isEventExpired(eventDate)) {
    return 'Event Ended';
  } else if (isEventActive(eventDate)) {
    const today = new Date();
    const eventDay = new Date(eventDate);
    
    today.setHours(0, 0, 0, 0);
    eventDay.setHours(0, 0, 0, 0);
    
    if (eventDay.getTime() === today.getTime()) {
      return 'Today';
    } else {
      return 'Upcoming';
    }
  }
  
  return 'Unknown';
};
