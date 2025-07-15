import { useState, useEffect } from 'react';
import { Venue } from '../types/venue';
import { venueService } from '../services/venueService';

export const useVenues = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await venueService.getVenues();
            setVenues(data);
        } catch (err) {
            setError('Failed to load venues');
            console.error('Error fetching venues:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    return { venues, loading, error, refetch: fetchVenues };
};
