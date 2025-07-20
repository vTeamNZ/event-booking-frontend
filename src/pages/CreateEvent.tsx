import React, { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { createTicketType, createTicketTypesBulk } from '../services/eventService';
import { useVenues } from '../hooks/useVenues';
import { Venue } from '../types/seatSelection';
import { TicketTypeData, SeatRowAssignment } from '../types/ticketTypes';
import { getTicketTypeName, getTicketTypeColor } from '../utils/ticketTypeUtils';
import { createEventSlug } from '../utils/slugUtils';
import VenueLayoutPreview from '../components/VenueLayoutPreview';
import TicketTypeManager from '../components/TicketTypeManager';
import HelpTooltip from '../components/HelpTooltip';

interface EventFormValues {
  title: string;
  description: string;
  date: string;
  venueId: number;
  capacity: number;
  price: number;
  image?: File;
  seatSelectionMode: string;
}

const EventCreateSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .matches(
      /^[a-zA-Z0-9\s]+$/,
      'Title can only contain letters, numbers, and spaces'
    )
    .test('no-multiple-spaces', 'Multiple consecutive spaces are not allowed', value => 
      value ? !/\s{2,}/.test(value) : true
    )
    .required('Event title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Event description is required'),
  date: Yup.date()
    .min(new Date(), 'Event date must be in the future')
    .required('Event date is required'),
  venueId: Yup.number()
    .min(1, 'Please select a venue')
    .required('Venue is required'),
  capacity: Yup.number()
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000')
    .required('Event capacity is required'),
  price: Yup.number()
    .min(0, 'Price cannot be negative'),
  seatSelectionMode: Yup.string()
    .oneOf(['1', '3'], 'Invalid seat selection mode')
    .required('Seat selection mode is required'),
  image: Yup.mixed()
    .test('fileSize', 'Image file size cannot exceed 5MB', function(value) {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB limit
    })
    .test('fileType', 'Invalid image format. Allowed formats: JPG, JPEG, PNG, GIF, WEBP', function(value) {
      if (!value || !(value instanceof File)) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return allowedTypes.includes(value.type);
    }),
});

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { venues, loading: loadingVenues } = useVenues();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [venueLayout, setVenueLayout] = useState<any>(null);
  const [isVenueWithSeats, setIsVenueWithSeats] = useState<boolean>(true);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([
    {
      type: 'Standard',
      name: 'Standard',
      price: 50,
      description: 'Standard admission',
      maxTickets: 100,
      seatRows: [],
      color: '#4B5563'
    }
  ]);

  // Generate available rows based on venue configuration
  const availableRows = useMemo(() => {
    if (!selectedVenue) return [];
    
    const rows: string[] = [];
    const rowCount = selectedVenue.numberOfRows || 10;
    
    for (let i = 0; i < rowCount; i++) {
      rows.push(String.fromCharCode(65 + i));
    }
    
    return rows;
  }, [selectedVenue]);
  const [loadingVenueLayout, setLoadingVenueLayout] = useState(false);

  // Load venue layout when venue is selected
  const loadVenueLayout = async (venueId: number) => {
    if (venueId === 0) {
      setVenueLayout(null);
      setSelectedVenue(null);
      setIsVenueWithSeats(true);
      return;
    }

    setLoadingVenueLayout(true);
    try {
      // Get venue details
      const venueResponse = await api.get(`/venues/${venueId}`);
      const venue = venueResponse.data as any;
      setSelectedVenue(venue);

      // Determine if venue has seat allocation based on layout type
      const venueHasSeats = venue.layoutType === 'Allocated Seating';
      setIsVenueWithSeats(venueHasSeats);

      // Only load layout for venues with seats
      if (venueHasSeats) {
        // Set seat selection mode to Event Hall for venues with allocated seating
        formik.setFieldValue('seatSelectionMode', '1');
        
        // Try to get existing layout or create a basic one
        const layoutData = venue.layoutData ? 
          JSON.parse(venue.layoutData) : 
          generateBasicLayout(venue);
        
        setVenueLayout(layoutData);
        // For venues with seats, initialize default ticket types if none exist
        if (ticketTypes.length === 0) {
          setTicketTypes([
            {
              type: 'VIP',
              name: 'VIP', // Add name field synchronized with type
              price: 100,
              description: 'VIP seating with best view',
              maxTickets: 0,
              seatRows: [],
              color: '#DC2626'
            },
            {
              type: 'Premium',
              name: 'Premium', // Add name field synchronized with type
              price: 75,
              description: 'Premium seating with great view',
              maxTickets: 0,
              seatRows: [],
              color: '#2563EB'
            },
            {
              type: 'Standard',
              name: 'Standard', // Add name field synchronized with type
              price: 50,
              description: 'Standard seating',
              maxTickets: 0,
              seatRows: [],
              color: '#4B5563'
            }
          ]);
        }
      } else {
        // For venues without seats, clear layout data
        setVenueLayout(null);
        
        // Set seat selection mode to General Admission for venues without seats
        formik.setFieldValue('seatSelectionMode', '3');
        
        // Reset ticket types to be more appropriate for general admission
        setTicketTypes([
          {
            type: 'General Admission',
            name: 'General Admission', // Add name field synchronized with type
            price: 50,
            description: 'Standard admission ticket',
            maxTickets: selectedVenue?.capacity || 100,
            seatRows: [],
            color: '#4B5563'
          }
        ]);
      }

    } catch (error) {
      console.error('Error loading venue layout:', error);
      toast.error('Failed to load venue layout');
    } finally {
      setLoadingVenueLayout(false);
    }
  };

  // Generate basic layout for venues without saved layout
  const generateBasicLayout = (venue: any) => {
    const rows = venue.numberOfRows || 10;
    const seatsPerRow = venue.seatsPerRow || 12;
    
    return {
      venue: {
        width: venue.width || 800,
        height: venue.height || 600
      },
      rows: rows,
      seatsPerRow: seatsPerRow,
      seats: generateBasicSeats(rows, seatsPerRow),
      sections: []
    };
  };

  const generateBasicSeats = (rows: number, seatsPerRow: number) => {
    const seats = [];
    for (let row = 0; row < rows; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        seats.push({
          id: `${row}-${seat}`,
          row: String.fromCharCode(65 + row),
          number: seat + 1,
          x: seat * 35 + 50,
          y: row * 40 + 100
        });
      }
    }
    return seats;
  };

  // Helper function to generate a stable color from a string (ticket type name or index)
  const getStableColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Ticket type management functions
  const addTicketType = () => {
    // Generate a unique color based on the current number of ticket types
    const color = getStableColor(`ticket-${ticketTypes.length + 1}`);
    
    setTicketTypes([...ticketTypes, {
      type: '',
      name: '',  // Add name field synchronized with type
      price: 0,
      description: '',
      maxTickets: 0,
      seatRows: [],
      color
    }]);
  };

  const updateTicketType = (index: number, field: keyof TicketTypeData, value: any) => {
    const updated = ticketTypes.map((ticket, i) => {
      if (i === index) {
        const updatedTicket = { ...ticket, [field]: value };
        
        // Synchronize type and name fields when either is updated
        if (field === 'type') {
          updatedTicket.name = value;
        } else if (field === 'name') {
          updatedTicket.type = value;
        }
        
        return updatedTicket;
      }
      return ticket;
    });
    setTicketTypes(updated);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const addSeatRow = (ticketIndex: number) => {
    console.log('addSeatRow called for ticket index:', ticketIndex);
    const updated = ticketTypes.map((ticket, i) => {
      if (i === ticketIndex) {
        return {
          ...ticket,
          seatRows: [
            ...ticket.seatRows,
            { rowStart: '', rowEnd: '', maxTickets: 0 }
          ]
        };
      }
      return ticket;
    });
    console.log('Updated ticket types after addSeatRow:', updated);
    setTicketTypes(updated);
  };

  const updateSeatRow = (
    ticketIndex: number,
    rowIndex: number,
    field: keyof SeatRowAssignment,
    value: any
  ) => {
    console.log('updateSeatRow called:', { ticketIndex, rowIndex, field, value });
    const updated = ticketTypes.map((ticket, i) => {
      if (i === ticketIndex) {
        const seatRows = ticket.seatRows.map((row, j) => {
          if (j === rowIndex) {
            // If updating rowStart, reset rowEnd if it's now less than rowStart
            if (field === 'rowStart' && row.rowEnd && value > row.rowEnd) {
              return { ...row, [field]: value, rowEnd: value };
            }
            return { ...row, [field]: value };
          }
          return row;
        });
        const updatedTicket = { ...ticket, seatRows };
        
        // Calculate and update maxTickets based on row assignments
        if (isVenueWithSeats) {
          const calculatedCapacity = calculateTicketsFromRowAssignments(seatRows);
          updatedTicket.maxTickets = calculatedCapacity;
        }
        
        return updatedTicket;
      }
      return ticket;
    });
    console.log('Updated ticket types after updateSeatRow:', updated);
    setTicketTypes(updated);
  };

  const removeSeatRow = (ticketIndex: number, rowIndex: number) => {
    const updated = ticketTypes.map((ticket, i) => {
      if (i === ticketIndex) {
        const seatRows = ticket.seatRows.filter((_, j) => j !== rowIndex);
        const updatedTicket = { ...ticket, seatRows };
        
        // Recalculate maxTickets after removing a row assignment
        if (isVenueWithSeats) {
          const calculatedCapacity = calculateTicketsFromRowAssignments(seatRows);
          updatedTicket.maxTickets = calculatedCapacity;
        }
        
        return updatedTicket;
      }
      return ticket;
    });
    setTicketTypes(updated);
  };

  // Validation for ticket types
  const validateTicketTypes = () => {
    if (formik.values.venueId === 0) return true; // No venue selected, skip ticket type validation

    if (ticketTypes.length === 0) {
      toast.error('Please add at least one ticket type');
      return false;
    }

    const invalidTicketTypes = ticketTypes.filter(
      tt => !tt.type.trim() || tt.price <= 0 || !tt.description.trim()
    );
    
    if (invalidTicketTypes.length > 0) {
      toast.error('Please fill in all ticket type details (name, price, and description)');
      return false;
    }

    // Check if at least one ticket type has row assignments for allocated seating venues
    if (isVenueWithSeats) {
      const hasRowAssignments = ticketTypes.some(tt => 
        tt.seatRows.some(sr => sr.rowStart && sr.rowEnd)
      );
      if (!hasRowAssignments) {
        toast.error('Please assign rows to at least one ticket type for allocated seating venues');
        return false;
      }
    }
    
    // Check that total ticket allocations don't exceed venue capacity
    const totalTicketAllocation = getTotalTicketCapacity();
    if (totalTicketAllocation > formik.values.capacity) {
      toast.error(`Total ticket allocations (${totalTicketAllocation}) exceed venue capacity (${formik.values.capacity})`);
      return false;
    }

    return true;
  };

  // Calculate total capacity from ticket types
  const getTotalTicketCapacity = () => {
    // For venues without seats (general admission), use maxTickets directly
    if (!isVenueWithSeats) {
      return ticketTypes.reduce((total, tt) => total + tt.maxTickets, 0);
    }

    // For venues with seats, calculate based on row assignments
    return ticketTypes.reduce((total, tt) => {
      // Calculate tickets from row assignments
      const ticketsFromRows = calculateTicketsFromRowAssignments(tt.seatRows);
      return total + ticketsFromRows;
    }, 0);
  };

  // Calculate the number of tickets based on row assignments
  const calculateTicketsFromRowAssignments = (seatRows: SeatRowAssignment[]) => {
    if (!selectedVenue || !seatRows.length) return 0;
    
    const seatsPerRow = selectedVenue.seatsPerRow || 12;
    let totalTickets = 0;

    seatRows.forEach(rowAssignment => {
      if (rowAssignment.rowStart && rowAssignment.rowEnd) {
        const startIndex = rowAssignment.rowStart.charCodeAt(0) - 65; // A=0, B=1, etc.
        const endIndex = rowAssignment.rowEnd.charCodeAt(0) - 65;
        const numberOfRows = endIndex - startIndex + 1;
        totalTickets += numberOfRows * seatsPerRow;
      }
    });

    return totalTickets;
  };

  // Update ticket type capacity based on row assignments
  const updateTicketTypeCapacity = (ticketIndex: number) => {
    if (!isVenueWithSeats) return;
    
    const ticketType = ticketTypes[ticketIndex];
    const calculatedCapacity = calculateTicketsFromRowAssignments(ticketType.seatRows);
    
    if (calculatedCapacity !== ticketType.maxTickets) {
      updateTicketType(ticketIndex, 'maxTickets', calculatedCapacity);
    }
  };

  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: '',
      description: '',
      date: '',
      venueId: 0,
      capacity: 100,
      price: 0, // Keeping in form values for API compatibility
      image: undefined,
      seatSelectionMode: '3', // Default to General Admission
    },
    validationSchema: EventCreateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Form submitted with values:', values);
      console.log('Ticket types:', ticketTypes);
      
      try {
        // Validate venue selection
        if (values.venueId === 0) {
          toast.error('Please select a venue for your event');
          setSubmitting(false);
          return;
        }
        
        // Validate ticket types
        if (!validateTicketTypes()) {
          setSubmitting(false);
          return;
        }

        // Create event first
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          const value = values[key as keyof EventFormValues];
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
              console.log(`Form data: ${key} = ${value.toString()}`); // Debug log
            }
          }
        });
        
        // Make sure seatSelectionMode is converted to a numeric value
        console.log(`Selected seat mode before: ${formData.get('seatSelectionMode')}`);
        // Ensure seatSelectionMode is numeric
        const modeValue = parseInt(formData.get('seatSelectionMode') as string);
        formData.delete('seatSelectionMode');
        formData.append('seatSelectionMode', modeValue.toString());
        console.log(`Selected seat mode after: ${formData.get('seatSelectionMode')}`);

        // Validate image size before sending
        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 5 * 1024 * 1024) {
          toast.error('Image file size cannot exceed 5MB');
          setSubmitting(false);
          return;
        }

        let eventResponse;
        try {
          eventResponse = await api.post('/Events', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (error: any) {
          if (error.response?.data) {
            toast.error(error.response.data);
          } else {
            toast.error('Failed to create event. Please try again.');
          }
          throw error;
        }

        const eventId = (eventResponse.data as { id: number }).id;

        // Create ticket types in bulk for better performance
        try {
          const ticketTypesForBulkCreation = ticketTypes.map(ticketType => {
            // If ticket type doesn't have a color, generate one based on its type name
            const color = ticketType.color || getStableColor(ticketType.type || `ticket-${Math.random().toString(36).substr(2, 9)}`);
            
            return {
              eventId: eventId,
              type: ticketType.type,
              name: ticketType.name,
              price: ticketType.price,
              description: ticketType.description,
              color: color,
              maxTickets: ticketType.maxTickets, // Include max tickets for General Admission events
              seatRows: ticketType.seatRows.map(row => ({
                rowStart: row.rowStart,
                rowEnd: row.rowEnd,
                maxTickets: row.maxTickets
              }))
            };
          });

          console.log(`Creating ${ticketTypesForBulkCreation.length} ticket types in bulk...`);
          const startTime = Date.now();
          await createTicketTypesBulk(ticketTypesForBulkCreation);
          const endTime = Date.now();
          console.log(`Successfully created all ticket types in bulk in ${endTime - startTime}ms`);
        } catch (bulkError: any) {
          console.warn('Bulk creation failed, falling back to individual creation:', bulkError);
          
          // Check if it's a timeout error
          if (bulkError.code === 'ECONNABORTED' || bulkError.message?.includes('timeout')) {
            toast.error('Request timed out. The server may be processing your request. Please check your events list in a moment.');
          }
          
          // Fallback to individual creation if bulk fails
          let createdCount = 0;
          for (const ticketType of ticketTypes) {
            try {
              // If ticket type doesn't have a color, generate one based on its type name
              const color = ticketType.color || getStableColor(ticketType.type || `ticket-${Math.random().toString(36).substr(2, 9)}`);
              
              console.log(`Creating ticket type "${ticketType.type}"...`);
              const startTime = Date.now();
              
              // Use the service to create ticket types with synchronized fields
              await createTicketType({
                eventId: eventId,
                type: ticketType.type,
                name: ticketType.name,
                price: ticketType.price,
                description: ticketType.description,
                color: color,
                maxTickets: ticketType.maxTickets, // Include max tickets for General Admission events
                seatRows: ticketType.seatRows.map(row => ({
                  rowStart: row.rowStart,
                  rowEnd: row.rowEnd,
                  maxTickets: row.maxTickets
                }))
              });
              
              const endTime = Date.now();
              createdCount++;
              console.log(`Created ticket type "${ticketType.type}" with color: ${color} in ${endTime - startTime}ms`);
              
              // Show progress for long operations
              if (ticketTypes.length > 3) {
                toast.success(`Created ${createdCount} of ${ticketTypes.length} ticket types...`, { duration: 1000 });
              }
            } catch (individualError: any) {
              console.error(`Failed to create ticket type "${ticketType.type}":`, individualError);
              
              // Check if it's a timeout error
              if (individualError.code === 'ECONNABORTED' || individualError.message?.includes('timeout')) {
                toast.error(`Timeout creating ticket type "${ticketType.type}". The server may still be processing this request.`);
              } else {
                toast.error(`Failed to create ticket type "${ticketType.type}"`);
              }
              
              // Continue with other ticket types instead of failing completely
            }
          }
          
          if (createdCount > 0) {
            console.log(`Successfully created ${createdCount} out of ${ticketTypes.length} ticket types individually`);
          }
        }

        toast.success('Event created successfully!');
        navigate('/organizer/events');
      } catch (error) {
        toast.error('Failed to create event');
        console.error('Error creating event:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVenueChange = (venueId: number) => {
    const selectedVenue = venues.find(v => v.id === venueId);
    formik.setFieldValue('venueId', venueId);
    if (selectedVenue) {
      formik.setFieldValue('capacity', selectedVenue.capacity);
    }
    
    // Load venue layout
    loadVenueLayout(venueId);
  };

  return (
    <>
      <SEO title="Create Event" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                {...formik.getFieldProps('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
              )}
              {formik.values.title && !formik.errors.title && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600 mb-1">URL Preview:</p>
                  <p className="text-sm text-blue-600 font-mono">
                    /{createEventSlug(formik.values.title)}
                  </p>
                </div>
              )}
            </div>

            {/* Event Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                id="description"
                {...formik.getFieldProps('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your event..."
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
              )}
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date & Time *
              </label>
              <input
                id="date"
                type="datetime-local"
                {...formik.getFieldProps('date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formik.touched.date && formik.errors.date && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.date}</p>
              )}
            </div>

            {/* Venue Selection */}
            <div>
              <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <select
                id="venueId"
                value={formik.values.venueId}
                onChange={(e) => handleVenueChange(Number(e.target.value))}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Select a venue...</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} (Capacity: {venue.capacity})
                  </option>
                ))}
              </select>
              {formik.touched.venueId && formik.errors.venueId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.venueId}</p>
              )}
              {loadingVenues && (
                <p className="mt-1 text-sm text-gray-500">Loading venues...</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Event Capacity
              </label>
              {formik.values.venueId > 0 ? (
                <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700">
                  {formik.values.capacity} (determined by venue)
                </div>
              ) : (
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  max="10000"
                  {...formik.getFieldProps('capacity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Maximum attendees"
                />
              )}
              {formik.touched.capacity && formik.errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.capacity}</p>
              )}
            </div>

            {/* Event Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Event Image (Optional)
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WEBP. Maximum size: 5MB
              </p>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Venue Layout Preview - Only for venues with seats */}
            {formik.values.venueId > 0 && isVenueWithSeats && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Venue Layout</h3>
                  <HelpTooltip content="This shows how your venue is arranged. Seats will be colored according to their assigned ticket type." />
                </div>
                
                {loadingVenueLayout ? (
                  <div className="flex items-center justify-center h-48 border border-gray-300 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading venue layout...</p>
                    </div>
                  </div>
                ) : (
                  <VenueLayoutPreview
                    layout={venueLayout}
                    selectedVenue={selectedVenue}
                    ticketTypes={ticketTypes}
                  />
                )
                }
              </div>
            )}

            {/* General Admission Info - For venues without seats */}
            {formik.values.venueId > 0 && !isVenueWithSeats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">General Admission Venue</h3>
                <p className="text-sm text-green-800">
                  This venue uses general admission without specific seat assignments. 
                  Attendees will have open access to the venue space within their ticket type restrictions.
                </p>
                <div className="mt-3 text-sm text-green-700">
                  <p><span className="font-medium">Venue:</span> {selectedVenue?.name}</p>
                  <p><span className="font-medium">Capacity:</span> {selectedVenue?.capacity} people</p>
                  <p><span className="font-medium">Layout:</span> {selectedVenue?.layoutType || 'General Admission'}</p>
                </div>
              </div>
            )}

            {/* General Admission help text - For venues without seats */}
            {!isVenueWithSeats && formik.values.venueId > 0 && (
              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
                <h4 className="font-medium mb-2">General Admission</h4>
                <p className="text-sm">
                  This venue uses general admission ticketing. Configure your ticket types below with different 
                  price points and maximum quantities. No seat assignments are required.
                </p>
              </div>
            )}

            {/* Ticket Types Note */}
            {formik.values.venueId > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                <h4 className="font-medium mb-2">Ticket Types Configuration</h4>
                <p className="text-sm">
                  {isVenueWithSeats 
                    ? `Configure your ticket types below. Each ticket type can have its own price, description, and seat assignments.
                       Make sure the total ticket allocations don't exceed your venue capacity of ${formik.values.capacity}.`
                    : `Configure your ticket types below. Each ticket type can have its own price, description, and maximum quantity.
                       Make sure the total ticket allocations don't exceed your venue capacity of ${formik.values.capacity}.`
                  }
                </p>
              </div>
            )}

            {/* Ticket Types Management */}
            {formik.values.venueId > 0 && (
              <TicketTypeManager
                ticketTypes={ticketTypes}
                availableRows={availableRows}
                isVenueWithSeats={isVenueWithSeats}
                onAddTicketType={addTicketType}
                onUpdateTicketType={updateTicketType}
                onRemoveTicketType={removeTicketType}
                onAddSeatRow={addSeatRow}
                onUpdateSeatRow={updateSeatRow}
                onRemoveSeatRow={removeSeatRow}
              />
            )}

            {/* Event Summary */}
            {formik.values.venueId > 0 && ticketTypes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Event Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Event:</span> {formik.values.title || 'Untitled Event'}</p>
                    <p><span className="font-medium">Venue:</span> {selectedVenue?.name}</p>
                    <p><span className="font-medium">Date:</span> {formik.values.date ? new Date(formik.values.date).toLocaleString() : 'Not set'}</p>
                    <p><span className="font-medium">Layout:</span> {isVenueWithSeats ? 'Allocated Seating' : 'General Admission'}</p>
                  </div>
                  
                  <div>
                    <p><span className="font-medium">Venue Capacity:</span> {selectedVenue?.capacity} seats</p>
                    <p><span className="font-medium">Ticket Types:</span> {ticketTypes.length}</p>
                    <p><span className="font-medium">Price Range:</span> ${Math.min(...ticketTypes.map(tt => tt.price))} - ${Math.max(...ticketTypes.map(tt => tt.price))}</p>
                    
                    {/* Ticket allocation warning */}
                    {getTotalTicketCapacity() > formik.values.capacity && (
                      <p className="text-red-600 font-medium mt-1">
                        Warning: Total ticket allocations ({getTotalTicketCapacity()}) exceed venue capacity ({formik.values.capacity})
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Ticket Types:</h4>
                  <div className="space-y-1">
                    {ticketTypes.map((tt, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{tt.type} - ${tt.price}</span>
                        <span className="text-blue-600">
                          {isVenueWithSeats 
                            ? (tt.seatRows.some(sr => sr.rowStart && sr.rowEnd)
                                ? `${tt.seatRows.filter(sr => sr.rowStart && sr.rowEnd).length} row range(s) assigned`
                                : 'No rows assigned'
                              )
                            : `Max ${tt.maxTickets} tickets`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/organizer/events')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {formik.isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
