import React from 'react';

interface SeatRowAssignment {
  rowStart: string;
  rowEnd: string;
  maxTickets: number;
}

interface TicketTypeData {
  id?: number;
  type: string;
  price: number;
  description: string;
  sectionIds: number[];
  maxTickets: number;
  seatRows: SeatRowAssignment[];
}

interface Section {
  id: number;
  name: string;
  color: string;
  basePrice: number;
}

interface TicketTypeManagerProps {
  ticketTypes: TicketTypeData[];
  sections: Section[];
  availableRows: string[];
  isVenueWithSeats?: boolean;
  onAddTicketType: () => void;
  onUpdateTicketType: (index: number, field: keyof TicketTypeData, value: any) => void;
  onRemoveTicketType: (index: number) => void;
  onToggleSection: (ticketIndex: number, sectionId: number) => void;
  onAddSeatRow: (ticketIndex: number) => void;
  onUpdateSeatRow: (ticketIndex: number, rowIndex: number, field: keyof SeatRowAssignment, value: any) => void;
  onRemoveSeatRow: (ticketIndex: number, rowIndex: number) => void;
}

const TicketTypeManager: React.FC<TicketTypeManagerProps> = ({
  ticketTypes,
  sections,
  availableRows,
  isVenueWithSeats = true,
  onAddTicketType,
  onUpdateTicketType,
  onRemoveTicketType,
  onToggleSection,
  onAddSeatRow,
  onUpdateSeatRow,
  onRemoveSeatRow
}) => {
  // Debug log for seat row assignments
  console.log('TicketTypeManager - ticketTypes with seatRows:', ticketTypes.map(tt => ({
    type: tt.type,
    seatRows: tt.seatRows
  })));
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Ticket Types</h3>
        <button
          type="button"
          onClick={onAddTicketType}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Add Ticket Type
        </button>
      </div>

      <div className="space-y-4">
        {ticketTypes.map((ticketType, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Ticket Type {index + 1}</h4>
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveTicketType(index)}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  value={ticketType.type}
                  onChange={(e) => onUpdateTicketType(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g., VIP, Standard, Student"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (NZD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketType.price}
                  onChange={(e) => onUpdateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={ticketType.description}
                  onChange={(e) => onUpdateTicketType(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Describe what this ticket type includes..."
                />
              </div>

              {!isVenueWithSeats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Tickets *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ticketType.maxTickets}
                    onChange={(e) => onUpdateTicketType(index, 'maxTickets', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter maximum tickets"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of tickets available for this type
                  </p>
                </div>
              )}
              {isVenueWithSeats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Tickets
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                    {ticketType.maxTickets} (calculated from row assignments)
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Number of tickets is automatically calculated based on row assignments
                  </p>
                </div>
              )}

              {/* Section Assignment - hidden as we now use row assignments */}
              {false && sections.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sections
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sections.map((section) => (
                      <label key={section.id} className="flex items-center cursor-pointer hover:bg-white rounded p-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={ticketType.sectionIds.includes(section.id)}
                          onChange={() => onToggleSection(index, section.id)}
                          className="mr-2"
                        />
                        <div 
                          className="w-3 h-3 rounded mr-1"
                          style={{ backgroundColor: section.color }}
                        ></div>
                        <span className="text-sm">{section.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Seat Row Assignments - Only for venues with seats */}
              {isVenueWithSeats && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Seat Row Assignments
                    </label>
                    <button
                      type="button"
                      onClick={() => onAddSeatRow(index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Row Assignment
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ticketType.seatRows.map((seatRow, rowIndex) => (
                      <div key={rowIndex} className="flex gap-4 items-start p-2 bg-white rounded border">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Starting Row
                          </label>
                          <select
                            value={seatRow.rowStart}
                            onChange={(e) => onUpdateSeatRow(index, rowIndex, 'rowStart', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Select row...</option>
                            {availableRows.map(row => (
                              <option key={row} value={row}>{row}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Ending Row
                          </label>
                          <select
                            value={seatRow.rowEnd}
                            onChange={(e) => onUpdateSeatRow(index, rowIndex, 'rowEnd', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Select row...</option>
                            {availableRows
                              .filter(row => row >= seatRow.rowStart)
                              .map(row => (
                                <option key={row} value={row}>{row}</option>
                              ))
                            }
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveSeatRow(index, rowIndex)}
                          className="text-red-600 hover:text-red-800 mt-6"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {ticketType.seatRows.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No row assignments yet. Click "Add Row Assignment" to assign specific rows to this ticket type.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* General Admission Note - For venues without seats */}
              {!isVenueWithSeats && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">General Admission</h5>
                    <p className="text-xs text-blue-700">
                      This ticket type will provide general admission access without specific seat assignments. 
                      Set the maximum tickets to control how many of this type can be sold.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {ticketTypes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No ticket types added yet.</p>
          <button
            type="button"
            onClick={onAddTicketType}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Ticket Type
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketTypeManager;
