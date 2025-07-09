import { api } from './api';
import { TicketType, TicketTypeData } from '../types/ticketTypes';
import { getTicketTypeColor } from '../utils/ticketTypeUtils';

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
  const response = await api.get('/api/Events');
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
  
  const response = await api.post<TicketType>('/api/TicketTypes', processedData);
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
  
  const response = await api.put<TicketType>(`/api/TicketTypes/${id}`, processedData);
  return response.data;
};

// Get ticket types for an event
export const getTicketTypesForEvent = async (eventId: number): Promise<TicketType[]> => {
  const response = await api.get<TicketType[]>(`/api/Events/${eventId}/TicketTypes`);
  return response.data;
};

// Delete a ticket type
export const deleteTicketType = async (id: number): Promise<void> => {
  await api.delete(`/api/TicketTypes/${id}`);
};
