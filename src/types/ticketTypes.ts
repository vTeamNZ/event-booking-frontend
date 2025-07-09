export interface SeatRowAssignment {
    rowStart: string;
    rowEnd: string;
    maxTickets: number;
}

// Core ticket type from the backend
export interface TicketType {
    id: number;
    type: string;      // Primary field for display
    name: string;      // Secondary field for compatibility
    price: number;
    description?: string;
    eventId: number;
    seatRowAssignments?: string; // JSON string storing seat row assignments
    color: string;     // Color for UI representation
}

// Interface used in CreateEvent and other form components for managing ticket types
export interface TicketTypeData {
    id?: number;
    eventId?: number;  // Optional event ID for API calls
    type: string;
    name: string;      // Keep both fields synchronized
    price: number;
    description: string;
    maxTickets: number;
    seatRows: SeatRowAssignment[];
    color: string;
}

// Interface used in components that display ticket types
export interface TicketTypeDisplay {
    id: number;
    name: string;      // Maps from TicketType.type for display
    type: string;      // Keep both for flexibility
    price: number;
    description?: string;
    eventId: number;
    color: string;     // Color for UI representation
    seatRowAssignments?: string; // JSON string storing seat row assignments
}

// Helper function to convert backend TicketType to TicketTypeDisplay
export const toTicketTypeDisplay = (ticket: TicketType): TicketTypeDisplay => ({
    id: ticket.id,
    name: ticket.type || ticket.name,
    type: ticket.type || ticket.name,
    price: ticket.price,
    description: ticket.description,
    eventId: ticket.eventId,
    color: ticket.color
});

// Helper function to get ticket type name consistently
export const getTicketTypeName = (ticketType: { type?: string; name?: string }): string => {
    return ticketType.type || ticketType.name || 'General Admission';
};
