// Core ticket type from the backend
export interface TicketType {
    id: number;
    type: string;      // From backend, matches TicketType.Type
    price: number;
    description?: string;
    eventId: number;
    seatRowAssignments?: string; // JSON string storing seat row assignments
    color: string;     // Color for UI representation
}

// Interface used in components that display ticket types
export interface TicketTypeDisplay {
    id: number;
    name: string;      // Maps from TicketType.type for display
    price: number;
    description?: string;
    eventId: number;
    color: string;     // Color for UI representation
}

// Helper function to convert TicketType to TicketTypeDisplay
export const toTicketTypeDisplay = (ticket: TicketType): TicketTypeDisplay => ({
    id: ticket.id,
    name: ticket.type,
    price: ticket.price,
    description: ticket.description,
    eventId: ticket.eventId,
    color: ticket.color
});
