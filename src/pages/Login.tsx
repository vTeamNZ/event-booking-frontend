import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import SEO from '../components/SEO';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .min(6, 'Too Short!')
    .required('Required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Auto-scroll to login form on page load
  useEffect(() => {
    const scrollToLogin = () => {
      const loginContainer = document.getElementById('login-container');
      if (loginContainer) {
        // Use different scroll behavior for mobile vs desktop
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          // On mobile, scroll with smaller offset to show the heading
          const headerHeight = 150; // Further reduced to show the "Sign in to your account" heading
          const elementTop = loginContainer.offsetTop - headerHeight;
          window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
          });
        } else {
          // On desktop, use center positioning
          loginContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    };

    // Small delay to ensure the page is fully loaded
    const timeoutId = setTimeout(scrollToLogin, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await authService.login(values);
        navigate(from, { replace: true });
      } catch (error: any) {
        setStatus(error.response?.data || 'An error occurred during login');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <SEO 
        title="Sign In" 
        description="Sign in to your KiwiLanka Tickets account to manage your ticket orders, view your bookings, and access exclusive member benefits." 
        keywords={["Sign In", "Account Login", "Ticket Booking Login", "Member Access"]}
      />
      <div className="min-h-screen flex items-start justify-center bg-gray-900 px-4 sm:px-6 lg:px-8 pt-16">
        <div id="login-container" className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-6 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-error text-sm">{formik.errors.email}</div>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-error text-sm">{formik.errors.password}</div>
                )}
              </div>
            </div>

            {formik.status && (
              <div className="text-error text-sm text-center">{formik.status}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
