import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookingService, BookingDetailDTO } from '../services/bookingService';
import SEO from '../components/SEO';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBookingDetail(parseInt(id));
    }
  }, [id]);

  const fetchBookingDetail = async (bookingId: number) => {
    try {
      setLoading(true);
      const data = await BookingService.getBooking(bookingId);
      setBooking(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching booking detail:', err);
      setError('Failed to load booking details. Please try again.');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Booking</p>
          <p className="mb-4">{error || 'Booking not found'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Go Back
            </button>
            {id && (
              <button
                onClick={() => fetchBookingDetail(parseInt(id))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const formatted = BookingService.formatBookingForDisplay(booking);
  const metadata = BookingService.parseBookingMetadata(booking.metadata);

  return (
    <>
      <SEO 
        title={`Booking #${booking.id} - ${booking.eventTitle}`}
        description={`Booking details for ${booking.eventTitle}`}
        keywords={["Booking Details", "Event Tickets", "Order Information"]}
      />
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        {/* Header */}
        <div className="border-b pb-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Booking #{booking.id}
            </h1>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.paymentStatus)}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <p><strong>Event:</strong> {booking.eventTitle}</p>
              {booking.eventDate && (
                <p><strong>Date:</strong> {new Date(booking.eventDate).toLocaleString()}</p>
              )}
              {booking.eventLocation && (
                <p><strong>Location:</strong> {booking.eventLocation}</p>
              )}
              {booking.organizerName && (
                <p><strong>Organizer:</strong> {booking.organizerName}</p>
              )}
            </div>
            <div>
              <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
              <p><strong>Payment ID:</strong> {booking.paymentIntentId}</p>
              <p><strong>Customer:</strong> {booking.customerFirstName} {booking.customerLastName}</p>
              <p><strong>Email:</strong> {booking.customerEmail}</p>
              {booking.customerMobile && (
                <p><strong>Mobile:</strong> {booking.customerMobile}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-8">
          {/* Tickets */}
          {formatted.tickets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                🎫 Tickets ({formatted.tickets.length})
              </h2>
              <div className="space-y-3">
                {formatted.tickets.map((ticket, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{ticket.name}</h3>
                      <p className="text-sm text-gray-600">
                        {ticket.quantity}x {ticket.unitPrice} each
                      </p>
                      {ticket.details?.description && (
                        <p className="text-xs text-gray-500 mt-1">{ticket.details.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{ticket.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Food Items */}
          {formatted.food.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                🍕 Food & Beverages ({formatted.food.length})
              </h2>
              <div className="space-y-3">
                {formatted.food.map((food, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{food.name}</h3>
                      <p className="text-sm text-gray-600">
                        {food.quantity}x {food.unitPrice} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{food.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Line Items Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              All Line Items ({booking.lineItems.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.itemType === 'Ticket' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.itemType}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          {item.qrCode && (
                            <p className="text-xs text-gray-500">QR: {item.qrCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-8 pt-6 border-t">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${(booking.totalAmount - booking.processingFee).toFixed(2)}</span>
              </div>
              {booking.processingFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Processing Fee</span>
                  <span>${booking.processingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                <span>Total Paid</span>
                <span>${booking.totalAmount.toFixed(2)} {booking.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata (for debugging/admin) */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View Booking Metadata (Technical Details)
              </summary>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-6 border-t flex items-center justify-between">
          <Link
            to="/my-bookings"
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
          >
            <span className="mr-2">←</span> Back to My Bookings
          </Link>

          <div className="flex items-center space-x-3">
            {booking.paymentStatus === 'Completed' && booking.status === 'Active' && (
              <>
                <button
                  className="px-6 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => {
                    // TODO: Implement download tickets functionality
                    alert('Download tickets functionality coming soon!');
                  }}
                >
                  📄 Download Tickets
                </button>
                <button
                  className="px-6 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // TODO: Implement email tickets functionality
                    alert('Email tickets functionality coming soon!');
                  }}
                >
                  📧 Email Tickets
                </button>
              </>
            )}
            <button
              onClick={() => window.print()}
              className="px-6 py-3 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetail;
