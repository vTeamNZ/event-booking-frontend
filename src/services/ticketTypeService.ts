import { api } from './api';

export interface TicketType {
    id: number;
    type: string;
    price: number;
    description?: string;
    eventId: number;
}

export const getTicketTypesForEvent = async (eventId: number): Promise<TicketType[]> => {
    try {
        const response = await api.get<TicketType[]>(`/api/TicketTypes/event/${eventId}`);
        if (!Array.isArray(response.data)) {
            console.error('Unexpected response format:', response.data);
            return [];
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching ticket types:', error);
        throw error;
    }
};
