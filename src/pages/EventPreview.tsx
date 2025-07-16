import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  imageUrl: string | null;
  isActive: boolean;
  status: number;
  statusText: string;
  venue?: {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    layoutType: string;
    capacity: number;
  } | null;
  ticketTypes: Array<{
    id: number;
    type: string;
    price: number;
    description: string;
  }>;
  foodItems: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
  }>;
}

const EventPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) {
          setError('No event ID provided');
          return;
        }

        const response = await api.get(`/Events/${id}/preview`);
        setEvent(response.data as Event);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event preview');
        toast.error('Failed to load event preview');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event preview...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <button 
            onClick={() => navigate('/organizer/events')} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const badges = {
      0: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      1: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      2: { color: 'bg-green-100 text-green-800', text: 'Active' },
      3: { color: 'bg-red-100 text-red-800', text: 'Inactive' }
    };

    const badge = badges[event.status as keyof typeof badges] || badges[0];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <>
      <SEO title={`Preview: ${event.title}`} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Preview</h1>
                <p className="text-gray-600">This is how your event will appear to attendees</p>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge()}
                <button
                  onClick={() => navigate('/organizer/events')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Event Image */}
            {event.imageUrl && (
              <div className="w-full h-64 bg-gray-200">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Event Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium">📅 Date:</span>
                    <span className="ml-2">{new Date(event.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">📍 Location:</span>
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">👥 Capacity:</span>
                    <span className="ml-2">{event.capacity} attendees</span>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Venue Information */}
              {event.venue && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Venue Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{event.venue.name}</h3>
                    <p className="text-gray-600 mt-1">{event.venue.description}</p>
                    <p className="text-gray-600 mt-1">{event.venue.address}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span>Layout: {event.venue.layoutType}</span>
                      <span>Capacity: {event.venue.capacity}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Types */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Ticket Options</h2>
                  <div className="grid gap-4">
                    {event.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{ticket.type}</h3>
                            {ticket.description && (
                              <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">${ticket.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food & Beverages */}
              {event.foodItems && event.foodItems.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Food & Beverages</h2>
                  <div className="grid gap-4">
                    {Object.entries(
                      event.foodItems.reduce((acc: Record<string, typeof event.foodItems>, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = [];
                        }
                        acc[item.category].push(item);
                        return acc;
                      }, {})
                    ).map(([category, items]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                {item.description && (
                                  <p className="text-gray-600 text-sm">{item.description}</p>
                                )}
                              </div>
                              <span className="font-bold text-primary">${item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-blue-500 text-xl">ℹ️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Preview Mode</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      This is a preview of your event. {event.status === 0 ? 'Submit for admin review to make it public.' : 'Only you can see this preview until the event is approved.'}
                    </p>
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

export default EventPreview;
