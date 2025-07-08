import React, { useState, useEffect } from 'react';
import { Venue, VenueFormData, LAYOUT_TYPES } from '../types/venue';
import { VenueSeatPreview } from './VenueSeatPreview';

interface VenueFormProps {
    initialValues?: Venue;
    onSubmit: (data: VenueFormData) => Promise<void>;
    onCancel: () => void;
}

export const VenueForm: React.FC<VenueFormProps> = ({ initialValues, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<VenueFormData>({
        name: '',
        description: '',
        address: '',
        city: '',
        layoutType: 'Allocated Seating',
        width: 800,
        height: 600,
        capacity: 150, // Default capacity
        numberOfRows: 10,
        seatsPerRow: 15,
        rowSpacing: 40,
        seatSpacing: 30,
        hasStaggeredSeating: false,
        hasWheelchairSpaces: false,
        wheelchairSpaces: 0,
        hasHorizontalAisles: false,
        horizontalAisleRows: [],
        hasVerticalAisles: false,
        verticalAisleSeats: [],
        aisleWidth: 2,
    });

    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(1);
    const [selectedSeatIndex, setSelectedSeatIndex] = useState<number>(1);

    // Calculate venue capacity based on seating configuration
    const calculateCapacity = () => {
        if (formData.layoutType === 'General Admission') {
            return formData.capacity || 150; // Use existing capacity or default
        } else {
            // For allocated seating, calculate based on rows and seats
            return formData.numberOfRows * formData.seatsPerRow;
        }
    };

    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name,
                description: initialValues.description,
                address: initialValues.address,
                city: initialValues.city,
                layoutType: initialValues.layoutType,
                width: initialValues.width || 800,
                height: initialValues.height || 600,
                capacity: initialValues.capacity || calculateCapacity(),
                numberOfRows: initialValues.numberOfRows,
                seatsPerRow: initialValues.seatsPerRow,
                rowSpacing: initialValues.rowSpacing,
                seatSpacing: initialValues.seatSpacing,
                hasStaggeredSeating: initialValues.hasStaggeredSeating,
                hasWheelchairSpaces: initialValues.hasWheelchairSpaces,
                wheelchairSpaces: initialValues.wheelchairSpaces,
                hasHorizontalAisles: initialValues.hasHorizontalAisles || false,
                horizontalAisleRows: initialValues.horizontalAisleRows || [],
                hasVerticalAisles: initialValues.hasVerticalAisles || false,
                verticalAisleSeats: initialValues.verticalAisleSeats || [],
                aisleWidth: initialValues.aisleWidth || 2,
            });
        }
    }, [initialValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        // Handle special cases
        if (name === 'layoutType') {
            // When changing layout type, update form accordingly
            const isAllocatedSeating = value === 'Allocated Seating';
            
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // If switching to general admission, keep capacity; otherwise calculate from rows and seats
                capacity: !isAllocatedSeating ? prev.capacity : prev.numberOfRows * prev.seatsPerRow
            }));
            return;
        }
        
        // For seating configuration fields, update capacity automatically for allocated seating
        if ((name === 'numberOfRows' || name === 'seatsPerRow') && formData.layoutType === 'Allocated Seating') {
            const newValue = Number(value);
            setFormData(prev => {
                const updatedRows = name === 'numberOfRows' ? newValue : prev.numberOfRows;
                const updatedSeats = name === 'seatsPerRow' ? newValue : prev.seatsPerRow;
                
                return {
                    ...prev,
                    [name]: newValue,
                    // Automatically update capacity based on rows * seats
                    capacity: updatedRows * updatedSeats
                };
            });
            return;
        }
        
        // Default handling for all other fields
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                    type === 'number' ? Number(value) : 
                    value
        }));
    };

    const addHorizontalAisle = () => {
        if (selectedRowIndex > 0 && selectedRowIndex < formData.numberOfRows) {
            if (!formData.horizontalAisleRows.includes(selectedRowIndex)) {
                setFormData(prev => ({
                    ...prev,
                    horizontalAisleRows: [...prev.horizontalAisleRows, selectedRowIndex].sort((a, b) => a - b)
                }));
            }
        }
    };

    const removeHorizontalAisle = (rowIndex: number) => {
        setFormData(prev => ({
            ...prev,
            horizontalAisleRows: prev.horizontalAisleRows.filter(r => r !== rowIndex)
        }));
    };

    const addVerticalAisle = () => {
        if (selectedSeatIndex > 0 && selectedSeatIndex < formData.seatsPerRow) {
            if (!formData.verticalAisleSeats.includes(selectedSeatIndex)) {
                setFormData(prev => ({
                    ...prev,
                    verticalAisleSeats: [...prev.verticalAisleSeats, selectedSeatIndex].sort((a, b) => a - b)
                }));
            }
        }
    };

    const removeVerticalAisle = (seatIndex: number) => {
        setFormData(prev => ({
            ...prev,
            verticalAisleSeats: prev.verticalAisleSeats.filter(s => s !== seatIndex)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
            <div className="space-y-4">
                {/* Basic Information */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Venue Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Layout Configuration */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Layout Configuration</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="layoutType" className="block text-sm font-medium text-gray-700">Venue Type</label>
                            <select
                                name="layoutType"
                                id="layoutType"
                                value={formData.layoutType}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {LAYOUT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <h4 className="text-sm font-medium text-gray-800 mb-2">About this Venue Type</h4>
                                {formData.layoutType === 'Allocated Seating' ? (
                                    <p className="text-sm text-gray-600">
                                        <strong>Allocated Seating:</strong> This venue has assigned seats. Attendees will select specific seats when booking. 
                                        Configure rows, seats, and seating layout.
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        <strong>General Admission:</strong> This venue has no assigned seats. Attendees receive entry without specific seat assignments. 
                                        Only total capacity is required.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Venue Capacity */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Venue Capacity</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Total Capacity</label>
                            <input
                                type="number"
                                name="capacity"
                                id="capacity"
                                value={formData.capacity || calculateCapacity()}
                                onChange={handleInputChange}
                                min="1"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Total number of people this venue can accommodate</p>
                        </div>
                    </div>
                </div>

                {/* Seating Configuration - Only for Allocated Seating */}
                {formData.layoutType === 'Allocated Seating' && (
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Seating Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="numberOfRows" className="block text-sm font-medium text-gray-700">Number of Rows</label>
                            <input
                                type="number"
                                name="numberOfRows"
                                id="numberOfRows"
                                value={formData.numberOfRows}
                                onChange={handleInputChange}
                                min="1"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-700">Seats per Row</label>
                            <input
                                type="number"
                                name="seatsPerRow"
                                id="seatsPerRow"
                                value={formData.seatsPerRow}
                                onChange={handleInputChange}
                                min="1"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="rowSpacing" className="block text-sm font-medium text-gray-700">Row Spacing (px)</label>
                            <input
                                type="number"
                                name="rowSpacing"
                                id="rowSpacing"
                                value={formData.rowSpacing}
                                onChange={handleInputChange}
                                min="20"
                                max="100"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="seatSpacing" className="block text-sm font-medium text-gray-700">Seat Spacing (px)</label>
                            <input
                                type="number"
                                name="seatSpacing"
                                id="seatSpacing"
                                value={formData.seatSpacing}
                                onChange={handleInputChange}
                                min="20"
                                max="100"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
                )}

                {/* Aisles Configuration - Only for Allocated Seating */}
                {formData.layoutType === 'Allocated Seating' && (
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Aisles Configuration</h3>
                    <div className="space-y-6">
                        {/* Horizontal Aisles */}
                        <div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        name="hasHorizontalAisles"
                                        id="hasHorizontalAisles"
                                        checked={formData.hasHorizontalAisles}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="hasHorizontalAisles" className="font-medium text-gray-700">Horizontal Aisles</label>
                                    <p className="text-gray-500">Add space between rows for aisles</p>
                                </div>
                            </div>

                            {formData.hasHorizontalAisles && (
                                <div className="mt-4 ml-8 space-y-4">
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1">
                                            <label htmlFor="selectedRowIndex" className="block text-sm font-medium text-gray-700">After Row #</label>
                                            <input
                                                type="number"
                                                id="selectedRowIndex"
                                                value={selectedRowIndex}
                                                onChange={(e) => setSelectedRowIndex(parseInt(e.target.value) || 1)}
                                                min="1"
                                                max={formData.numberOfRows - 1}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addHorizontalAisle}
                                            disabled={selectedRowIndex <= 0 || selectedRowIndex >= formData.numberOfRows}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            Add Horizontal Aisle
                                        </button>
                                    </div>

                                    {formData.horizontalAisleRows.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Horizontal Aisles:</h4>
                                            <div className="space-y-2">
                                                {formData.horizontalAisleRows.map(row => (
                                                    <div key={row} className="flex items-center justify-between border border-gray-200 rounded p-2">
                                                        <span>After row {row} (Row {String.fromCharCode(65 + row)})</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeHorizontalAisle(row)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Vertical Aisles */}
                        <div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        name="hasVerticalAisles"
                                        id="hasVerticalAisles"
                                        checked={formData.hasVerticalAisles}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="hasVerticalAisles" className="font-medium text-gray-700">Vertical Aisles</label>
                                    <p className="text-gray-500">Add space between seats for aisles</p>
                                </div>
                            </div>

                            {formData.hasVerticalAisles && (
                                <div className="mt-4 ml-8 space-y-4">
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1">
                                            <label htmlFor="selectedSeatIndex" className="block text-sm font-medium text-gray-700">After Seat #</label>
                                            <input
                                                type="number"
                                                id="selectedSeatIndex"
                                                value={selectedSeatIndex}
                                                onChange={(e) => setSelectedSeatIndex(parseInt(e.target.value) || 1)}
                                                min="1"
                                                max={formData.seatsPerRow - 1}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVerticalAisle}
                                            disabled={selectedSeatIndex <= 0 || selectedSeatIndex >= formData.seatsPerRow}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            Add Vertical Aisle
                                        </button>
                                    </div>

                                    {formData.verticalAisleSeats.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Vertical Aisles:</h4>
                                            <div className="space-y-2">
                                                {formData.verticalAisleSeats.map(seat => (
                                                    <div key={seat} className="flex items-center justify-between border border-gray-200 rounded p-2">
                                                        <span>After seat {seat}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVerticalAisle(seat)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Aisle Width */}
                        <div>
                            <label htmlFor="aisleWidth" className="block text-sm font-medium text-gray-700">Aisle Width (units)</label>
                            <input
                                type="number"
                                name="aisleWidth"
                                id="aisleWidth"
                                value={formData.aisleWidth}
                                onChange={handleInputChange}
                                min="1"
                                max="5"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Width of aisles in seat units (1-5)</p>
                        </div>
                    </div>
                </div>
                )}

                {/* Additional Options - Only for Allocated Seating */}
                {formData.layoutType === 'Allocated Seating' && (
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Additional Options</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    name="hasStaggeredSeating"
                                    id="hasStaggeredSeating"
                                    checked={formData.hasStaggeredSeating}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="hasStaggeredSeating" className="font-medium text-gray-700">Staggered Seating</label>
                                <p className="text-gray-500">Offset seats for better viewing angles</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    name="hasWheelchairSpaces"
                                    id="hasWheelchairSpaces"
                                    checked={formData.hasWheelchairSpaces}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="hasWheelchairSpaces" className="font-medium text-gray-700">Include Wheelchair Spaces</label>
                            </div>
                        </div>
                        {formData.hasWheelchairSpaces && (
                            <div>
                                <label htmlFor="wheelchairSpaces" className="block text-sm font-medium text-gray-700">Number of Wheelchair Spaces</label>
                                <input
                                    type="number"
                                    name="wheelchairSpaces"
                                    id="wheelchairSpaces"
                                    value={formData.wheelchairSpaces}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>

            {/* Preview Button - Only for Allocated Seating */}
            {formData.layoutType === 'Allocated Seating' && (
            <div className="flex justify-center mt-6">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md shadow-sm hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {showPreview ? 'Hide Preview' : 'Show Venue Preview'}
                </button>
            </div>
            )}

            {/* Venue Preview - Only for Allocated Seating */}
            {formData.layoutType === 'Allocated Seating' && showPreview && (
                <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Venue Preview</h3>
                    <VenueSeatPreview venue={formData as Venue} />
                </div>
            )}
            
            {error && (
                <div className="rounded-md bg-red-50 p-4">
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

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : initialValues ? 'Update Venue' : 'Create Venue'}
                </button>
            </div>
        </form>
    );
};
