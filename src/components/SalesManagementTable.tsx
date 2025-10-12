import React, { useState, useMemo } from 'react';
import { OrganizerTicketSalesDTO, SalesManagementFilters, UpdateCustomerDetailsRequest } from '../types/salesManagement';

interface SalesManagementTableProps {
  tickets: OrganizerTicketSalesDTO[];
  filters: SalesManagementFilters;
  onUpdateCustomer: (ticketId: number, customerData: UpdateCustomerDetailsRequest) => Promise<void>;
  onTogglePayment: (ticketId: number, isPaid: boolean) => Promise<void>;
  onCancelTicket: (ticketId: number) => Promise<void>;
  onRestoreTicket: (ticketId: number) => Promise<void>;
  editingTicket: number | null;
  setEditingTicket: (ticketId: number | null) => void;
}

interface EditingData {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
}

const SalesManagementTable: React.FC<SalesManagementTableProps> = ({
  tickets,
  filters,
  onUpdateCustomer,
  onTogglePayment,
  onCancelTicket,
  onRestoreTicket,
  editingTicket,
  setEditingTicket
}) => {
  const [editingData, setEditingData] = useState<EditingData>({
    customerFirstName: '',
    customerLastName: '',
    customerEmail: ''
  });

  // Filter tickets based on search and status filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search filter (name or email)
      const searchMatch = !filters.search || 
        ticket.customerFirstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.customerLastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.customerEmail.toLowerCase().includes(filters.search.toLowerCase());

      // Status filter
      const statusMatch = filters.status === 'all' ||
        (filters.status === 'active' && ticket.status === 'Active') ||
        (filters.status === 'cancelled' && ticket.status === 'Cancelled');

      return searchMatch && statusMatch;
    });
  }, [tickets, filters]);

  const handleEditStart = (ticket: OrganizerTicketSalesDTO) => {
    setEditingTicket(ticket.id);
    setEditingData({
      customerFirstName: ticket.customerFirstName,
      customerLastName: ticket.customerLastName,
      customerEmail: ticket.customerEmail
    });
  };

  const handleEditCancel = () => {
    setEditingTicket(null);
    setEditingData({
      customerFirstName: '',
      customerLastName: '',
      customerEmail: ''
    });
  };

  const handleEditSave = async (ticketId: number) => {
    try {
      await onUpdateCustomer(ticketId, editingData);
      setEditingTicket(null);
    } catch (error) {
      console.error('Error saving customer details:', error);
    }
  };

  const handlePaymentToggle = async (ticketId: number, currentStatus: boolean) => {
    await onTogglePayment(ticketId, !currentStatus);
  };

  const handleCancelWithConfirm = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      await onCancelTicket(ticketId);
    }
  };

  const handleRestoreWithConfirm = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to restore this ticket?')) {
      await onRestoreTicket(ticketId);
    }
  };

  if (filteredTickets.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
        <p className="text-gray-500">
          {filters.search || filters.status !== 'all' 
            ? 'No tickets match your current filters. Try adjusting your search or filter criteria.'
            : 'No organizer tickets have been issued for this event yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-medium text-gray-900">
          Ticket Management ({filteredTickets.length} tickets)
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          Click on customer details to edit. Use checkboxes to mark as paid/unpaid.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '900px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '280px', width: '35%' }}>
                Customer Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '100px' }}>
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '100px' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '80px' }}>
                  #{ticket.id}
                </td>
                <td className="px-6 py-4" style={{ minWidth: '280px' }}>
                  {editingTicket === ticket.id ? (
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm space-y-3" style={{ minWidth: '260px' }}>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={editingData.customerFirstName}
                          onChange={(e) => setEditingData({...editingData, customerFirstName: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editingData.customerLastName}
                          onChange={(e) => setEditingData({...editingData, customerLastName: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Last Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingData.customerEmail}
                          onChange={(e) => setEditingData({...editingData, customerEmail: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Email"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={handleEditCancel}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSave(ticket.id)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                      onClick={() => handleEditStart(ticket)}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {ticket.customerFirstName} {ticket.customerLastName}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {ticket.customerEmail}
                      </div>
                      <div className="text-xs text-blue-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Click to edit
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '100px' }}>
                  ${ticket.ticketPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4" style={{ width: '120px' }}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticket.isPaid}
                      onChange={() => handlePaymentToggle(ticket.id, ticket.isPaid)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`ml-2 text-sm ${ticket.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {ticket.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </label>
                </td>
                <td className="px-6 py-4" style={{ width: '100px' }}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ticket.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium" style={{ width: '120px' }}>
                  {ticket.status === 'Active' ? (
                    <button
                      onClick={() => handleCancelWithConfirm(ticket.id)}
                      className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 hover:bg-red-100 rounded text-xs"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestoreWithConfirm(ticket.id)}
                      className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-50 hover:bg-green-100 rounded text-xs"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesManagementTable;
