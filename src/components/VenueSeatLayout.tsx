import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { generateSeatLayout, generateSectionLayout } from '../utils/venueLayout';
import { Venue, SeatConfig } from '../types/venue';
import { venueSeatingService } from '../services/venueSeatingService';
import { generateSessionId } from '../utils/seatSelection';

interface VenueSeatLayoutProps {
    eventId: number;
    venue: Venue;
    onSelectionComplete: (selectedSeats: SeatConfig[]) => void;
}

export const VenueSeatLayout: React.FC<VenueSeatLayoutProps> = ({
    eventId,
    venue,
    onSelectionComplete
}) => {
    const [selectedSeats, setSelectedSeats] = useState<SeatConfig[]>([]);
    const [seatLayout, setSeatLayout] = useState<SeatConfig[]>([]);
    const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sessionId = generateSessionId();

    useEffect(() => {
        const loadLayout = async () => {
            try {
                setLoading(true);
                // Generate the initial layout
                const seats = generateSeatLayout(venue);
                setSeatLayout(seats);

                // Load booked seats from the server
                const bookedSeatsResponse = await venueSeatingService.getBookedSeats(eventId);
                const bookedSet = new Set(bookedSeatsResponse.map(seat => `${seat.row}-${seat.number}`));
                setBookedSeats(bookedSet);
            } catch (err) {
                setError('Failed to load seat layout');
                console.error('Error loading layout:', err);
            } finally {
                setLoading(false);
            }
        };

        loadLayout();
    }, [eventId, venue]);

    const handleSeatClick = async (seat: SeatConfig) => {
        const seatKey = `${seat.row}-${seat.number}`;
        
        // Check if seat is booked
        if (bookedSeats.has(seatKey)) {
            // Visual feedback is sufficient - seat color shows status
            return;
        }

        // Check if seat is already selected
        const isSelected = selectedSeats.some(s => s.row === seat.row && s.number === seat.number);

        if (isSelected) {
            // Remove seat from selection
            setSelectedSeats(prev => prev.filter(s => !(s.row === seat.row && s.number === seat.number)));
        } else {
            // Add seat to selection
            try {
                // Try to reserve the seat
                await venueSeatingService.reserveSeat(eventId, {
                    sessionId,
                    seatId: `${seat.row}-${seat.number}`,
                    row: seat.row,
                    number: seat.number
                });

                setSelectedSeats(prev => [...prev, seat]);
            } catch (err) {
                toast.error('Failed to select seat. It may have been taken by another user.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }

    const getSeatColor = (seat: SeatConfig) => {
        const seatKey = `${seat.row}-${seat.number}`;
        if (bookedSeats.has(seatKey)) return '#EF4444'; // Red for booked
        if (selectedSeats.some(s => s.row === seat.row && s.number === seat.number)) return '#10B981'; // Green for selected
        if (seat.isWheelchair) return '#6366F1'; // Indigo for wheelchair
        return '#4A5568'; // Gray for available
    };

    const containerStyle: React.CSSProperties = {
        width: `${venue.width}px`,
        height: `${venue.height}px`,
        margin: '2rem auto',
        position: 'relative',
        overflow: 'auto',
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
    };

    return (
        <div className="space-y-6">
            {/* Stage indicator */}
            <div className="text-center">
                <div className="inline-block bg-gray-700 text-white px-4 py-1 rounded text-sm">
                    Stage
                </div>
            </div>

            {/* Seat map container */}
            <div style={containerStyle}>
                {seatLayout.map((seat) => (
                    <motion.button
                        key={`${seat.row}-${seat.number}`}
                        style={{
                            position: 'absolute',
                            left: seat.x,
                            top: seat.y,
                            width: '30px',
                            height: '30px',
                            backgroundColor: getSeatColor(seat),
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onClick={() => handleSeatClick(seat)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={`Row ${seat.row + 1}, Seat ${seat.number}`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4A5568' }}></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                    <span>Booked</span>
                </div>
                {venue.hasWheelchairSpaces && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6366F1' }}></div>
                        <span>Wheelchair Accessible</span>
                    </div>
                )}
            </div>

            {/* Selection summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Selected Seats</h3>
                <div className="mt-2">
                    {selectedSeats.length === 0 ? (
                        <p className="text-gray-500">No seats selected</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((seat) => (
                                <div
                                    key={`${seat.row}-${seat.number}`}
                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                >
                                    Row {seat.row + 1}, Seat {seat.number}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => setSelectedSeats([])}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Clear Selection
                </button>
                <button
                    type="button"
                    onClick={() => onSelectionComplete(selectedSeats)}
                    disabled={selectedSeats.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm Selection
                </button>
            </div>
        </div>
    );
};
