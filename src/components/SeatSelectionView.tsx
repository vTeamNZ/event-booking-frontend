import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, AlertCircle, Users, Star, Eye, Accessibility } from 'lucide-react';
import { message } from 'antd';
import { seatSelectionService } from '../services/seatSelectionService';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';
import { getTicketTypeName } from '../utils/ticketTypeUtils';
import { TicketType } from '../types/ticketTypes';
import { SeatStatus, SeatStatusInfo, getTicketTypeStyle, getSeatStatusClasses } from '../types/seatStatus';

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
export interface SeatSelectionProps {
  layout: any; // VenueLayoutData from AdvancedVenueDesigner
  eventId: string;
  selectedSeats: string[];
  onSeatSelection: (seatIds: string[]) => void;
  onTicketTypeSelection?: (ticketTypeId: string) => void;
  maxSelection?: number;
  allowGroupSelection?: boolean;
  realTimeUpdates?: boolean;
  priceCalculation?: (seatIds: string[]) => number;
}

// Real-time seat status management
export const useSeatStatus = (eventId: string, realTimeUpdates: boolean = true) => {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, SeatStatusInfo>>({});
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
      const statusRecord: Record<string, SeatStatusInfo> = {};
      seats.forEach(seat => {
        // Map backend status to frontend enum
        let status: SeatStatus;
        switch (seat.status) {
          case 2: // 'Booked'
            status = SeatStatus.Booked;
            break;
          case 1: // 'Reserved'
            status = SeatStatus.Reserved;
            break;
          case 0: // 'Available'
          default:
            status = SeatStatus.Available;
            break;
        }

        // Create a complete ticketType object from the seat data
        const ticketType: TicketType = {
          id: seat.ticketTypeId || 0,
          type: seat.ticketType?.type || seat.ticketType?.name || 'General Admission',
          name: seat.ticketType?.name || seat.ticketType?.type || 'General Admission',
          color: seat.ticketType?.color || '#3B82F6',
          price: seat.ticketType?.price || seat.price || 0,
          eventId: Number(eventId),
          description: seat.ticketType?.description || '',
          seatRowAssignments: seat.ticketType?.seatRowAssignments || undefined
        };

        statusRecord[seat.id.toString()] = {
          status,
          ticketType,
          reservedUntil: seat.reservedUntil ? new Date(seat.reservedUntil) : undefined
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
            status: SeatStatus.Reserved,
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
      // CONSOLIDATED: Use modern seating API service for consistency
      // Convert string IDs to numbers if needed
      const numericSeatIds = seatIds.map(id => {
        // Extract numeric ID if string contains composite identifier
        const numericId = parseInt(id, 10);
        return isNaN(numericId) ? parseInt(id.split('-').pop() || '0', 10) : numericId;
      }).filter(id => id > 0);

      if (numericSeatIds.length > 0) {
        // Use the modern seating API service
        const sessionId = `${eventId}-${Date.now()}`; // Generate or retrieve session ID
        await seatingAPIService.releaseSeats(numericSeatIds, sessionId);
      } else {
        // Fallback to legacy endpoint for non-numeric IDs
        await fetch(`/api/events/${eventId}/release-seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds }),
        });
      }
      
      const updatedStatuses = { ...seatStatuses };
      seatIds.forEach(seatId => {
        if (updatedStatuses[seatId]) {
          updatedStatuses[seatId] = {
            ...updatedStatuses[seatId],
            status: SeatStatus.Available,
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
    if (seatStatus && [SeatStatus.Reserved, SeatStatus.Booked].includes(seatStatus.status)) {
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

  // Handle group selection (select row or ticket type)
  const handleGroupSelection = (type: 'row' | 'ticketType', identifier: string) => {
    if (!allowGroupSelection) return;

    const availableSeats = currentLevelSeats.filter((seat: any) => {
      const seatStatus = seatStatuses[seat.id];
      const isAvailable = !seatStatus || seatStatus.status === SeatStatus.Available;
      
      if (type === 'row') {
        return isAvailable && String(seat.properties?.rowLetter) === identifier;
      } else {
        return isAvailable && String(seat.ticketTypeId) === identifier;
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
    
    // Find the ticket type from layout
    const ticketType = layout.ticketTypes?.find((tt: any) => String(tt.id) === String(seat.ticketTypeId));
    const status = seatStatus?.status || SeatStatus.Available;

    // Start with base style
    let style: React.CSSProperties = {
      position: 'absolute',
      left: seat.x + 50,
      top: seat.y + 50,
      width: seat.width,
      height: seat.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.max(8, 10 / zoom),
      userSelect: 'none',
      transition: 'all 0.2s ease',
      zIndex: isSelected ? 10 : 1,
      cursor: status === SeatStatus.Available ? 'pointer' : 'not-allowed',
      borderWidth: '2px',
      borderStyle: seat.properties?.isAccessible ? 'dashed' : 'solid',
      borderRadius: '4px',
    };

    // Apply ticket type style
    if (ticketType) {
      const baseColor = ticketType.color || '#3B82F6';
      style.backgroundColor = `${baseColor}20`;  // 20% opacity
      style.borderColor = baseColor;
    }

    // Apply status styles
    if (isSelected) {
      style.backgroundColor = '#10B981';  // Green for selected
      style.borderColor = '#059669';
      style.opacity = 1;
    } else if (status === SeatStatus.Reserved) {
      style.backgroundColor = '#F59E0B';  // Orange for reserved
      style.borderColor = '#D97706';
      style.opacity = 0.7;
    } else if (status === SeatStatus.Booked) {
      style.backgroundColor = '#EF4444';  // Red for booked
      style.borderColor = '#DC2626';
      style.opacity = 0.5;
    }

    // Special seat types
    if (seat.properties?.isVip && !isSelected && status === SeatStatus.Available) {
      style.backgroundColor = '#A855F7';  // Purple for VIP
      style.borderColor = '#8B5CF6';
      style.opacity = 0.8;
    }

    return style;
  };

  // Get seat label
  const getSeatLabel = (seat: any) => {
    return `${seat.properties?.rowLetter || 'A'}${seat.properties?.seatNumber || '1'}`;
  };

  // Get tooltip text for seat
  const getSeatTooltip = (seat: any): string => {
    // Find the ticket type from layout
    const seatStatus = seatStatuses[seat.id];
    const ticketType = layout.ticketTypes?.find((tt: any) => String(tt.id) === String(seat.ticketTypeId));
    const price = ticketType?.price || 0;
    const ticketName = ticketType ? (ticketType.name || ticketType.type) : 'Unknown';
    
    let statusText = selectedSeats.includes(seat.id) 
      ? 'Selected' 
      : (seatStatus?.status || SeatStatus.Available);

    let details = [
      `Seat: ${getSeatLabel(seat)}`,
      `Type: ${ticketName}`,
      `Price: $${price.toFixed(2)}`,
      `Status: ${statusText}`
    ];

    if (seat.properties?.isVip) details.push('VIP Seat');
    if (seat.properties?.isAccessible) details.push('Wheelchair Accessible');

    return details.join('\n');
  };

  // Display ticket types with better styling and information
  const renderTicketTypes = () => {
    if (!layout.ticketTypes?.length) return null;

    return (
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Ticket Type Information</h3>
        <div className="grid gap-3">
          {layout.ticketTypes?.map((ticketType: any) => {
            // Filter seats by ticket type - ensure type matching
            const typeSeats = currentLevelSeats.filter((s: any) => 
              String(s.ticketTypeId) === String(ticketType.id)
            );
            const availableCount = typeSeats.filter((s: any) => {
              const status = seatStatuses[s.id];
              return !status || status.status === SeatStatus.Available;
            }).length;
            
            // Use the ticket type color directly, not the style function
            const color = ticketType.color || '#3B82F6';
            const name = getTicketTypeName(ticketType);
            
            return (
              <div 
                key={ticketType.id} 
                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: `${color}10`,
                  borderColor: color 
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {availableCount} seats available
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${ticketType.price?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per seat</div>
                  </div>
                </div>
                
                {ticketType.description && (
                  <div className="mt-2 text-sm text-gray-600">
                    {ticketType.description}
                  </div>
                )}
                
                {allowGroupSelection && availableCount > 0 && (
                  <button
                    onClick={() => handleGroupSelection('ticketType', String(ticketType.id))}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Users size={14} />
                    <span>Book all available seats of this type</span>
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

        {/* Ticket Types Information */}
        {renderTicketTypes()}

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
                <label className="block text-xs text-gray-600 mb-1">Select by Ticket Type:</label>
                <select
                  onChange={(e) => e.target.value && handleGroupSelection('ticketType', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Choose ticket type...</option>
                  {layout.ticketTypes?.map((ticketType: any) => (
                    <option key={ticketType.id} value={String(ticketType.id)}>
                      {ticketType.name || ticketType.type} (${ticketType.price.toFixed(2)})
                    </option>
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
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Basic Seat Statuses */}
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
                  <span className="text-sm">Booked</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                {/* Special Seat Types */}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-700"></div>
                  <span className="text-sm">VIP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-700 border-dashed"></div>
                  <span className="text-sm">Accessible</span>
                </div>
              </div>
            </div>
          )}
        </div>


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
