import React, { useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import type { LayoutElement, Section } from './types';

interface TableSelectionViewProps {
  venueLayout: {
    sections: Section[];
    elements: LayoutElement[];
  };
  selectedTables: string[];
  onTableSelect: (tableId: string, guestCount: number) => void;
  maxSelections?: number;
  onError?: (message: string) => void;
}

const TableSelectionView: React.FC<TableSelectionViewProps> = ({
  venueLayout,
  selectedTables,
  onTableSelect,
  maxSelections = 5,
  onError
}) => {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});

  const handleTableClick = (tableId: string) => {
    const table = venueLayout.elements.find(e => e.id === tableId && e.type === 'table');
    if (!table) return;

    if (table.properties.isBlocked) {
      onError?.('This table is not available');
      return;
    }

    if (table.properties.isReserved) {
      onError?.('This table is already reserved');
      return;
    }

    if (selectedTables.includes(tableId)) {
      onTableSelect(tableId, 0); // Will remove the table
      const { [tableId]: _, ...rest } = guestCounts;
      setGuestCounts(rest);
    } else if (selectedTables.length < maxSelections) {
      // Set initial guest count to minimum required or 1
      const initialGuests = table.properties.minimumGuests || 1;
      setGuestCounts({ ...guestCounts, [tableId]: initialGuests });
      onTableSelect(tableId, initialGuests);
    } else {
      onError?.(`You can only select up to ${maxSelections} tables`);
    }
  };

  const handleGuestCountChange = (tableId: string, count: number) => {
    const table = venueLayout.elements.find(e => e.id === tableId && e.type === 'table');
    if (!table) return;

    const capacity = table.properties.capacity || 1;
    const minGuests = table.properties.minimumGuests || 1;

    if (count < minGuests) {
      onError?.(`Minimum ${minGuests} guests required for this table`);
      return;
    }

    if (count > capacity) {
      onError?.(`Maximum ${capacity} guests allowed for this table`);
      return;
    }

    setGuestCounts({ ...guestCounts, [tableId]: count });
    onTableSelect(tableId, count);
  };

  const getTableColor = (table: LayoutElement): string => {
    if (table.properties.isBlocked) return '#cbd5e1';
    if (table.properties.isReserved) return '#ef4444';
    if (selectedTables.includes(table.id)) return '#22c55e';
    if (hoveredTable === table.id) return '#3b82f6';
    
    const section = venueLayout.sections.find(s => s.id === table.sectionId);
    return section?.color || '#e2e8f0';
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Select Your Tables</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{selectedTables.length} of {maxSelections} tables selected</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {venueLayout.sections.map(section => (
            <div
              key={section.id}
              className="px-3 py-1.5 rounded text-sm font-medium"
              style={{ backgroundColor: section.color + '20', color: section.color }}
            >
              {section.name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venueLayout.elements
            .filter(element => element.type === 'table')
            .map(table => (
              <div
                key={table.id}
                className="relative p-4 border rounded-lg hover:border-blue-500 transition-colors"
                style={{ borderColor: getTableColor(table) }}
                onMouseEnter={() => setHoveredTable(table.id)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Table {table.properties.tableNumber}</h4>
                    <p className="text-sm text-gray-600">
                      Capacity: {table.properties.capacity} guests
                    </p>
                  </div>
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={() => handleTableClick(table.id)}
                    disabled={table.properties.isBlocked || table.properties.isReserved}
                  >
                    {selectedTables.includes(table.id) ? (
                      <div className="w-6 h-6 rounded-full bg-green-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </button>
                </div>

                {selectedTables.includes(table.id) && (
                  <div className="flex items-center space-x-2 mt-2">
                    <label className="text-sm font-medium">Guests:</label>
                    <input
                      type="number"
                      min={table.properties.minimumGuests || 1}
                      max={table.properties.capacity || 1}
                      value={guestCounts[table.id] || table.properties.minimumGuests || 1}
                      onChange={(e) => handleGuestCountChange(table.id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#22c55e]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#ef4444]" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#cbd5e1]" />
              <span>Not Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionView;
