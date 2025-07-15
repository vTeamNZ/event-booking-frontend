// Seating Error Message Component
import React from 'react';

interface SeatingErrorMessageProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

const SeatingErrorMessage: React.FC<SeatingErrorMessageProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`seating-error-message ${className}`}>
      <div className="flex flex-col items-center justify-center p-8">
        {/* Error Icon */}
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Seating Layout
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-gray-500 text-sm">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go to Events
          </button>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mt-8 w-full max-w-md">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Troubleshooting Tips
            </summary>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div>• Check your internet connection</div>
              <div>• Refresh the page (Ctrl+R or Cmd+R)</div>
              <div>• Clear your browser cache</div>
              <div>• Try using a different browser</div>
              <div>• Contact support if the issue persists</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SeatingErrorMessage;
