import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { api } from '../services/api';
import { afterPayFeeService, AfterPayFeeSettings } from '../services/afterPayFeeService';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalOrganizers: number;
  pendingOrganizers: number;
  verifiedOrganizers: number;
  totalUsers: number;
  totalReservations: number;
  recentEvents: Array<{
    id: number;
    title: string;
    date: string;
    isActive: boolean;
  }>;
}

interface Organizer {
  id: number;
  name: string;
  organizationName: string;
  contactEmail: string;
  phoneNumber: string;
  website: string;
  isVerified: boolean;
  createdAt: string;
  userEmail: string;
  eventsCount: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOrganizers, setPendingOrganizers] = useState<Organizer[]>([]);
  const [afterPaySettings, setAfterPaySettings] = useState<AfterPayFeeSettings | null>(null);
  const [exampleAfterPayFee, setExampleAfterPayFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/admin/dashboard-stats');
      setStats(statsResponse.data as DashboardStats);

      // Fetch pending organizers
      const organizersResponse = await api.get('/admin/organizers?verified=false');
      setPendingOrganizers(organizersResponse.data as Organizer[]);

      // Fetch AfterPay settings
      try {
        const afterPayResponse = await afterPayFeeService.getSettings();
        setAfterPaySettings(afterPayResponse);
        
        // Calculate example fee for $100
        const exampleFee = afterPayFeeService.calculateFeeLocally(100, afterPayResponse);
        setExampleAfterPayFee(exampleFee.afterPayFeeAmount);
      } catch (afterPayError) {
        console.error('Error fetching AfterPay settings:', afterPayError);
        // Don't fail the entire dashboard if AfterPay settings fail
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrganizer = async (organizerId: number) => {
    try {
      await api.put(`/admin/organizers/${organizerId}/verify`, {});
      toast.success('Organizer verified successfully');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      console.error('Error verifying organizer:', error);
      toast.error('Failed to verify organizer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Dashboard - Event Booking"
        description="Admin dashboard for managing events, organizers, and users"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage events, organizers, and system overview</p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Events</dt>
                        <dd className="text-lg font-medium text-green-600">{stats.activeEvents}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Organizers</dt>
                        <dd className="text-lg font-medium text-blue-600">{stats.totalOrganizers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                        <dd className="text-lg font-medium text-yellow-600">{stats.pendingOrganizers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => navigate('/admin/organizers')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Organizers</h3>
              <p className="text-gray-600">View, verify, and manage event organizers</p>
            </button>

            <button
              onClick={() => navigate('/admin/events')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Events</h3>
              <p className="text-gray-600">View and manage all events in the system</p>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Users</h3>
              <p className="text-gray-600">View and manage all system users</p>
            </button>

            <button
              onClick={() => navigate('/admin/venues')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Venues</h3>
              <p className="text-gray-600">Create and configure venue layouts</p>
            </button>
          </div>

          {/* Pending Organizers */}
          {pendingOrganizers.length > 0 && (
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Organizer Verifications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organizer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingOrganizers.map((organizer) => (
                      <tr key={organizer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{organizer.name}</div>
                            {organizer.organizationName && (
                              <div className="text-sm text-gray-500">{organizer.organizationName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{organizer.contactEmail}</div>
                          {organizer.phoneNumber && (
                            <div className="text-sm text-gray-500">{organizer.phoneNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {organizer.eventsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(organizer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleVerifyOrganizer(organizer.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => navigate(`/admin/organizers/${organizer.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Events */}
          {stats?.recentEvents && stats.recentEvents.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AfterPay Settings */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">💳 AfterPay Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Manage AfterPay payment fees and settings</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {afterPaySettings ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className={`text-lg font-semibold ${afterPaySettings.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {afterPaySettings.enabled ? '✅ Enabled' : '❌ Disabled'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Percentage Fee</p>
                      <p className="text-lg font-semibold text-gray-900">{afterPaySettings.percentage}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Fixed Fee</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {afterPaySettings.currency} ${afterPaySettings.fixedAmount}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Example Fee</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ${exampleAfterPayFee.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">For $100 purchase</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-full text-center text-gray-500">
                    <p>Loading AfterPay settings...</p>
                  </div>
                )}
              </div>
              
              {afterPaySettings && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Description:</strong> {afterPaySettings.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Events for Review */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-yellow-200 bg-yellow-100">
              <h3 className="text-lg font-medium text-yellow-900">🔍 Events Pending Review</h3>
              <p className="text-sm text-yellow-700 mt-1">Events submitted by organizers waiting for admin approval. Click "Test Event" to experience the booking process.</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <p>Loading pending events...</p>
                <div className="mt-4">
                  <Link
                    to="/admin/events"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View All Events for Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
