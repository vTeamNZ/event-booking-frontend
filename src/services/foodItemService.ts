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

export type CreateFoodItemRequest = {
    name: string;
    price: number;
    description: string;
    eventId: number;
};

export const createFoodItem = async (request: CreateFoodItemRequest): Promise<FoodItem> => {
    const response = await api.post<FoodItem>('/api/FoodItems', request);
    return response.data;
};

export const updateFoodItem = async (id: number, foodItem: Partial<FoodItem>): Promise<void> => {
    await api.put(`/api/FoodItems/${id}`, foodItem);
};

export const deleteFoodItem = async (id: number): Promise<void> => {
    await api.delete(`/api/FoodItems/${id}`);
};
