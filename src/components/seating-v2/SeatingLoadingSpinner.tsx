// Seating Loading Spinner Component
import React from 'react';

interface SeatingLoadingSpinnerProps {
  className?: string;
  message?: string;
}

const SeatingLoadingSpinner: React.FC<SeatingLoadingSpinnerProps> = ({
  className = '',
  message = 'Loading seating layout...'
}) => {
  return (
    <div className={`seating-loading-spinner ${className}`}>
      <div className="flex flex-col items-center justify-center p-8">
        {/* Spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-4 border-blue-200"></div>
        </div>
        
        {/* Loading Message */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we load the seating chart</p>
        </div>

        {/* Loading Steps */}
        <div className="mt-6 w-full max-w-md">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 mr-2 bg-blue-600 rounded-full animate-pulse"></div>
              Loading venue layout...
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 mr-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
              Fetching seat availability...
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 mr-2 bg-blue-300 rounded-full animate-pulse delay-500"></div>
              Preparing seating chart...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingLoadingSpinner;
