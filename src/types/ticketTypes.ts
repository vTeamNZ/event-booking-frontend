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
    maxTickets?: number; // Maximum number of tickets available (for General Admission)
    isStanding?: boolean; // New: Whether this is a standing ticket type
    standingCapacity?: number; // New: Standing capacity for this ticket type
    
    // State management properties
    isActive?: boolean;    // Whether ticket is active (can be purchased)
    isHidden?: boolean;    // Whether ticket is hidden from customers
    replacedBy?: number;   // ID of replacement ticket type
    createdAt?: string;    // Creation timestamp
    disabledAt?: string;   // When ticket was disabled
    hiddenAt?: string;     // When ticket was hidden
}

// Enhanced ticket type with state information from the new backend API
export interface TicketTypeWithState {
    id: number;
    type: string;
    name: string;
    price: number;
    description?: string;
    eventId: number;
    seatRowAssignments?: string;
    color: string;
    maxTickets?: number;
    isStanding?: boolean;
    standingCapacity?: number;
    
    // State management properties
    isActive: boolean;
    isHidden: boolean;
    replacedBy?: number;
    createdAt: string;
    disabledAt?: string;
    hiddenAt?: string;
    
    // Computed properties
    isAvailableForPurchase: boolean;  // isActive && !isHidden
    isVisibleToCustomers: boolean;    // !isHidden
    hasReplacement: boolean;          // replacedBy != null
    
    // Replacement ticket info (if any)
    replacedByTicketName?: string;
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
    isStanding?: boolean; // New: Whether this is a standing ticket type
    standingCapacity?: number; // New: Standing capacity for this ticket type
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
    isStanding?: boolean; // New: Whether this is a standing ticket type
    standingCapacity?: number; // New: Standing capacity for this ticket type
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

// Helper function to check if a ticket is available for purchase
export const isTicketAvailableForPurchase = (ticket: TicketType | TicketTypeWithState): boolean => {
    // If it has state info, use the computed property
    if ('isAvailableForPurchase' in ticket) {
        return ticket.isAvailableForPurchase;
    }
    // Fallback for legacy tickets - assume available if isActive is not explicitly false
    return ticket.isActive !== false && ticket.isHidden !== true;
};

// Helper function to check if a ticket should be visible to customers
export const isTicketVisibleToCustomers = (ticket: TicketType | TicketTypeWithState): boolean => {
    // If it has state info, use the computed property
    if ('isVisibleToCustomers' in ticket) {
        return ticket.isVisibleToCustomers;
    }
    // Fallback for legacy tickets - assume visible if isHidden is not true
    return ticket.isHidden !== true;
};

// Helper function to get ticket status for display
export const getTicketStatus = (ticket: TicketType | TicketTypeWithState): 'available' | 'disabled' | 'hidden' => {
    if (!isTicketVisibleToCustomers(ticket)) {
        return 'hidden';
    }
    if (!isTicketAvailableForPurchase(ticket)) {
        return 'disabled';
    }
    return 'available';
};

// Helper function to get ticket status message for UI
export const getTicketStatusMessage = (ticket: TicketType | TicketTypeWithState): string | null => {
    const status = getTicketStatus(ticket);
    
    switch (status) {
        case 'disabled':
            // Check if there's a replacement ticket
            if ('hasReplacement' in ticket && ticket.hasReplacement && ticket.replacedByTicketName) {
                return `No longer available - see ${ticket.replacedByTicketName}`;
            }
            return 'No longer available';
        case 'hidden':
            return null; // Hidden tickets shouldn't be shown at all
        case 'available':
        default:
            return null; // No special message for available tickets
    }
};
