import React, { useState } from 'react';
import { Venue } from '../types/venue';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface VenueSeatPreviewProps {
    venue: Venue;
}

export const VenueSeatPreview: React.FC<VenueSeatPreviewProps> = ({ venue }) => {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const {
        numberOfRows, 
        seatsPerRow, 
        hasHorizontalAisles, 
        horizontalAisleRows, 
        hasVerticalAisles, 
        verticalAisleSeats,
        hasStaggeredSeating,
        hasWheelchairSpaces,
        aisleWidth
    } = venue;

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Style for the container that will be transformed
    const transformStyle = {
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        transformOrigin: '0 0',
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    const renderSeat = (rowIndex: number, seatIndex: number) => {
        // Check if this position should be an aisle
        if (hasVerticalAisles && verticalAisleSeats.includes(seatIndex)) {
            return <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-6" style={{ marginRight: `${(aisleWidth - 1) * 24}px` }} />;
        }

        const rowLabel = String.fromCharCode(65 + rowIndex);
        const isWheelchair = hasWheelchairSpaces && 
            rowIndex === 0 && 
            (seatIndex === 0 || seatIndex === seatsPerRow - 1);

        return (
            <div 
                key={`seat-${rowIndex}-${seatIndex}`}
                className={`w-6 h-6 flex items-center justify-center text-xs border rounded ${
                    isWheelchair ? 'bg-blue-200 border-2 border-blue-500' : 'bg-white hover:bg-gray-100'
                }`}
                title={`${rowLabel}${seatIndex + 1}`}
            >
                {isWheelchair ? '♿' : ''}
            </div>
        );
    };

    return (
        <div className="relative overflow-hidden bg-white rounded-lg">
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                    onClick={handleZoomIn}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
                <button
                    onClick={handleReset}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Reset View"
                >
                    <RotateCw size={20} />
                </button>
            </div>

            {/* Current zoom level indicator */}
            <div className="absolute top-4 left-4 z-10 bg-white/80 px-2 py-1 rounded-md text-sm">
                {Math.round(scale * 100)}%
            </div>

            {/* Venue preview with pan and zoom */}
            <div 
                className="overflow-auto max-h-[60vh] min-h-[500px]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="relative p-8">
                    <div style={transformStyle} className="inline-block transition-transform duration-100">
                        {/* Stage */}
                        <div className="bg-gray-800 text-white text-center py-2 mb-8 rounded-lg w-[80%] max-w-[600px] mx-auto">
                            Stage
                        </div>

                        {/* Seat Grid */}
                        <div className="flex flex-col items-center space-y-2">
                            {Array.from({ length: numberOfRows }).map((_, rowIndex) => {
                                const rowLabel = String.fromCharCode(65 + rowIndex);
                                const isAisleAfter = hasHorizontalAisles && horizontalAisleRows.includes(rowIndex);
                                
                                return (
                                    <React.Fragment key={rowIndex}>
                                        <div className="flex items-center">
                                            <div className="w-8 text-right mr-3 font-medium">{rowLabel}</div>
                                            <div className="flex space-x-1">
                                                {Array.from({ length: seatsPerRow }).map((_, seatIndex) => 
                                                    renderSeat(rowIndex, seatIndex)
                                                )}
                                            </div>
                                            <div className="w-8 text-left ml-3 font-medium">{rowLabel}</div>
                                        </div>
                                        {isAisleAfter && (
                                            <div 
                                                className="w-full"
                                                style={{ height: `${(aisleWidth - 1) * 24}px` }}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pan and zoom instructions */}
            <div className="absolute bottom-4 left-4 z-10 bg-white/80 px-3 py-2 rounded-md text-sm">
                <p>Click and drag to pan • Use buttons to zoom</p>
            </div>
        </div>
    );
};
