import axios from 'axios';

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
  const response = await axios.get('http://localhost:5290/api/Events');
  const events = (response.data as Event[]).map((event) => ({
    ...event,
    isActive: new Date(event.date) > new Date() // Events in the future are active
  }));
  return events;
};
