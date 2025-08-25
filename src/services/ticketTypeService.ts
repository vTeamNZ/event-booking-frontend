import { api } from './api';
import { TicketType, TicketTypeDisplay } from '../types/ticketTypes';

export type { TicketType, TicketTypeDisplay } from '../types/ticketTypes';

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
