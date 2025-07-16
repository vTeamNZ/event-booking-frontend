import { api } from './api';

export interface FoodItem {
    id: number;
    name: string;
    price: number;
    description?: string;
    eventId: number;
}

export const getFoodItemsForEvent = async (eventId: number): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>(`/FoodItems/event/${eventId}`);
    return response.data;
};

export type CreateFoodItemRequest = {
    name: string;
    price: number;
    description: string;
    eventId: number;
};

export const createFoodItem = async (request: CreateFoodItemRequest): Promise<FoodItem> => {
    const response = await api.post<FoodItem>('/FoodItems', request);
    return response.data;
};

export const updateFoodItem = async (id: number, foodItem: Partial<FoodItem>): Promise<void> => {
    await api.put(`/FoodItems/${id}`, foodItem);
};

export const deleteFoodItem = async (id: number): Promise<void> => {
    await api.delete(`/FoodItems/${id}`);
};
