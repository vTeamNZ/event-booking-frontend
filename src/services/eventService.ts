import { api } from './api';
import axios from 'axios';
import config from '../config/api';
import { TicketType, TicketTypeData } from '../types/ticketTypes';
import { getTicketTypeColor } from '../utils/ticketTypeUtils';

// Create a separate API instance with longer timeout for ticket operations
const ticketApi = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 600000, // 10 minutes timeout for ticket operations
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token for ticket API
ticketApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling for ticket API
ticketApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
  };
  isActive?: boolean;
  organizerName?: string;
  organizerSlug?: string;
}

export const getAllEvents = async (): Promise<Event[]> => {
  const response = await api.get('/Events');
  const events = (response.data as Event[]).map((event) => ({
    ...event,
    isActive: new Date(event.date) > new Date() // Events in the future are active
  }));
  return events;
};

// Helper function to create or update ticket types ensuring both type and name fields are synchronized
export const createTicketType = async (ticketTypeData: Partial<TicketTypeData>): Promise<TicketType> => {
  // Ensure type and name are synchronized
  const typeValue = ticketTypeData.type || ticketTypeData.name || 'General Admission';
  
  const processedData = {
    ...ticketTypeData,
    type: typeValue,
    name: typeValue, // Keep synchronized
    color: ticketTypeData.color || getTicketTypeColor({ type: typeValue })
  };
  
  const response = await ticketApi.post<TicketType>('/TicketTypes', processedData);
  return response.data;
};

// Helper function to create multiple ticket types in bulk (optimized for performance)
export const createTicketTypesBulk = async (ticketTypesData: Partial<TicketTypeData>[]): Promise<TicketType[]> => {
  if (!ticketTypesData.length) {
    throw new Error('No ticket types provided');
  }

  const processedData = ticketTypesData.map(ticketTypeData => {
    const typeValue = ticketTypeData.type || ticketTypeData.name || 'General Admission';
    
    return {
      ...ticketTypeData,
      type: typeValue,
      name: typeValue, // Keep synchronized
      color: ticketTypeData.color || getTicketTypeColor({ type: typeValue })
    };
  });
  
  const response = await ticketApi.post<TicketType[]>('/TicketTypes/bulk', processedData);
  return response.data;
};

// Helper function to update ticket types ensuring both type and name fields are synchronized
export const updateTicketType = async (id: number, ticketTypeData: Partial<TicketTypeData>): Promise<TicketType> => {
  const typeValue = ticketTypeData.type || ticketTypeData.name || 'General Admission';
  
  const processedData = {
    ...ticketTypeData,
    type: typeValue,
    name: typeValue,
    color: ticketTypeData.color || getTicketTypeColor({ type: typeValue }),
    id
  };
  
  const response = await ticketApi.put<TicketType>(`/TicketTypes/${id}`, processedData);
  return response.data;
};

// Get ticket types for an event
export const getTicketTypesForEvent = async (eventId: number): Promise<TicketType[]> => {
  const response = await api.get<TicketType[]>(`/Events/${eventId}/TicketTypes`);
  return response.data;
};

// Delete a ticket type
export const deleteTicketType = async (id: number): Promise<void> => {
  await ticketApi.delete(`/TicketTypes/${id}`);
};
