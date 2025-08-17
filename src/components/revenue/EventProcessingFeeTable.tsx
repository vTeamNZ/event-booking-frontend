import React, { useState } from 'react';

interface EventProcessingFeeData {
  eventId: number;
  eventTitle: string;
  organizerName: string;
  organizerId: number;
  eventDate: string | null;
  processingFeeEnabled: boolean;
  processingFeePercentage: number;
  processingFeeFixedAmount: number;
  totalFeesCollected: number;
  bookingCount: number;
  bookingsWithFees: number;
  netEventRevenue: number;
  totalEventRevenue: number;
  averageOrderValue: number;
  feeConversionRate: number;
  lastBookingDate: string | null;
  eventStatus: string;
}

interface AdminRevenueFilter {
  startDate?: string;
  endDate?: string;
  organizerId?: number;
  eventId?: number;
  processingFeeEnabled?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

interface Props {
  events: EventProcessingFeeData[];
  onFilterChange: (filter: Partial<AdminRevenueFilter>) => void;
  currentFilter: AdminRevenueFilter;
}

const EventProcessingFeeTable: React.FC<Props> = ({ events, onFilterChange, currentFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const handleSort = (sortBy: string) => {
    const newDirection = currentFilter.sortBy === sortBy && currentFilter.sortDirection === 'desc' ? 'asc' : 'desc';
    onFilterChange({ sortBy, sortDirection: newDirection });
  };

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (currentFilter.sortBy !== column) return '↕️';
    return currentFilter.sortDirection === 'desc' ? '⬇️' : '⬆️';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            📊 Event Processing Fee Breakdown
          </h3>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events or organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary stats for filtered data */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-500">Total Events</div>
            <div className="text-lg font-semibold text-gray-900">{filteredEvents.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-500">Total Fees Collected</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(filteredEvents.reduce((sum, event) => sum + event.totalFeesCollected, 0))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-500">Total Bookings</div>
            <div className="text-lg font-semibold text-gray-900">
              {filteredEvents.reduce((sum, event) => sum + event.bookingCount, 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('EventTitle')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Event {getSortIcon('EventTitle')}
              </th>
              <th 
                onClick={() => handleSort('OrganizerName')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Organizer {getSortIcon('OrganizerName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee Structure
              </th>
              <th 
                onClick={() => handleSort('TotalFeesCollected')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Fees Collected {getSortIcon('TotalFeesCollected')}
              </th>
              <th 
                onClick={() => handleSort('BookingCount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Bookings {getSortIcon('BookingCount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Rate
              </th>
              <th 
                onClick={() => handleSort('EventDate')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Event Date {getSortIcon('EventDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No events found matching your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.eventId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.eventTitle}</div>
                    <div className="text-sm text-gray-500">ID: {event.eventId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.organizerName}</div>
                    <div className="text-sm text-gray-500">ID: {event.organizerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.processingFeePercentage}% + {formatCurrency(event.processingFeeFixedAmount)}
                    </div>
                    <div className={`text-sm ${event.processingFeeEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {event.processingFeeEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(event.totalFeesCollected)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Net: {formatCurrency(event.netEventRevenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.bookingCount} total
                    </div>
                    <div className="text-sm text-green-600">
                      {event.bookingsWithFees} with fees
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.feeConversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: {formatCurrency(event.averageOrderValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last booking: {formatDate(event.lastBookingDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(event.eventStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table footer with pagination info */}
      {filteredEvents.length > 0 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="ml-1">
                  matching "{searchTerm}"
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Total Revenue: {formatCurrency(filteredEvents.reduce((sum, event) => sum + event.totalFeesCollected, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventProcessingFeeTable;
