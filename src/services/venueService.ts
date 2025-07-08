import { Venue, VenueFormData } from '../types/venue';
import { api } from './api';

export const venueService = {
    async getVenues(): Promise<Venue[]> {
        const response = await api.get('/api/venues');
        // Process each venue to handle array serialization
        const venues = response.data as any[];
        return venues.map(venue => this.processVenueResponse(venue));
    },

    async getVenue(id: number): Promise<Venue> {
        const response = await api.get(`/api/venues/${id}`);
        return this.processVenueResponse(response.data);
    },
    
    // Helper method to process venue data received from the API
    processVenueResponse(venueData: any): Venue {
        // Parse string arrays back to actual arrays
        return {
            ...venueData,
            horizontalAisleRows: venueData.horizontalAisleRows ? 
                JSON.parse(venueData.horizontalAisleRows) : [],
            verticalAisleSeats: venueData.verticalAisleSeats ? 
                JSON.parse(venueData.verticalAisleSeats) : []
        };
    },

    async createVenue(venueData: VenueFormData): Promise<Venue> {
        // Serialize array properties as JSON strings for the backend
        const serializedData = {
            ...venueData,
            horizontalAisleRows: JSON.stringify(venueData.horizontalAisleRows),
            verticalAisleSeats: JSON.stringify(venueData.verticalAisleSeats)
        };
        
        const response = await api.post('/api/venues', serializedData);
        return this.processVenueResponse(response.data);
    },

    async updateVenue(id: number, venueData: VenueFormData): Promise<void> {
        // Serialize array properties as JSON strings for the backend
        const serializedData = {
            ...venueData,
            horizontalAisleRows: JSON.stringify(venueData.horizontalAisleRows),
            verticalAisleSeats: JSON.stringify(venueData.verticalAisleSeats)
        };
        
        await api.put(`/api/venues/${id}`, { id, ...serializedData });
    },

    async deleteVenue(id: number): Promise<void> {
        await api.delete(`/api/venues/${id}`);
    }
};
