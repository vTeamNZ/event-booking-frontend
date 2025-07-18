/**
 * Format a price value for display
 * @param price The price value to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

/**
 * Format a date value for display
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

/**
 * Format a time value for display
 * @param time The time to format
 * @returns Formatted time string
 */
export const formatTime = (time: Date | string): string => {
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  return timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
