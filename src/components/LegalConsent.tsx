import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LegalConsentProps {
  onConsentChange: (isValid: boolean) => void;
  className?: string;
}

const LegalConsent: React.FC<LegalConsentProps> = ({ onConsentChange, className = '' }) => {
  const [allTermsAccepted, setAllTermsAccepted] = useState(false);

  const handleAllTermsChange = (checked: boolean) => {
    setAllTermsAccepted(checked);
    onConsentChange(checked);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-white font-medium mb-4">Terms Acknowledgement</h4>
        
        <div className="space-y-3">
          {/* Combined Terms - Single Required Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="all-terms-consent"
              checked={allTermsAccepted}
              onChange={(e) => handleAllTermsChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
              required
            />
            <label htmlFor="all-terms-consent" className="flex-1 text-sm text-gray-300">
              I agree to the{' '}
              <Link 
                to="/terms-and-conditions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Terms and Conditions
              </Link>, acknowledge that I have read the{' '}
              <Link 
                to="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Privacy Policy
              </Link>, and understand the{' '}
              <Link 
                to="/refund-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Refund Policy
              </Link>
              <span className="text-red-400 ml-1">*</span>
            </label>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-gray-400">
              <p className="mb-1">We process your personal information securely and in compliance with New Zealand privacy laws. For full details, please review our{' '}
                <Link to="/privacy-policy" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/cookie-policy" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          <span className="text-red-400">*</span> Required fields
        </p>
      </div>
    </div>
  );
};

export default LegalConsent;
