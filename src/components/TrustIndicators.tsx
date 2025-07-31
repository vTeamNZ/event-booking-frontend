import React from 'react';

interface TrustIndicatorsProps {
  variant?: 'payment' | 'checkout' | 'footer';
  className?: string;
}

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ 
  variant = 'payment', 
  className = '' 
}) => {
  if (variant === 'payment') {
    return (
      <div className={`bg-green-900/20 border border-green-600/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-green-200 font-medium mb-2">🔒 Secure Payment Guarantee</h4>
            <div className="space-y-1 text-green-100 text-sm">
              <p>• SSL encrypted connection</p>
              <p>• PCI DSS compliant payment processing</p>
              <p>• Money-back guarantee for cancelled events</p>
              <p>• Secure data handling & privacy protection</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'checkout') {
    return (
      <div className={`bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-blue-200 text-sm font-medium">Secured by Stripe</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300 text-xs">SSL</span>
            <span className="text-blue-300 text-xs">•</span>
            <span className="text-blue-300 text-xs">PCI</span>
            <span className="text-blue-300 text-xs">•</span>
            <span className="text-blue-300 text-xs">256-bit</span>
          </div>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className={`flex flex-wrap items-center justify-center space-x-6 text-gray-400 text-sm ${className}`}>
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>SSL Secured</span>
      </div>
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>PCI Compliant</span>
      </div>
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Money-Back Guarantee</span>
      </div>
    </div>
  );
};

export default TrustIndicators;
