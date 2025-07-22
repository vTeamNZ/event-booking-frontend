import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import SupportPanel from '../components/SupportPanel';

interface LocationState {
  error?: string;
  status?: string;
}

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const handleRetryPayment = () => {
    navigate('/payment');
  };

  return (
    <>
      <SEO 
        title="Payment Failed" 
        description="Something went wrong with your payment. Don't worry, your card has not been charged. Please try again or contact support for assistance." 
        keywords={["Payment Failed", "Payment Error", "Retry Payment", "Event Booking Issue"]}
      />
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-2xl rounded-xl sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-error"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h2>
              {state?.error && (
                <p className="mt-2 text-sm text-gray-300">{state.error}</p>
              )}
              {state?.status && (
                <p className="mt-2 text-sm text-gray-500">Status: {state.status}</p>
              )}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleRetryPayment}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Try Payment Again
                </button>
                <Link
                  to="/"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Return to Home
                </Link>
              </div>

              {/* Support Panel */}
              <SupportPanel className="mt-6" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
