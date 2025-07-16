import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface GeneralAdmissionProps {
  eventId: number;
  onTicketSelect: (ticketTypeId: number, quantity: number) => void;
  selectedTickets: { [ticketTypeId: number]: number };
}

interface TicketType {
  id: number;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  soldCount: number;
  isActive: boolean;
  maxPerOrder: number;
}

interface GeneralAdmissionData {
  ticketTypes: TicketType[];
  eventTitle: string;
  eventDate: string;
  totalCapacity: number;
  totalSold: number;
}

export const GeneralAdmissionLayout: React.FC<GeneralAdmissionProps> = ({
  eventId,
  onTicketSelect,
  selectedTickets
}) => {
  const [data, setData] = useState<GeneralAdmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tickettypes/event/${eventId}`);
        // Transform the response to match our expected format
        const ticketTypes = response.data as TicketType[];
        const transformedData: GeneralAdmissionData = {
          ticketTypes,
          eventTitle: 'Event', // We'll get this from another endpoint if needed
          eventDate: new Date().toISOString(),
          totalCapacity: ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0),
          totalSold: ticketTypes.reduce((sum, tt) => sum + tt.soldCount, 0)
        };
        setData(transformedData);
      } catch (err: any) {
        setError('Failed to load ticket types');
        toast.error('Failed to load ticket types');
      } finally {
        setLoading(false);
      }
    };

    loadTicketTypes();
  }, [eventId]);

  const handleQuantityChange = (ticketTypeId: number, quantity: number) => {
    const ticketType = data?.ticketTypes.find(tt => tt.id === ticketTypeId);
    if (!ticketType) return;

    // Validate quantity limits
    const maxAllowed = Math.min(
      ticketType.maxPerOrder,
      ticketType.capacity - ticketType.soldCount
    );

    if (quantity < 0) quantity = 0;
    if (quantity > maxAllowed) quantity = maxAllowed;

    onTicketSelect(ticketTypeId, quantity);
  };

  const getAvailableCount = (ticketType: TicketType) => {
    return ticketType.capacity - ticketType.soldCount;
  };

  const getTotalSelected = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!data) return 0;
    
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = data.ticketTypes.find(tt => tt.id === parseInt(ticketTypeId));
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading ticket types...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error || 'Failed to load ticket types'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="general-admission">
      {/* Event Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{data.eventTitle}</h2>
        <p className="text-gray-600">
          {new Date(data.eventDate).toLocaleDateString('en-NZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <span className="mr-4">
            Available: {data.totalCapacity - data.totalSold} / {data.totalCapacity}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${((data.totalCapacity - data.totalSold) / data.totalCapacity) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Select Tickets</h3>
        
        {data.ticketTypes.filter(tt => tt.isActive).map((ticketType) => {
          const availableCount = getAvailableCount(ticketType);
          const selectedQuantity = selectedTickets[ticketType.id] || 0;
          const maxQuantity = Math.min(ticketType.maxPerOrder, availableCount);
          
          return (
            <div key={ticketType.id} className="ticket-type-card border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{ticketType.name}</h4>
                  {ticketType.description && (
                    <p className="text-sm text-gray-600 mt-1">{ticketType.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="mr-4">Available: {availableCount}</span>
                    <span>Max per order: {ticketType.maxPerOrder}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-gray-900">
                    ${ticketType.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">per ticket</div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-3">Quantity:</span>
                  <div className="flex items-center border rounded">
                    <button
                      type="button"
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(ticketType.id, selectedQuantity - 1)}
                      disabled={selectedQuantity <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={maxQuantity}
                      value={selectedQuantity}
                      onChange={(e) => handleQuantityChange(ticketType.id, parseInt(e.target.value) || 0)}
                      className="w-16 py-1 text-center border-l border-r focus:outline-none"
                    />
                    <button
                      type="button"
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(ticketType.id, selectedQuantity + 1)}
                      disabled={selectedQuantity >= maxQuantity || availableCount <= 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                {selectedQuantity > 0 && (
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${(ticketType.price * selectedQuantity).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedQuantity} × ${ticketType.price.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability Warning */}
              {availableCount <= 10 && availableCount > 0 && (
                <div className="mt-2 text-sm text-orange-600">
                  ⚠️ Only {availableCount} tickets remaining!
                </div>
              )}
              
              {availableCount === 0 && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                  ❌ Sold Out
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalSelected() > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
              if (quantity === 0) return null;
              const ticketType = data.ticketTypes.find(tt => tt.id === parseInt(ticketTypeId));
              if (!ticketType) return null;
              
              return (
                <div key={ticketTypeId} className="flex justify-between text-blue-800">
                  <span>{quantity} × {ticketType.name}</span>
                  <span>${(ticketType.price * quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between font-medium text-blue-900">
            <span>Total ({getTotalSelected()} tickets)</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium text-gray-900 mb-2">Important Information</h4>
        <ul className="space-y-1">
          <li>• This is general admission - no assigned seating</li>
          <li>• Tickets are non-refundable</li>
          <li>• Please arrive early to secure your preferred spot</li>
          <li>• Valid ID may be required for entry</li>
        </ul>
      </div>
    </div>
  );
};
