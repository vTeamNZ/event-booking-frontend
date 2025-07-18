import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { createEventSlug } from '../utils/slugUtils';

interface OrganizerProfile {
  id: number;
  name: string;
  organizationName?: string;
  phoneNumber?: string;
  website?: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roles: string[];
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  isActive: boolean;
  status?: number; // 0=Draft, 1=Pending, 2=Active, 3=Inactive
  statusText?: string;
}

interface DashboardData {
  user: UserProfile;
  organizer: OrganizerProfile;
}

const OrganizerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get status badge
  const getStatusBadge = (event: Event) => {
    const status = event.status ?? (event.isActive ? 2 : 3); // Default to Active/Inactive based on isActive
    
    const badges = {
      0: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      1: { color: 'bg-warning/20 text-warning', text: 'Pending Review' },
      2: { color: 'bg-success/20 text-success', text: 'Active' },
      3: { color: 'bg-error/20 text-error', text: 'Inactive' }
    };

    const badge = badges[status as keyof typeof badges] || badges[0];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Helper function to get status actions
  const getStatusActions = (event: Event) => {
    const status = event.status ?? (event.isActive ? 2 : 3);

    const handleSubmitForReview = async () => {
      try {
        await api.put(`/Events/${event.id}/submit-for-review`);
        toast.success('Event submitted for review successfully');
        // Refresh events
        const eventsResponse = await api.get<Event[]>('/Events/by-organizer');
        setEvents(eventsResponse.data || []);
      } catch (error) {
        toast.error('Failed to submit event for review');
      }
    };

    const handleReturnToDraft = async () => {
      try {
        await api.put(`/Events/${event.id}/return-to-draft`);
        toast.success('Event returned to draft successfully');
        // Refresh events
        const eventsResponse = await api.get<Event[]>('/Events/by-organizer');
        setEvents(eventsResponse.data || []);
      } catch (error) {
        toast.error('Failed to return event to draft');
      }
    };

    switch (status) {
      case 0: // Draft
        return (
          <button
            onClick={handleSubmitForReview}
            className="bg-info hover:bg-info/80 text-black px-3 py-1 rounded-md text-sm font-medium"
          >
            Submit for Review
          </button>
        );
      case 1: // Pending
        return (
          <button
            onClick={handleReturnToDraft}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Return to Draft
          </button>
        );
      case 2: // Active
      case 3: // Inactive
        return (
          <button
            onClick={handleReturnToDraft}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Move to Draft for Testing
          </button>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // First get the user data
        const dashboardResponse = await authService.getCurrentUserFromAPI() as DashboardData;
        if (!dashboardResponse.organizer) {
          setError('You need to complete your organizer profile. Please contact support.');
          toast.error('No organizer profile found');
          setLoading(false);
          return;
        }
        
        setDashboardData(dashboardResponse as DashboardData);
        
        try {
          // Then get the events data
          const eventsResponse = await api.get<Event[]>('/Events/by-organizer');
          setEvents(eventsResponse.data || []);
        } catch (eventErr: any) {
          const errorMessage = eventErr.response?.data?.message;
          if (errorMessage === 'No organizer profile found. Please complete your organizer registration.') {
            setError('You need to complete your organizer profile to manage events.');
          } else {
            toast.error(errorMessage || 'Failed to load events');
          }
          setEvents([]);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error || 'Failed to load dashboard'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, organizer } = dashboardData;

  return (
    <>
      <SEO 
        title="Organizer Dashboard" 
        description="Manage your events, view analytics, and organize bookings from your organizer dashboard." 
        keywords={["Organizer Dashboard", "Event Management", "Event Analytics"]}
      />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 shadow border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.fullName}</p>
              </div>
              <div className="flex items-center space-x-4">
                {!organizer.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/20 text-warning">
                    Pending Verification
                  </span>
                )}
                <div className="flex flex-col items-end">
                  <Link
                    to="/organizer/events/create"
                    className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Event
                  </Link>
                  <span className="text-xs text-gray-500 mt-1">Events require admin approval before activation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Name</label>
                    <p className="text-sm text-white">{organizer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  {organizer.organizationName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization</label>
                      <p className="text-sm text-gray-900">{organizer.organizationName}</p>
                    </div>
                  )}
                  {organizer.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{organizer.phoneNumber}</p>
                    </div>
                  )}
                  {organizer.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <a 
                        href={organizer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-error"
                      >
                        {organizer.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-sm text-gray-900">
                      {new Date(organizer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      organizer.isVerified 
                        ? 'bg-success/20 text-success' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {organizer.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    to="/organizer/profile/edit"
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium text-center block"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">0</p>
                    <p className="text-sm text-gray-600">Active Events</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">0</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">$0</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </div>

              {/* Test Your Draft Events Section */}
              {events.filter(event => (event.status ?? (event.isActive ? 2 : 3)) === 0).length > 0 && (
                <div className="bg-info/10 border border-info/20 rounded-lg shadow overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-info/20 bg-info/20">
                    <h3 className="text-lg font-medium text-info">🧪 Test Your Draft Events</h3>
                    <p className="text-sm text-info/80 mt-1">Test the complete booking process for your draft events before submitting for approval.</p>
                  </div>
                  <div className="divide-y divide-info/20">
                    {events
                      .filter(event => (event.status ?? (event.isActive ? 2 : 3)) === 0)
                      .map((event) => (
                        <div key={`draft-${event.id}`} className="p-6 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                              <div className="mt-1 text-sm text-gray-600">
                                <p>Location: {event.location}</p>
                                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Draft
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Link
                                to={`/event/${createEventSlug(event.title)}/tickets`}
                                className="bg-success hover:bg-success/80 text-black px-4 py-2 rounded-md text-sm font-medium flex items-center"
                              >
                                🎫 Test Full Booking Process
                              </Link>
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/event/${event.id}/preview`}
                                  className="bg-info hover:bg-info/80 text-black px-3 py-1 rounded-md text-sm font-medium"
                                >
                                  Preview
                                </Link>
                                <Link
                                  to={`/event/${event.id}/manage-food`}
                                  className="bg-primary hover:bg-primary-dark text-black px-3 py-1 rounded-md text-sm font-medium"
                                >
                                  Manage Food
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Events List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Events</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {events.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No events found. Create your first event to get started!
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                            <div className="mt-1 text-sm text-gray-600">
                              <p>Location: {event.location}</p>
                              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(event)}
                              {getStatusActions(event)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/event/${event.id}/manage-food`}
                                className="bg-success hover:bg-success/80 text-black px-3 py-1 rounded-md text-sm font-medium"
                              >
                                Manage Food
                              </Link>
                              <Link
                                to={`/event/${event.id}/edit`}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm font-medium"
                              >
                                Edit Event
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;
