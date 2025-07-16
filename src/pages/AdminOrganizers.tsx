import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Organizer {
  id: number;
  name: string;
  organizationName: string;
  contactEmail: string;
  phoneNumber: string;
  website: string;
  facebookUrl: string;
  youtubeUrl: string;
  isVerified: boolean;
  createdAt: string;
  userEmail: string;
  eventsCount: number;
}

const AdminOrganizers: React.FC = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrganizers();
  }, [filter]);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const verifiedParam = filter === 'all' ? '' : `?verified=${filter === 'verified'}`;
      const response = await api.get(`/admin/organizers${verifiedParam}`);
      setOrganizers(response.data as Organizer[]);
    } catch (error: any) {
      console.error('Error fetching organizers:', error);
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrganizer = async (organizerId: number) => {
    try {
      await api.put(`/admin/organizers/${organizerId}/verify`, {});
      toast.success('Organizer verified successfully');
      fetchOrganizers();
    } catch (error: any) {
      console.error('Error verifying organizer:', error);
      toast.error('Failed to verify organizer');
    }
  };

  const handleUnverifyOrganizer = async (organizerId: number) => {
    if (window.confirm('Are you sure you want to remove verification from this organizer?')) {
      try {
        await api.put(`/admin/organizers/${organizerId}/unverify`);
        toast.success('Organizer verification removed');
        fetchOrganizers();
      } catch (error: any) {
        console.error('Error unverifying organizer:', error);
        toast.error('Failed to remove verification');
      }
    }
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Manage Organizers - Admin"
        description="Admin panel for managing event organizers"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Organizers</h1>
                <p className="mt-2 text-gray-600">View and manage all event organizers</p>
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
                    All ({organizers.length})
                  </button>
                  <button
                    onClick={() => setFilter('verified')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'verified'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending
                  </button>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search organizers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organizers Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizer Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganizers.map((organizer) => (
                    <tr key={organizer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{organizer.name}</div>
                          {organizer.organizationName && (
                            <div className="text-sm text-gray-500">{organizer.organizationName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{organizer.contactEmail}</div>
                          <div className="text-sm text-gray-500">{organizer.userEmail}</div>
                          {organizer.phoneNumber && (
                            <div className="text-sm text-gray-500">{organizer.phoneNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          organizer.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {organizer.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {organizer.eventsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(organizer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!organizer.isVerified ? (
                            <button
                              onClick={() => handleVerifyOrganizer(organizer.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Verify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnverifyOrganizer(organizer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Unverify
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/organizers/${organizer.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredOrganizers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No organizers found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrganizers;
