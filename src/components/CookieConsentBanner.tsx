import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookieConsent');
    if (!consentChoice) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 2000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: true,
      functional: true
    }));
    closeBanner();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: false,
      functional: false
    }));
    closeBanner();
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">🍪 We use cookies to enhance your experience</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We use essential cookies for site functionality and optional cookies for analytics to improve our service. 
                  Your payment and personal data are always secure and encrypted.{' '}
                  <Link to="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline">
                    Learn more about our cookie policy
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
            <button
              onClick={handleAcceptEssential}
              className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors duration-200"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 text-sm bg-primary hover:bg-primary-dark text-black font-medium rounded-lg transition-colors duration-200"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-center space-x-4 text-xs text-gray-500">
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-gray-300 transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <span>Secured by SSL & PCI Compliance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
