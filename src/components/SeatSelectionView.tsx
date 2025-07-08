import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, AlertCircle, Users, Star, Eye, Accessibility } from 'lucide-react';
import { message } from 'antd';
import { seatSelectionService } from '../services/seatSelectionService';

// Utility function to adjust hex color brightness
const adjustColor = (color: string, amount: number): string => {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  
  // Remove the # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust each channel
  const adjustedR = clamp(r + amount);
  const adjustedG = clamp(g + amount);
  const adjustedB = clamp(b + amount);
  
  // Convert back to hex
  const rHex = adjustedR.toString(16).padStart(2, '0');
  const gHex = adjustedG.toString(16).padStart(2, '0');
  const bHex = adjustedB.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
};

// Types for seat selection
export interface SeatStatus {
  status: 'Available' | 'Reserved' | 'Booked';
  section: {
    id: number;
    name: string;
    color: string;
  };
  reservedUntil?: Date;
}

export interface SeatSelectionProps {
  layout: any; // VenueLayoutData from AdvancedVenueDesigner
  eventId: string;
  selectedSeats: string[];
  onSeatSelection: (seatIds: string[]) => void;
  onSectionSelection?: (sectionId: string, tableId?: string) => void;
  maxSelection?: number;
  allowGroupSelection?: boolean;
  realTimeUpdates?: boolean;
  priceCalculation?: (seatIds: string[]) => number;
}

export interface TableSelectionProps {
  layout: any;
  eventId: string;
  selectedTables: string[];
  onTableSelection: (tableIds: string[], guestCount?: number) => void;
  maxTableSelection?: number;
  priceCalculation?: (tableIds: string[], guestCount: number) => number;
}

// Real-time seat status management
export const useSeatStatus = (eventId: string, realTimeUpdates: boolean = true) => {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, SeatStatus>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!realTimeUpdates) return;

    // Simulate real-time updates with WebSocket or polling
    const interval = setInterval(() => {
      // In real implementation, this would be WebSocket connection
      fetchSeatStatuses();
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId, realTimeUpdates]);

  const fetchSeatStatuses = async () => {
    setIsLoading(true);
    try {
      const seats = await seatSelectionService.getSeats(Number(eventId));
      // Convert seats array to seat status record
      const statusRecord: Record<string, SeatStatus> = {};
      seats.forEach(seat => {
        // Ensure we only use our three allowed status types
        let status: 'Available' | 'Reserved' | 'Booked' = 
          seat.status === 'Booked' ? 'Booked' :
          seat.status === 'Reserved' ? 'Reserved' : 
          'Available';
          
        statusRecord[seat.id.toString()] = {
          status: status,
          section: seat.section
        };
      });
      setSeatStatuses(statusRecord);
    } catch (error) {
      console.error('Failed to fetch seat statuses:', error);
      // Show user-friendly error message
      message.error('Unable to load seat data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const reserveSeats = async (seatIds: string[], duration: number = 10) => {
    try {
      const response = await fetch(`/api/events/${eventId}/reserve-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds, duration }),
      });
      
      if (response.ok) {
        const updatedStatuses = { ...seatStatuses };
        seatIds.forEach(seatId => {
          updatedStatuses[seatId] = {
            ...updatedStatuses[seatId],
            status: 'Reserved',
            reservedUntil: new Date(Date.now() + duration * 60 * 1000),
          };
        });
        setSeatStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error('Failed to reserve seats:', error);
    }
  };

  const releaseSeats = async (seatIds: string[]) => {
    try {
      await fetch(`/api/events/${eventId}/release-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds }),
      });
      
      const updatedStatuses = { ...seatStatuses };
      seatIds.forEach(seatId => {
        if (updatedStatuses[seatId]) {
          updatedStatuses[seatId] = {
            ...updatedStatuses[seatId],
            status: 'Available',
            reservedUntil: undefined,
          };
        }
      });
      setSeatStatuses(updatedStatuses);
    } catch (error) {
      console.error('Failed to release seats:', error);
    }
  };

  return {
    seatStatuses,
    isLoading,
    reserveSeats,
    releaseSeats,
    fetchSeatStatuses,
  };
};

// Seat Selection Component for Individual Seats
export const SeatSelectionView: React.FC<SeatSelectionProps> = ({
  layout,
  eventId,
  selectedSeats,
  onSeatSelection,
  maxSelection = 8,
  allowGroupSelection = true,
  realTimeUpdates = true,
  priceCalculation,
}) => {
  const { seatStatuses, reserveSeats, releaseSeats } = useSeatStatus(eventId, realTimeUpdates);
  const [viewLevel, setViewLevel] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [showLegend, setShowLegend] = useState(true);
  const [reservationTimer, setReservationTimer] = useState<NodeJS.Timeout | null>(null);

  // Get seats for current level
  const currentLevelSeats = useMemo(() => {
    const level = layout.levels?.find((l: any) => l.level === viewLevel);
    return level?.elements?.filter((el: any) => el.type === 'seat') || [];
  }, [layout, viewLevel]);

  // Calculate pricing
  const totalPrice = useMemo(() => {
    if (!priceCalculation) return 0;
    return priceCalculation(selectedSeats);
  }, [selectedSeats, priceCalculation]);

  // Handle seat selection
  const handleSeatClick = (seatId: string) => {
    const seatStatus = seatStatuses[seatId];
    
    // Check if seat is available for selection
    if (seatStatus && ['reserved', 'occupied', 'blocked'].includes(seatStatus.status)) {
      return;
    }

    const isSelected = selectedSeats.includes(seatId);
    let newSelection: string[];

    if (isSelected) {
      // Deselect seat
      newSelection = selectedSeats.filter(id => id !== seatId);
      releaseSeats([seatId]);
    } else {
      // Select seat
      if (selectedSeats.length >= maxSelection) {
        alert(`Maximum ${maxSelection} seats can be selected`);
        return;
      }
      
      newSelection = [...selectedSeats, seatId];
      reserveSeats([seatId]);
    }

    onSeatSelection(newSelection);

    // Set reservation timer
    if (reservationTimer) clearTimeout(reservationTimer);
    const timer = setTimeout(() => {
      releaseSeats(newSelection);
    }, 10 * 60 * 1000); // 10 minutes
    setReservationTimer(timer);
  };

  // Handle group selection (select row or section)
  const handleGroupSelection = (type: 'row' | 'section', identifier: string) => {
    if (!allowGroupSelection) return;

    const availableSeats = currentLevelSeats.filter((seat: any) => {
      const seatStatus = seatStatuses[seat.id];
      const isAvailable = !seatStatus || seatStatus.status === 'Available';
      
      if (type === 'row') {
        return isAvailable && seat.properties.rowLetter === identifier;
      } else {
        return isAvailable && seat.sectionId === identifier;
      }
    });

    if (availableSeats.length + selectedSeats.length > maxSelection) {
      alert(`Cannot select ${availableSeats.length} seats. Maximum ${maxSelection} seats allowed.`);
      return;
    }

    const newSeatIds = availableSeats.map((seat: any) => seat.id);
    const newSelection = [...selectedSeats, ...newSeatIds];
    
    onSeatSelection(newSelection);
    reserveSeats(newSeatIds);
  };

  // Get seat style based on status
  const getSeatStyle = (seat: any): React.CSSProperties => {
    const seatStatus = seatStatuses[seat.id];
    const isSelected = selectedSeats.includes(seat.id);
    const section = layout.sections?.find((s: any) => s.id === seat.sectionId);
    
    let backgroundColor = section?.color || '#3B82F6'; // Use section color or default blue
    let borderColor = section?.color ? adjustColor(section.color, -20) : '#2563EB';
    let opacity = 1;

    if (isSelected) {
      backgroundColor = '#10B981'; // Green for selected
      borderColor = '#059669';
      opacity = 1;
    } else if (seatStatus) {
      switch (seatStatus.status) {
        case 'Reserved':
          backgroundColor = '#F59E0B'; // Orange for reserved
          borderColor = '#D97706';
          opacity = 0.7;
          break;
        case 'Booked':
          backgroundColor = '#EF4444'; // Red for booked
          borderColor = '#DC2626';
          break;
        case 'Available':
          opacity = 0.8; // Slightly transparent for available seats
          break;
      }
    }

    // Special seat types
    if (seat.properties?.isVip) {
      if (!isSelected && (!seatStatus || seatStatus.status === 'Available')) {
        borderColor = '#8B5CF6';
        backgroundColor = '#A855F7';
      }
    }

    return {
      position: 'absolute',
      left: seat.x + 50,
      top: seat.y + 50,
      width: seat.width,
      height: seat.height,
      backgroundColor,
      borderColor,
      borderWidth: '2px',
      borderStyle: seat.properties?.isAccessible ? 'dashed' : 'solid',
      borderRadius: '4px',
      cursor: (seatStatus && ['reserved', 'occupied', 'blocked'].includes(seatStatus.status)) ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.max(8, 10 / zoom),
      fontWeight: 'bold',
      color: 'white',
      opacity,
      transition: 'all 0.2s ease',
      userSelect: 'none',
      zIndex: isSelected ? 10 : 1,
    };
  };

  // Get seat label
  const getSeatLabel = (seat: any) => {
    return `${seat.properties?.rowLetter || 'A'}${seat.properties?.seatNumber || '1'}`;
  };

  // Get tooltip text for seat
  const getSeatTooltip = (seat: any): string => {
    const section = layout.sections?.find((s: any) => s.id === seat.sectionId);
    const price = section?.basePrice || 0;
    const seatStatus = seatStatuses[seat.id];
    
    let statusText = 'Available';
    if (selectedSeats.includes(seat.id)) {
      statusText = 'Selected';
    } else if (seatStatus) {
      statusText = seatStatus.status.charAt(0).toUpperCase() + seatStatus.status.slice(1);
    }

    let details = [
      `Seat: ${getSeatLabel(seat)}`,
      `Section: ${section?.name || 'General'}`,
      `Price: $${price.toFixed(2)}`,
      `Status: ${statusText}`
    ];

    if (seat.properties?.isVip) details.push('VIP Seat');
    if (seat.properties?.isAccessible) details.push('Wheelchair Accessible');

    return details.join('\n');
  };

  // Display sections with better styling and information
  const renderSections = () => {
    if (!layout.sections?.length) return null;

    return (
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Section Information</h3>
        <div className="grid gap-3">
          {layout.sections?.map((section: any) => {
            const sectionSeats = currentLevelSeats.filter((s: any) => s.sectionId === section.id);
            const availableCount = sectionSeats.filter((s: any) => {
              const status = seatStatuses[s.id];
              return !status || status.status === 'Available';
            }).length;
            
            return (
              <div 
                key={section.id} 
                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: `${section.color}10`,
                  borderColor: section.color 
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {availableCount} seats available
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${section.basePrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per seat</div>
                  </div>
                </div>
                
                {section.description && (
                  <div className="mt-2 text-sm text-gray-600">
                    {section.description}
                  </div>
                )}
                
                {allowGroupSelection && availableCount > 0 && (
                  <button
                    onClick={() => handleGroupSelection('section', section.id)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Users size={14} />
                    <span>Book all available seats in this section</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Controls and Info */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Seat Selection</h2>
          <p className="text-sm text-gray-600 mt-1">Choose your preferred seats</p>
        </div>

        {/* Level Selection */}
        {layout.levels && layout.levels.length > 1 && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Venue Level</h3>
            <div className="space-y-2">
              {layout.levels.map((level: any) => (
                <button
                  key={level.id}
                  onClick={() => setViewLevel(level.level)}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    viewLevel === level.level
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sections Information */}
        {renderSections()}

        {/* Selection Summary */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Selection Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Selected Seats:</span>
              <span className="font-medium">{selectedSeats.length} / {maxSelection}</span>
            </div>
            {priceCalculation && (
              <div className="flex justify-between text-sm">
                <span>Total Price:</span>
                <span className="font-bold text-green-600">${totalPrice}</span>
              </div>
            )}
          </div>
          
          {selectedSeats.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <div className="text-xs text-blue-800 mb-1">Selected Seats:</div>
              <div className="flex flex-wrap gap-1">
                {selectedSeats.map(seatId => {
                  const seat = currentLevelSeats.find((s: any) => s.id === seatId);
                  return (
                    <span key={seatId} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                      {seat ? getSeatLabel(seat) : seatId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {allowGroupSelection && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Selection</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select by Row:</label>
                <select
                  onChange={(e) => e.target.value && handleGroupSelection('row', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Choose row...</option>
                  {Array.from(new Set(currentLevelSeats.map((s: any) => s.properties?.rowLetter).filter(Boolean))).map((row: any) => (
                    <option key={String(row)} value={String(row)}>Row {row}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select by Section:</label>
                <select
                  onChange={(e) => e.target.value && handleGroupSelection('section', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Choose section...</option>
                  {layout.sections?.map((section: any) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Legend</h3>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          
          {showLegend && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Row 1: Basic Statuses */}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded opacity-80"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded opacity-70"></div>
                  <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded opacity-50"></div>
                  <span className="text-sm">Blocked</span>
                </div>

                {/* Row 2: Special Seat Types */}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-700"></div>
                  <span className="text-sm">VIP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-700 border-dashed"></div>
                  <span className="text-sm">Accessible</span>
                </div>
                <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-700 border-dashed"></div>
                <span>Accessible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded opacity-50"></div>
                <span>Blocked</span>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        {renderSections()}
      </div>

      {/* Main Seating Chart */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-10">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            -
          </button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            +
          </button>
        </div>

        {/* Seating Chart Canvas */}
        <div 
          className="w-full h-full relative overflow-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Venue Boundary */}
          <div
            className="absolute border-2 border-gray-300 bg-gray-50"
            style={{
              width: layout.venue?.width || 1200,
              height: layout.venue?.height || 800,
              left: 50,
              top: 50,
            }}
          />

          {/* Stage/Performance Area */}
          {layout.levels?.find((l: any) => l.level === viewLevel)?.elements
            ?.filter((el: any) => el.type === 'stage')
            ?.map((stage: any) => (
              <div
                key={stage.id}
                className="absolute bg-gray-800 text-white flex items-center justify-center font-bold text-lg"
                style={{
                  left: stage.x + 50,
                  top: stage.y + 50,
                  width: stage.width,
                  height: stage.height,
                }}
              >
                STAGE
              </div>
            ))}

          {/* Seats */}
          {currentLevelSeats.map((seat: any) => (
            <div
              key={seat.id}
              style={getSeatStyle(seat)}
              onClick={() => handleSeatClick(seat.id)}
              title={getSeatTooltip(seat)}
            >
              {getSeatLabel(seat)}
              
              {/* Special indicators */}
              {seat.properties?.isVip && (
                <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
              )}
              {seat.properties?.isAccessible && (
                <Accessibility className="absolute -top-1 -left-1 w-3 h-3 text-blue-300" />
              )}
            </div>
          ))}

          {/* Other venue elements (aisles, walls, etc.) */}
          {layout.levels?.find((l: any) => l.level === viewLevel)?.elements
            ?.filter((el: any) => !['seat', 'stage'].includes(el.type))
            ?.map((element: any) => (
              <div
                key={element.id}
                className={`absolute ${
                  element.type === 'aisle' ? 'bg-gray-100 border-dashed border-gray-300' :
                  element.type === 'wall' ? 'bg-gray-600' :
                  element.type === 'pillar' ? 'bg-gray-500 rounded-full' :
                  'bg-gray-400'
                }`}
                style={{
                  left: element.x + 50,
                  top: element.y + 50,
                  width: element.width,
                  height: element.height,
                  border: element.type === 'aisle' ? '1px dashed #D1D5DB' : '1px solid #9CA3AF',
                }}
              />
            ))}
        </div>

        {/* Continue Button */}
        {selectedSeats.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => {
                // Proceed to checkout
                console.log('Proceeding with seats:', selectedSeats);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Check className="w-5 h-5" />
              <span>Continue with {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionView;
