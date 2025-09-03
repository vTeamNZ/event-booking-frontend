import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  organizationName?: string;
  phoneNumber?: string;
  website?: string;
}

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Too Short!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
  role: Yup.string()
    .oneOf(['Attendee', 'Organizer'], 'Invalid role')
    .required('Required'),
  organizationName: Yup.string()
    .when('role', {
      is: 'Organizer',
      then: (schema) => schema.required('Organization name is required for organizers')
    }),
  phoneNumber: Yup.string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format'),
  website: Yup.string()
    .url('Invalid website URL')
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll to register form on page load
  useEffect(() => {
    const scrollToRegister = () => {
      const registerContainer = document.getElementById('register-container');
      if (registerContainer) {
        // Use different scroll behavior for mobile vs desktop
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          // On mobile, scroll with smaller offset to show the heading
          const headerHeight = 150; // Further reduced to show the "Create your account" heading
          const elementTop = registerContainer.offsetTop - headerHeight;
          window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
          });
        } else {
          // On desktop, use center positioning
          registerContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    };

    // Small delay to ensure the page is fully loaded
    const timeoutId = setTimeout(scrollToRegister, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Attendee',
      organizationName: '',
      phoneNumber: '',
      website: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setStatus }) => {
      setIsSubmitting(true);
      try {
        const registerData = {
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          role: values.role,
          organizationName: values.role === 'Organizer' ? values.organizationName?.trim() : undefined,
          phoneNumber: values.role === 'Organizer' ? values.phoneNumber?.trim() : undefined,
          website: values.role === 'Organizer' ? values.website?.trim() : undefined
        };

        await authService.register(registerData);
        toast.success('Registration successful! Please login to continue.');
        navigate('/login');
      } catch (error: any) {
        const errorMessage = typeof error.response?.data === 'object' 
          ? error.response?.data?.message || JSON.stringify(error.response?.data)
          : error.response?.data || 'Registration failed. Please try again.';
        setStatus(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const isOrganizer = formik.values.role === 'Organizer';

  return (
    <>
      <SEO 
        title="Register" 
        description="Create your KiwiLanka Tickets account to book tickets, access exclusive events, and manage your bookings. Professional ticketing platform registration." 
        keywords={["Register", "Sign Up", "Ticketing Account", "Event Ticket Account", "KiwiLanka Registration"]}
      />
      <div className="min-h-screen flex items-start justify-center bg-gray-900 px-4 sm:px-6 lg:px-8 pt-16">
        <div id="register-container" className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                sign in to your existing account
              </Link>
            </p>
          </div>
          <form className="mt-6 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.role}
                >
                  <option value="Attendee">Event Attendee</option>
                  <option value="Organizer">Event Organizer</option>
                </select>
                {formik.touched.role && formik.errors.role && (
                  <div className="text-error text-sm mt-1">{formik.errors.role}</div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Your full name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.fullName}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className="text-error text-sm mt-1">{formik.errors.fullName}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="your@email.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-error text-sm mt-1">{formik.errors.email}</div>
                )}
              </div>

              {/* Organizer-specific fields */}
              {isOrganizer && (
                <>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300">
                      Organization Name *
                    </label>
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Your organization or company name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.organizationName}
                    />
                    {formik.touched.organizationName && formik.errors.organizationName && (
                      <div className="text-error text-sm mt-1">{formik.errors.organizationName}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phoneNumber}
                    />
                    {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                      <div className="text-error text-sm mt-1">{formik.errors.phoneNumber}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-300">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://yourwebsite.com"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.website}
                    />
                    {formik.touched.website && formik.errors.website && (
                      <div className="text-error text-sm mt-1">{formik.errors.website}</div>
                    )}
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Minimum 6 characters"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-error text-sm mt-1">{formik.errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Re-enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className="text-error text-sm mt-1">{formik.errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {formik.status && (
              <div className="text-error text-sm text-center">
                {typeof formik.status === 'string' ? formik.status : 'An error occurred during registration'}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
