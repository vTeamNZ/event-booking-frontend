import { api } from './api';
import { TicketType, TicketTypeDisplay } from '../types/ticketTypes';

export type { TicketType, TicketTypeDisplay } from '../types/ticketTypes';

export const getTicketTypesForEvent = async (eventId: number): Promise<TicketTypeDisplay[]> => {
    try {
        console.log('Fetching ticket types for event:', eventId);
        const response = await api.get<TicketType[]>(`/api/TicketTypes/event/${eventId}`);
        console.log('Received ticket types:', response.data);
        
        // Transform TicketType to TicketTypeDisplay
        return response.data.map(ticket => ({
            id: ticket.id,
            name: ticket.type,    // Map the 'type' field to 'name' for display
            price: ticket.price,
            description: ticket.description,
            eventId: ticket.eventId
        }));
    } catch (error) {
        console.error('Error fetching ticket types:', error);
        throw error; // Let the component handle the error
    }
};

export const createTicketType = async (ticketType: Omit<TicketType, 'id'>): Promise<TicketType> => {
    const response = await api.post<TicketType>('/api/TicketTypes', ticketType);
    return response.data;
};

export const updateTicketType = async (id: number, ticketType: Partial<TicketType>): Promise<TicketType> => {
    const response = await api.put<TicketType>(`/api/TicketTypes/${id}`, ticketType);
    return response.data;
};

export const deleteTicketType = async (id: number): Promise<void> => {
    await api.delete(`/api/TicketTypes/${id}`);
};
