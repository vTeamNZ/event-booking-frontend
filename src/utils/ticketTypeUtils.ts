/**
 * Utility functions for working with ticket types
 */

/**
 * Gets the display name for a ticket type, handling both name and type fields
 * for backwards compatibility
 * @param ticketType The ticket type object which may have name and/or type properties
 * @returns The display name to use
 */
export const getTicketTypeName = (ticketType: { type?: string; name?: string } | null | undefined): string => {
  if (!ticketType) return 'General Admission';
  return ticketType.type || ticketType.name || 'General Admission';
};

/**
 * Gets the color for a ticket type with a fallback
 * @param ticketType The ticket type object
 * @returns The color to use for display
 */
export const getTicketTypeColor = (ticketType: { color?: string; type?: string } | null | undefined): string => {
  if (!ticketType) return '#3B82F6'; // Default blue
  return ticketType.color || '#3B82F6';
};
