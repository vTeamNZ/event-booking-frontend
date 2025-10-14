import { api } from './api';
import { TicketType, TicketTypeDisplay, TicketTypeWithState } from '../types/ticketTypes';

export type { TicketType, TicketTypeDisplay, TicketTypeWithState } from '../types/ticketTypes';

// Legacy endpoint - returns all tickets (for organizer use)
export const getTicketTypesForEvent = async (eventId: number): Promise<TicketTypeDisplay[]> => {
    try {
        const response = await api.get<TicketType[]>(`/TicketTypes/event/${eventId}`);
        
        // Transform TicketType to TicketTypeDisplay
        return response.data.map(ticket => ({
            id: ticket.id,
            type: ticket.type || ticket.name || 'General Admission',
            name: ticket.name || ticket.type || 'General Admission', // Ensure name is set
            price: ticket.price,
            description: ticket.description,
            eventId: ticket.eventId,
            color: ticket.color || '#888888', // Use the color from API or default to gray
            seatRowAssignments: ticket.seatRowAssignments,
            isStanding: ticket.isStanding || false // Preserve isStanding property
        }));
    } catch (error) {
        console.error('Error fetching ticket types:', error);
        throw error; // Let the component handle the error
    }
};

// NEW: Get visible tickets for customers (excludes hidden tickets, includes disabled as "not available")
export const getVisibleTicketTypesForCustomers = async (eventId: number): Promise<TicketTypeWithState[]> => {
    try {
        const response = await api.get<TicketTypeWithState[]>(`/TicketTypes/event/${eventId}/customer`);
        return response.data;
    } catch (error) {
        console.error('Error fetching visible ticket types for customers:', error);
        throw error;
    }
};

// NEW: Get only active tickets that customers can purchase
export const getActiveTicketTypesForPurchase = async (eventId: number): Promise<TicketTypeWithState[]> => {
    try {
        const response = await api.get<TicketTypeWithState[]>(`/TicketTypes/event/${eventId}/active`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active ticket types for purchase:', error);
        throw error;
    }
};

// NEW: Get ticket type with full state information
export const getTicketTypeWithState = async (ticketTypeId: number): Promise<TicketTypeWithState> => {
    try {
        const response = await api.get<TicketTypeWithState>(`/TicketTypes/${ticketTypeId}/state`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ticket type with state:', error);
        throw error;
    }
};

export const createTicketType = async (ticketType: Omit<TicketType, 'id'>): Promise<TicketType> => {
    const response = await api.post<TicketType>('/TicketTypes', ticketType);
    return response.data;
};

export const updateTicketType = async (id: number, ticketType: Partial<TicketType>): Promise<TicketType> => {
    const response = await api.put<TicketType>(`/TicketTypes/${id}`, ticketType);
    return response.data;
};

export const deleteTicketType = async (id: number): Promise<void> => {
    await api.delete(`/TicketTypes/${id}`);
};
