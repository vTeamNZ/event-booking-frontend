import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

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

interface DashboardData {
  user: UserProfile;
  organizer: OrganizerProfile;
}

const OrganizerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await authService.getCurrentUserFromAPI();
        setDashboardData(response as DashboardData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
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
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.fullName}</p>
              </div>
              <div className="flex items-center space-x-4">
                {!organizer.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
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
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{organizer.name}</p>
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
                        className="text-sm text-primary hover:text-red-600"
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
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
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
                    <p className="text-3xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">$0</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Your Events</h3>
                    <Link
                      to="/organizer/events"
                      className="text-primary hover:text-red-600 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first event</p>
                    <p className="text-gray-500 text-xs mb-4">Note: New events will require admin approval before they appear to the public</p>
                    <Link
                      to="/organizer/events/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-red-700"
                    >
                      Create Your First Event
                    </Link>
                  </div>
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
