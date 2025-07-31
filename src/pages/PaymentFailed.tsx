import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import SupportPanel from '../components/SupportPanel';
import BusinessInfo from '../components/BusinessInfo';

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
        keywords={["Payment Failed", "Payment Error", "Retry Payment", "Ticketing Issue"]}
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

              {/* Security Assurance */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg text-left">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-blue-200 font-medium mb-2">🔒 Your Security is Protected</h4>
                    <div className="text-blue-100 text-sm space-y-1">
                      <p>• No charges were made to your card</p>
                      <p>• Your card details remain secure</p>
                      <p>• All payment attempts are SSL encrypted</p>
                      <p>• Safe to retry or try a different payment method</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <BusinessInfo variant="compact" className="mt-4" />

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
