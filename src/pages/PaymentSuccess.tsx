import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, amount } = location.state || {};

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-primary">${amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          A confirmation email with your tickets has been sent to your email address.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Back to Events
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
