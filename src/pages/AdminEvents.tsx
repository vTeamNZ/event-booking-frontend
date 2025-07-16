import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  imageUrl?: string;
  isActive: boolean;
  status?: number; // 0=Draft, 1=Pending, 2=Active, 3=Inactive
  statusText?: string;
  seatSelectionMode: number;
  organizer?: {
    id: number;
    name: string;
    isVerified: boolean;
  } | null;
  reservationsCount: number;
  processingFeePercentage?: number;
  processingFeeFixedAmount?: number;
  processingFeeEnabled?: boolean;
}

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProcessingFee, setEditingProcessingFee] = useState<Event | null>(null);
  const [processingFeeForm, setProcessingFeeForm] = useState({
    percentage: 0,
    fixedAmount: 0,
    enabled: false
  });

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const activeParam = filter === 'all' ? '' : `?active=${filter === 'active'}`;
      const response = await api.get(`/Admin/events${activeParam}`);
      setEvents(response.data as Event[]);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEventStatus = async (eventId: number) => {
    try {
      await api.put(`/Admin/events/${eventId}/toggle-status`);
      toast.success('Event status updated successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleEditProcessingFee = (event: Event) => {
    setEditingProcessingFee(event);
    setProcessingFeeForm({
      percentage: event.processingFeePercentage || 0,
      fixedAmount: event.processingFeeFixedAmount || 0,
      enabled: event.processingFeeEnabled || false
    });
  };

  const handleUpdateProcessingFee = async () => {
    if (!editingProcessingFee) return;

    try {
      await api.put(`/Admin/events/${editingProcessingFee.id}/processing-fee`, {
        processingFeePercentage: processingFeeForm.percentage,
        processingFeeFixedAmount: processingFeeForm.fixedAmount,
        processingFeeEnabled: processingFeeForm.enabled
      });
      toast.success('Processing fee updated successfully');
      setEditingProcessingFee(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Error updating processing fee:', error);
      toast.error('Failed to update processing fee');
    }
  };

  const calculateProcessingFeeExample = () => {
    const baseAmount = 50; // Example $50 ticket
    const percentage = processingFeeForm.percentage / 100;
    const percentageFee = baseAmount * percentage;
    const totalFee = percentageFee + processingFeeForm.fixedAmount;
    return {
      percentageFee: percentageFee.toFixed(2),
      fixedFee: processingFeeForm.fixedAmount.toFixed(2),
      totalFee: totalFee.toFixed(2),
      totalAmount: (baseAmount + totalFee).toFixed(2)
    };
  };

  const getSeatSelectionModeLabel = (mode: number) => {
    switch (mode) {
      case 1: return 'Event Hall Seating';
      case 2: return 'Table Seating';
      case 3: return 'General Admission';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (event: Event) => {
    const status = event.status ?? (event.isActive ? 2 : 3); // Default to Active/Inactive based on isActive
    
    const badges = {
      0: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      1: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      2: { color: 'bg-green-100 text-green-800', text: 'Active' },
      3: { color: 'bg-red-100 text-red-800', text: 'Inactive' }
    };

    const badge = badges[status as keyof typeof badges] || badges[1];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getActionButtonText = (event: Event) => {
    const status = event.status ?? (event.isActive ? 2 : 3);
    
    switch (status) {
      case 1: // Pending
        return 'Approve';
      case 2: // Active
        return 'Deactivate';
      case 3: // Inactive
        return 'Reactivate';
      default:
        return 'Activate';
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Manage Events - Admin"
        description="Admin panel for managing all events"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
                <p className="mt-2 text-gray-600">View and manage all events in the system</p>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Filter Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter('inactive')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'inactive'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Inactive
                  </button>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price & Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processing Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={event.imageUrl}
                                alt={event.title}
                              />
                            </div>
                          )}
                          <div className={event.imageUrl ? "ml-4" : ""}>
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">
                              {getSeatSelectionModeLabel(event.seatSelectionMode)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {event.organizer ? event.organizer.name : 'No Organizer'}
                          </div>
                          {event.organizer && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              event.organizer.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.organizer.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleTimeString()}
                          </div>
                          <div className="text-sm text-gray-500">{event.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">${event.price}</div>
                          <div className="text-sm text-gray-500">{event.capacity} capacity</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {event.processingFeeEnabled ? (
                            <>
                              <div className="text-sm text-gray-900">
                                {event.processingFeePercentage?.toFixed(2) || 0}% + ${event.processingFeeFixedAmount?.toFixed(2) || 0}
                              </div>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Enabled
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.reservationsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(event)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleEventStatus(event.id)}
                            className={`${
                              event.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {getActionButtonText(event)}
                          </button>
                          <button
                            onClick={() => handleEditProcessingFee(event)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Configure Fee
                          </button>
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No events found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processing Fee Configuration Modal */}
      {editingProcessingFee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Configure Processing Fee - {editingProcessingFee.title}
              </h3>
              <button
                onClick={() => setEditingProcessingFee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable Processing Fee
                </label>
                <button
                  onClick={() => setProcessingFeeForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    processingFeeForm.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      processingFeeForm.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {processingFeeForm.enabled && (
                <>
                  {/* Percentage Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentage Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={processingFeeForm.percentage}
                      onChange={(e) => setProcessingFeeForm(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 2.7"
                    />
                  </div>

                  {/* Fixed Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={processingFeeForm.fixedAmount}
                      onChange={(e) => setProcessingFeeForm(prev => ({ ...prev, fixedAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 0.40"
                    />
                  </div>

                  {/* Example Calculation */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Example (for $50 ticket):</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Percentage fee ({processingFeeForm.percentage}%): ${calculateProcessingFeeExample().percentageFee}</div>
                      <div>Fixed fee: ${calculateProcessingFeeExample().fixedFee}</div>
                      <div className="font-medium">Total processing fee: ${calculateProcessingFeeExample().totalFee}</div>
                      <div className="font-medium">Customer pays: ${calculateProcessingFeeExample().totalAmount}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingProcessingFee(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProcessingFee}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEvents;
