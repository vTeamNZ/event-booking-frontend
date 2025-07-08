import React, { useState, useMemo } from 'react';
import { Users, Check, Star, AlertCircle } from 'lucide-react';

// Table Selection Component for Banquet/Event Tables
interface TableSelectionViewProps {
  layout: any; // VenueLayoutData from AdvancedVenueDesigner
  eventId: string;
  selectedTables: string[];
  onTableSelection: (tableIds: string[], guestCounts: Record<string, number>) => void;
  maxTableSelection?: number;
  requireGuestCount?: boolean;
  priceCalculation?: (tableIds: string[], guestCounts: Record<string, number>) => number;
}

export const TableSelectionView: React.FC<TableSelectionViewProps> = ({
  layout,
  eventId,
  selectedTables,
  onTableSelection,
  maxTableSelection = 5,
  requireGuestCount = true,
  priceCalculation,
}) => {
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});
  const [viewLevel, setViewLevel] = useState(0);
  const [zoom, setZoom] = useState(1.0);

  // Get tables for current level
  const currentLevelTables = useMemo(() => {
    const level = layout.levels?.find((l: any) => l.level === viewLevel);
    return level?.elements?.filter((el: any) => el.type === 'table') || [];
  }, [layout, viewLevel]);

  // Calculate total pricing
  const totalPrice = useMemo(() => {
    if (!priceCalculation) return 0;
    return priceCalculation(selectedTables, guestCounts);
  }, [selectedTables, guestCounts, priceCalculation]);

  // Handle table selection
  const handleTableClick = (tableId: string) => {
    const isSelected = selectedTables.includes(tableId);
    let newSelection: string[];
    let newGuestCounts = { ...guestCounts };

    if (isSelected) {
      // Deselect table
      newSelection = selectedTables.filter(id => id !== tableId);
      delete newGuestCounts[tableId];
    } else {
      // Select table
      if (selectedTables.length >= maxTableSelection) {
        alert(`Maximum ${maxTableSelection} tables can be selected`);
        return;
      }
      
      newSelection = [...selectedTables, tableId];
      
      // Set default guest count
      const table = currentLevelTables.find((t: any) => t.id === tableId);
      if (table && requireGuestCount) {
        newGuestCounts[tableId] = table.properties?.minimumGuests || 2;
      }
    }

    setGuestCounts(newGuestCounts);
    onTableSelection(newSelection, newGuestCounts);
  };

  // Handle guest count change
  const handleGuestCountChange = (tableId: string, count: number) => {
    const table = currentLevelTables.find((t: any) => t.id === tableId);
    if (!table) return;

    const minGuests = table.properties?.minimumGuests || 1;
    const maxGuests = table.properties?.capacity || 12;
    
    if (count < minGuests || count > maxGuests) {
      alert(`Guest count must be between ${minGuests} and ${maxGuests}`);
      return;
    }

    const newGuestCounts = { ...guestCounts, [tableId]: count };
    setGuestCounts(newGuestCounts);
    onTableSelection(selectedTables, newGuestCounts);
  };

  // Get table style
  const getTableStyle = (table: any): React.CSSProperties => {
    const isSelected = selectedTables.includes(table.id);
    const section = layout.sections?.find((s: any) => s.id === table.sectionId);
    
    let backgroundColor = section?.color || '#8B5CF6';
    let borderColor = '#7C3AED';
    
    if (isSelected) {
      backgroundColor = '#10B981';
      borderColor = '#059669';
    }

    return {
      position: 'absolute',
      left: table.x + 50,
      top: table.y + 50,
      width: table.width,
      height: table.height,
      backgroundColor,
      borderColor,
      borderWidth: '3px',
      borderStyle: 'solid',
      borderRadius: table.properties?.shape === 'round' ? '50%' : '8px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.max(10, 12 / zoom),
      fontWeight: 'bold',
      color: 'white',
      transition: 'all 0.3s ease',
      userSelect: 'none',
      zIndex: isSelected ? 10 : 1,
      boxShadow: isSelected ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    };
  };

  // Get table label
  const getTableLabel = (table: any) => {
    const tableNumber = table.properties?.tableNumber || 1;
    const capacity = table.properties?.capacity || 6;
    return { number: `T${tableNumber}`, capacity: `${capacity} seats` };
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Table Selection</h2>
          <p className="text-sm text-gray-600">Choose your preferred tables</p>
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

        {/* Selection Summary */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Selection Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Selected Tables:</span>
              <span className="font-medium">{selectedTables.length} / {maxTableSelection}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Guests:</span>
              <span className="font-medium">
                {Object.values(guestCounts).reduce((sum, count) => sum + count, 0)}
              </span>
            </div>
            {priceCalculation && (
              <div className="flex justify-between text-sm">
                <span>Total Price:</span>
                <span className="font-bold text-green-600">${totalPrice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Tables Details */}
        {selectedTables.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Selected Tables</h3>
            <div className="space-y-3">
              {selectedTables.map(tableId => {
                const table = currentLevelTables.find((t: any) => t.id === tableId);
                if (!table) return null;
                
                const { number, capacity } = getTableLabel(table);
                const section = layout.sections?.find((s: any) => s.id === table.sectionId);
                const guestCount = guestCounts[tableId] || table.properties?.minimumGuests || 2;
                const minGuests = table.properties?.minimumGuests || 1;
                const maxGuests = table.properties?.capacity || 12;

                return (
                  <div key={tableId} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-green-800">{number}</span>
                        <span className="text-xs text-green-600 ml-2">{section?.name}</span>
                      </div>
                      <span className="text-xs text-green-600">${section?.basePrice || 0}</span>
                    </div>
                    
                    <div className="text-xs text-green-700 mb-2">{capacity}</div>
                    
                    {requireGuestCount && (
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-green-700">Guests:</label>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleGuestCountChange(tableId, Math.max(minGuests, guestCount - 1))}
                            className="w-6 h-6 bg-green-200 text-green-800 rounded flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{guestCount}</span>
                          <button
                            onClick={() => handleGuestCountChange(tableId, Math.min(maxGuests, guestCount + 1))}
                            className="w-6 h-6 bg-green-200 text-green-800 rounded flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleTableClick(tableId)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove Table
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table Types Legend */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Table Types</h3>
          <div className="space-y-2">
            {layout.sections?.map((section: any) => {
              const sectionTables = currentLevelTables.filter((t: any) => t.sectionId === section.id);
              const availableCount = sectionTables.length;
              
              return (
                <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: section.color }}
                    />
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>${section.basePrice}</div>
                    <div>{availableCount} tables</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Shapes Legend */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Table Shapes</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
              <span>Round Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-purple-500 rounded"></div>
              <span>Rectangular Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-purple-500 rounded-lg"></div>
              <span>Square Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Chart */}
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

        {/* Table Chart Canvas */}
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

          {/* Dance Floor */}
          {layout.levels?.find((l: any) => l.level === viewLevel)?.elements
            ?.filter((el: any) => el.type === 'stage' && el.properties?.label?.includes('Dance'))
            ?.map((danceFloor: any) => (
              <div
                key={danceFloor.id}
                className="absolute bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold border-2 border-yellow-500"
                style={{
                  left: danceFloor.x + 50,
                  top: danceFloor.y + 50,
                  width: danceFloor.width,
                  height: danceFloor.height,
                }}
              >
                DANCE FLOOR
              </div>
            ))}

          {/* Tables */}
          {currentLevelTables.map((table: any) => {
            const { number, capacity } = getTableLabel(table);
            const isSelected = selectedTables.includes(table.id);
            const guestCount = guestCounts[table.id];
            
            return (
              <div
                key={table.id}
                style={getTableStyle(table)}
                onClick={() => handleTableClick(table.id)}
                title={`${number} - ${capacity} - ${layout.sections?.find((s: any) => s.id === table.sectionId)?.name}`}
              >
                <div className="text-center">
                  <div className="font-bold">{number}</div>
                  <div className="text-xs opacity-90">{capacity}</div>
                  {isSelected && guestCount && (
                    <div className="text-xs bg-white bg-opacity-20 rounded px-1 mt-1">
                      {guestCount} guests
                    </div>
                  )}
                </div>
                
                {/* VIP indicator */}
                {table.sectionId?.includes('vip') && (
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                )}
              </div>
            );
          })}

          {/* Other venue elements */}
          {layout.levels?.find((l: any) => l.level === viewLevel)?.elements
            ?.filter((el: any) => !['table', 'stage'].includes(el.type))
            ?.map((element: any) => (
              <div
                key={element.id}
                className={`absolute ${
                  element.type === 'bar' ? 'bg-red-600 text-white' :
                  element.type === 'entrance' ? 'bg-green-600 text-white' :
                  element.type === 'aisle' ? 'bg-gray-100 border-dashed border-gray-300' :
                  element.type === 'wall' ? 'bg-gray-600' :
                  'bg-gray-400'
                } flex items-center justify-center text-xs font-bold`}
                style={{
                  left: element.x + 50,
                  top: element.y + 50,
                  width: element.width,
                  height: element.height,
                  border: element.type === 'aisle' ? '1px dashed #D1D5DB' : '1px solid #9CA3AF',
                }}
              >
                {element.properties?.label || element.type.toUpperCase()}
              </div>
            ))}
        </div>

        {/* Continue Button */}
        {selectedTables.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => {
                const totalGuests = Object.values(guestCounts).reduce((sum, count) => sum + count, 0);
                console.log('Proceeding with tables:', selectedTables, 'Total guests:', totalGuests);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Check className="w-5 h-5" />
              <span>
                Continue with {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} 
                ({Object.values(guestCounts).reduce((sum, count) => sum + count, 0)} guests)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSelectionView;
