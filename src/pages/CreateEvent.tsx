import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface EventFormValues {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  seatSelectionMode: string;
  image?: File;
  stagePosition?: string;
}

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
  location: Yup.string()
    .min(3, 'Location must be at least 3 characters')
    .required('Event location is required'),
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
  image: Yup.mixed()
    .test('fileSize', 'File size too large (max 5MB)', (value) => {
      if (!value) return true;
      const file = value as File;
      return file.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Invalid file type (JPG, PNG, GIF, WEBP only)', (value) => {
      if (!value) return true;
      const file = value as File;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    })
    .nullable(),
});

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 100,
      price: 0,
      seatSelectionMode: '3', // General Admission by default
      image: undefined,
      stagePosition: '',
    },
    validationSchema: EventCreateSchema,
    onSubmit: async (values, { setStatus }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('date', new Date(values.date).toISOString());
        formData.append('location', values.location);
        formData.append('capacity', values.capacity.toString());
        formData.append('price', values.price.toString());
        formData.append('seatSelectionMode', values.seatSelectionMode);
        formData.append('isActive', 'true');
        
        if (values.stagePosition) {
          formData.append('stagePosition', values.stagePosition);
        }
        
        if (values.image) {
          formData.append('image', values.image);
        }

        const response = await api.post('/api/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        toast.success('Event created successfully! It will be visible after admin approval.');
        navigate(`/organizer/events/${(response.data as any).id}`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data || 
                           'Failed to create event. Please try again.';
        setStatus(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      formik.setFieldValue('image', undefined);
      setImagePreview(null);
    }
  };

  const seatSelectionModes = [
    { value: '1', label: 'Event Hall Seating', description: 'Individual seat selection with visual layout' },
    { value: '2', label: 'Table Seating', description: 'Table-based seating with group booking options' },
    { value: '3', label: 'General Admission', description: 'No seat selection, ticket types only' },
  ];

  return (
    <>
      <SEO 
        title="Create Event" 
        description="Create a new event and set up seating arrangements, pricing, and booking options." 
        keywords={["Create Event", "Event Management", "Event Organization"]}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">Fill in the details below to create your event</p>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Title */}
                <div className="lg:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter event title"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.title}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                  )}
                </div>

                {/* Event Description */}
                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Describe your event..."
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                  )}
                </div>

                {/* Date and Time */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date & Time *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.date}
                  />
                  {formik.touched.date && formik.errors.date && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.date}</div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Event venue or address"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.location}
                  />
                  {formik.touched.location && formik.errors.location && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.location}</div>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Capacity *
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Maximum attendees"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.capacity}
                  />
                  {formik.touched.capacity && formik.errors.capacity && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.capacity}</div>
                  )}
                </div>

                {/* Base Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (NZD) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.price}
                  />
                  {formik.touched.price && formik.errors.price && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
                  )}
                </div>

                {/* Seat Selection Mode */}
                <div className="lg:col-span-2">
                  <label htmlFor="seatSelectionMode" className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Configuration *
                  </label>
                  <div className="space-y-3">
                    {seatSelectionModes.map((mode) => (
                      <div key={mode.value} className="flex items-start">
                        <input
                          id={`seatSelectionMode-${mode.value}`}
                          name="seatSelectionMode"
                          type="radio"
                          value={mode.value}
                          checked={formik.values.seatSelectionMode === mode.value}
                          onChange={formik.handleChange}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <label htmlFor={`seatSelectionMode-${mode.value}`} className="block text-sm font-medium text-gray-900">
                            {mode.label}
                          </label>
                          <p className="text-sm text-gray-600">{mode.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formik.touched.seatSelectionMode && formik.errors.seatSelectionMode && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.seatSelectionMode}</div>
                  )}
                </div>

                {/* Event Image Upload */}
                <div className="lg:col-span-2">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image (Optional)
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    onChange={handleImageChange}
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
                  
                  {formik.touched.image && formik.errors.image && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
                  )}
                </div>
              </div>

              {/* Form Status */}
              {formik.status && (
                <div className="text-red-500 text-sm">{formik.status}</div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/organizer/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
