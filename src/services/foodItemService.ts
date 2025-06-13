import { api } from './api';

export interface FoodItem {
    id: number;
    name: string;
    price: number;
    description?: string;
    eventId: number;
}

export const getFoodItemsForEvent = async (eventId: number): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>(`/api/FoodItems/event/${eventId}`);
    return response.data;
};
