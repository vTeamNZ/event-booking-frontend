import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizerSalesService, OrganizerDashboardSummary, EventSalesDetail } from '../services/organizerSalesService';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const OrganizerSalesDashboard: React.FC = () => {
  const [summary, setSummary] = useState<OrganizerDashboardSummary | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventSalesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await organizerSalesService.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Error loading sales summary:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load sales data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetail = async (eventId: number) => {
    try {
      setDetailLoading(true);
      const data = await organizerSalesService.getEventSalesDetail(eventId);
      setSelectedEventDetail(data);
    } catch (err: any) {
      console.error('Error loading event detail:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load event detail';
      toast.error(errorMessage);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load sales data'}</p>
          <button
            onClick={loadSummary}
            className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
        title="Sales Dashboard | Organizer" 
        description="View your event ticket sales, revenue, and performance analytics." 
        keywords={["Sales Dashboard", "Event Revenue", "Ticket Sales", "Analytics"]}
      />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 shadow border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Sales Dashboard</h1>
                <p className="text-gray-300">Track your event performance and revenue</p>
              </div>
              <Link
                to="/organizer/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Events</h3>
                <p className="text-3xl font-bold text-blue-600">{summary.totalEvents}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tickets Sold</h3>
                <p className="text-3xl font-bold text-green-600">{summary.totalTicketsSold.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Net Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {organizerSalesService.formatCurrency(summary.totalNetRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Events List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Event Performance</h3>
                <p className="text-sm text-gray-600">Click on an event to see detailed breakdown</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {summary.events.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No events found. Create your first event to see sales data.
                  </div>
                ) : (
                  summary.events.map((event) => (
                    <div
                      key={event.eventId}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => loadEventDetail(event.eventId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-gray-900 truncate">
                            {event.eventTitle}
                          </h4>
                          <div className="mt-1 text-sm text-gray-600">
                            <p>{organizerSalesService.formatDate(event.eventDate)}</p>
                            <div className="flex items-center mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                organizerSalesService.getStatusBadgeClass(event.status)
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {event.totalTicketsSold} tickets
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            {organizerSalesService.formatCurrency(event.totalNetRevenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Detail */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedEventDetail ? 'Event Details' : 'Select an Event'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEventDetail 
                    ? 'Ticket type breakdown and revenue analysis' 
                    : 'Click on an event to view detailed sales information'
                  }
                </p>
              </div>
              <div className="p-6">
                {detailLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading event details...</p>
                  </div>
                ) : selectedEventDetail ? (
                  <div className="space-y-6">
                    {/* Event Info */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedEventDetail.eventTitle}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {organizerSalesService.formatDate(selectedEventDetail.eventDate)}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {selectedEventDetail.eventLocation || 'TBA'}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            organizerSalesService.getStatusBadgeClass(selectedEventDetail.status)
                          }`}>
                            {selectedEventDetail.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Capacity:</span> {selectedEventDetail.totalCapacity || 'Unlimited'}
                        </div>
                      </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Revenue Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tickets Sold:</span>
                          <span className="font-medium">{selectedEventDetail.totalTicketsSold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Revenue:</span>
                          <span className="font-medium">{organizerSalesService.formatCurrency(selectedEventDetail.totalGrossRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Processing Fees:</span>
                          <span className="font-medium">-{organizerSalesService.formatCurrency(selectedEventDetail.totalProcessingFees)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-semibold pt-2 border-t border-gray-200">
                          <span>Net Revenue:</span>
                          <span>{organizerSalesService.formatCurrency(selectedEventDetail.totalNetRevenue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Type Breakdown */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Ticket Type Breakdown</h5>
                      {selectedEventDetail.ticketSales.length === 0 ? (
                        <p className="text-gray-500 text-sm">No ticket sales yet</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedEventDetail.ticketSales.map((ticket) => (
                            <div key={ticket.ticketTypeId} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h6 className="font-medium text-gray-900">{ticket.ticketTypeName}</h6>
                                  <p className="text-sm text-gray-600">
                                    {organizerSalesService.formatCurrency(ticket.ticketPrice)} each
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{ticket.ticketsSold} sold</p>
                                  <p className="text-sm text-green-600 font-medium">
                                    {organizerSalesService.formatCurrency(ticket.netRevenue)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Gross: {organizerSalesService.formatCurrency(ticket.grossRevenue)} | 
                                Net: {organizerSalesService.formatCurrency(ticket.netRevenue)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select an event from the list to view detailed sales information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerSalesDashboard;
