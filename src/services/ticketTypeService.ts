import { api } from './api';

export interface TicketType {
    id: number;
    type: string;
    price: number;
    description?: string;
    eventId: number;
}

export const getTicketTypesForEvent = async (eventId: number): Promise<TicketType[]> => {
    // Enable mock data for testing
    const useMockData = true;

    if (useMockData) {
        console.log('USING MOCK TICKET TYPE DATA FOR DEBUGGING');
        // Return mock ticket types to help debug UI issues
        return [
            {
                id: 1,
                type: "VIP",
                price: 120.00,
                description: "Premium seating with the best view",
                eventId: eventId
            },
            {
                id: 2,
                type: "Standard",
                price: 80.00,
                description: "Regular seating with good view",
                eventId: eventId
            },
            {
                id: 3,
                type: "Economy",
                price: 50.00,
                description: "Budget-friendly seating option",
                eventId: eventId
            }
        ];
    }

    try {
        const url = `/api/TicketTypes/event/${eventId}`;
        console.log('Making API call to:', api.defaults.baseURL + url);
        const response = await api.get<TicketType[]>(url);
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
