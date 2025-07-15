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
  seatSelectionMode: number;
  organizer?: {
    id: number;
    name: string;
    isVerified: boolean;
  } | null;
  reservationsCount: number;
}

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const activeParam = filter === 'all' ? '' : `?active=${filter === 'active'}`;
      const response = await api.get(`/api/admin/events${activeParam}`);
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
      await api.put(`/api/admin/events/${eventId}/toggle-status`);
      toast.success('Event status updated successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const getSeatSelectionModeLabel = (mode: number) => {
    switch (mode) {
      case 1: return 'Event Hall Seating';
      case 2: return 'Table Seating';
      case 3: return 'General Admission';
      default: return 'Unknown';
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.reservationsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
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
                            {event.isActive ? 'Deactivate' : 'Activate'}
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
    </>
  );
};

export default AdminEvents;
