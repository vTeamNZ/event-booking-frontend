import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useVenues } from '../hooks/useVenues';

interface EventFormValues {
  title: string;
  description: string;
  date: string;
  venueId: number;
  capacity: number;
  price: number;
  seatSelectionMode: string;
  image?: File;
}

const seatSelectionModes = [
  { id: '1', label: 'Theater Style' },
  { id: '2', label: 'Banquet Style' },
  { id: '3', label: 'Mixed' }
];

const EventCreateSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
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
    .min(0, 'Price cannot be negative')
    .required('Event price is required'),
  seatSelectionMode: Yup.string()
    .oneOf(['1', '2', '3'], 'Invalid seat selection mode')
    .required('Seat selection mode is required'),
});

const CreateEventSimple: React.FC = () => {
  const navigate = useNavigate();
  const { venues, loading: loadingVenues } = useVenues();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: '',
      description: '',
      date: '',
      venueId: 0,
      capacity: 100,
      price: 0,
      seatSelectionMode: '1',
      image: undefined,
    },
    validationSchema: EventCreateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Form submitted with values:', values);
      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          const value = values[key as keyof EventFormValues];
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        await api.post('/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

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
                Event Capacity *
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                max="10000"
                {...formik.getFieldProps('capacity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Maximum attendees"
              />
              {formik.touched.capacity && formik.errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.capacity}</p>
              )}
            </div>

            {/* Base Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (NZD) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...formik.getFieldProps('price')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              {formik.touched.price && formik.errors.price && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.price}</p>
              )}
            </div>

            {/* Seat Selection Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seating Configuration *
              </label>
              <div className="space-y-3">
                {seatSelectionModes.map((mode) => (
                  <div key={mode.id} className="flex items-center">
                    <input
                      id={`seatSelectionMode-${mode.id}`}
                      type="radio"
                      value={mode.id}
                      checked={formik.values.seatSelectionMode === mode.id}
                      onChange={formik.handleChange}
                      name="seatSelectionMode"
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`seatSelectionMode-${mode.id}`} className="text-sm font-medium text-gray-900">
                      {mode.label}
                    </label>
                  </div>
                ))}
              </div>
              {formik.touched.seatSelectionMode && formik.errors.seatSelectionMode && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.seatSelectionMode}</p>
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

export default CreateEventSimple;
