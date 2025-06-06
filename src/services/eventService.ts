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
  organizer: any;
}

export const getAllEvents = async (): Promise<Event[]> => {
  const response = await axios.get('http://localhost:5290/api/Events');
  return response.data as Event[]; // Force it to use correct type
};
