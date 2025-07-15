import React, { useState } from 'react';
import { VenueFormData, Venue } from '../types/venue';

interface VenuePreviewSectionProps {
    formData: VenueFormData;
    showPreview: boolean;
}

export const VenuePreviewSection: React.FC<VenuePreviewSectionProps> = ({ formData, showPreview }) => {
    if (!showPreview) return null;
    
    return (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Venue Preview</h3>
            <div className="bg-white p-4 border rounded-lg">
                {/* Preview content goes here */}
                <div className="flex flex-col items-center space-y-4">
                    {/* Stage */}
                    <div 
                        className="bg-gray-800 text-white text-center py-2 rounded-lg"
                        style={{ width: `${Math.min(600, formData.seatsPerRow * 20)}px` }}
                    >
                        Stage
                    </div>
                    
                    {/* Seat rows */}
                    <div className="flex flex-col items-center space-y-2">
                        {Array.from({ length: Math.min(formData.numberOfRows, 20) }).map((_, rowIndex) => {
                            const rowLabel = String.fromCharCode(65 + rowIndex);
                            const rowOffset = formData.hasStaggeredSeating && rowIndex % 2 === 1 ? 10 : 0;
                            
                            // Check if there should be a horizontal aisle before this row
                            const hasAisleBefore = formData.hasHorizontalAisles && 
                                formData.horizontalAisleRows.includes(rowIndex - 1);
                            
                            return (
                                <React.Fragment key={rowIndex}>
                                    {/* Horizontal aisle */}
                                    {hasAisleBefore && (
                                        <div 
                                            className="h-4 bg-gray-100 border-t border-b border-gray-300"
                                            style={{ width: `${formData.seatsPerRow * 20 + 100}px` }}
                                        ></div>
                                    )}
                                    
                                    {/* Seat row */}
                                    <div className="flex items-center">
                                        <div className="w-10 text-right mr-3 font-medium">{rowLabel}</div>
                                        <div className="flex" style={{ marginLeft: `${rowOffset}px` }}>
                                            {Array.from({ length: Math.min(formData.seatsPerRow, 30) }).map((_, seatIndex) => {
                                                // Check for vertical aisle
                                                const hasAisleBefore = formData.hasVerticalAisles && 
                                                    formData.verticalAisleSeats.includes(seatIndex - 1);
                                                
                                                return (
                                                    <React.Fragment key={seatIndex}>
                                                        {/* Vertical aisle */}
                                                        {hasAisleBefore && (
                                                            <div 
                                                                className="w-4 h-6 mx-1 bg-gray-100 border-l border-r border-gray-300"
                                                            ></div>
                                                        )}
                                                        
                                                        {/* Seat */}
                                                        <div 
                                                            className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 rounded mx-1"
                                                        >
                                                            {seatIndex + 1}
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                        <div className="w-10 text-left ml-3 font-medium">{rowLabel}</div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
