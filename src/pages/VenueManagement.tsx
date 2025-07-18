import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VenueForm } from '../components/VenueForm';
import { venueService } from '../services/venueService';
import { Venue, VenueFormData } from '../types/venue';

export const VenueManagement: React.FC = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const fetchVenues = async () => {
        try {
            const data = await venueService.getVenues();
            setVenues(data);
        } catch (err) {
            setError('Failed to fetch venues');
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleCreateVenue = async (data: VenueFormData) => {
        try {
            await venueService.createVenue(data);
            setIsFormVisible(false);
            fetchVenues();
        } catch (err) {
            throw new Error('Failed to create venue');
        }
    };

    const handleUpdateVenue = async (data: VenueFormData) => {
        if (!selectedVenue) return;
        
        try {
            await venueService.updateVenue(selectedVenue.id, data);
            setIsFormVisible(false);
            setSelectedVenue(null);
            fetchVenues();
        } catch (err) {
            throw new Error('Failed to update venue');
        }
    };

    const handleDeleteVenue = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this venue?')) return;
        
        try {
            await venueService.deleteVenue(id);
            fetchVenues();
        } catch (err) {
            setError('Failed to delete venue');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Venue Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Create and manage venues for your events.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedVenue(null);
                            setIsFormVisible(true);
                        }}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Venue
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isFormVisible ? (
                <div className="mt-8">
                    <VenueForm
                        initialValues={selectedVenue || undefined}
                        onSubmit={selectedVenue ? handleUpdateVenue : handleCreateVenue}
                        onCancel={() => {
                            setIsFormVisible(false);
                            setSelectedVenue(null);
                        }}
                    />
                </div>
            ) : (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">City</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Layout Type</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacity</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700 bg-gray-800">
                                        {venues.map((venue) => (
                                            <tr key={venue.id}>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{venue.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{venue.city}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{venue.layoutType}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{venue.capacity}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVenue(venue);
                                                            setIsFormVisible(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVenue(venue.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
