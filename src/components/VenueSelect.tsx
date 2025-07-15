import React from 'react';
import { Venue } from '../types/venue';

interface VenueSelectProps {
    venues: Venue[];
    selectedVenueId: number;
    onVenueChange: (venueId: number) => void;
    loading?: boolean;
    error?: string | null;
    className?: string;
}

export const VenueSelect: React.FC<VenueSelectProps> = ({
    venues,
    selectedVenueId,
    onVenueChange,
    loading = false,
    error = null,
    className = ''
}) => {
    return (
        <div>
            <select
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${className}`}
                value={selectedVenueId || ''}
                onChange={(e) => onVenueChange(Number(e.target.value))}
                disabled={loading}
            >
                <option value="">Select a venue</option>
                {loading ? (
                    <option value="" disabled>Loading venues...</option>
                ) : (
                    venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                            {venue.name} - {venue.address}, {venue.city} (Capacity: {venue.capacity})
                        </option>
                    ))
                )}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
