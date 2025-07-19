import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookingService, BookingListDTO } from '../services/bookingService';
import SEO from '../components/SEO';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingService.getMyBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Bookings</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchMyBookings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Bookings" 
        description="View and manage your event bookings, tickets, and food orders." 
        keywords={["My Bookings", "Event Tickets", "Order History"]}
      />
      
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        {/* Header */}
        <div className="border-b pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your event bookings, tickets, and food orders.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't made any bookings yet. Start by browsing our events!
            </p>
            <Link
              to="/events"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Booking Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {booking.eventTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking #{booking.id} • {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items Summary */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Items</h4>
                      <div className="text-sm text-gray-600">
                        <p>🎫 {booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''}</p>
                        {booking.foodCount > 0 && (
                          <p>🍕 {booking.foodCount} food item{booking.foodCount !== 1 ? 's' : ''}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {booking.itemCount} total line item{booking.itemCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Customer</h4>
                      <div className="text-sm text-gray-600">
                        <p>{booking.customerName}</p>
                        <p className="text-xs">{booking.customerEmail}</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Total</h4>
                      <div className="text-sm text-gray-600">
                        <p className="text-lg font-bold text-green-600">
                          ${booking.totalAmount.toFixed(2)} {booking.currency}
                        </p>
                        {booking.processingFee > 0 && (
                          <p className="text-xs text-gray-500">
                            +${booking.processingFee.toFixed(2)} processing fee
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/booking/${booking.id}`}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                      {booking.paymentStatus === 'Completed' && booking.status === 'Active' && (
                        <button
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={() => {
                            // TODO: Implement download tickets functionality
                            alert('Download tickets functionality coming soon!');
                          }}
                        >
                          Download Tickets
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                <div className="text-sm text-blue-600">Total Bookings</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.paymentStatus === 'Completed').length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'Pending').length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  ${bookings
                    .filter(b => b.paymentStatus === 'Completed')
                    .reduce((sum, b) => sum + b.totalAmount, 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-purple-600">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;
