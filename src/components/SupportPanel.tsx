import React from 'react';

interface SupportPanelProps {
  className?: string;
}

const SupportPanel: React.FC<SupportPanelProps> = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-600/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-blue-200 text-sm">
            <span className="font-medium">Need help?</span> Contact our support team at{' '}
            <a 
              href="mailto:support@kiwilanka.co.nz" 
              className="text-blue-300 hover:text-blue-200 underline transition-colors"
            >
              support@kiwilanka.co.nz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPanel;
