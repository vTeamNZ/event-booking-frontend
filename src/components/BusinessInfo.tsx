import React from 'react';

interface BusinessInfoProps {
  variant?: 'full' | 'compact' | 'footer';
  className?: string;
}

const BusinessInfo: React.FC<BusinessInfoProps> = ({ 
  variant = 'compact', 
  className = '' 
}) => {
  if (variant === 'full') {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-white font-semibold mb-4">Business Information</h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <p className="font-medium text-white">KiwiLanka Ticketing Platform</p>
              <p>Professional ticketing services for events</p>
              <p className="text-xs text-gray-400 mt-1">A product of APPIDEA LIMITED (NZBN: 9429048533461)</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p>50b Merton Road, St. Johns, Auckland, 1072</p>
              <p>New Zealand</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p>
                <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">
                  support@kiwilanka.co.nz
                </a>
              </p>
              <p className="text-xs text-gray-400">Response within 24 hours</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p>
                <a href="tel:+6422544681​6" className="text-blue-400 hover:text-blue-300">
                  +64 22 544 6816
                </a>
              </p>
              <p className="text-xs text-gray-400">Available during business hours</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p>Business Hours:</p>
              <p>Monday - Friday: 9:00 AM - 5:00 PM NZST</p>
              <p className="text-xs text-gray-400">Weekend support for urgent issues</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-700/50 border border-gray-600 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Contact & Support</h4>
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">
              support@kiwilanka.co.nz
            </a>
          </p>
          <p>
            <strong>Phone:</strong>{' '}
            <a href="tel:+6422544681​6" className="text-blue-400 hover:text-blue-300">
              +64 22 544 6816
            </a>
          </p>
          <p><strong>Hours:</strong> Mon-Fri 9AM-5PM NZST</p>
          <p><strong>Location:</strong> St. Johns, Auckland, New Zealand</p>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className={`text-center text-gray-400 text-sm space-y-2 ${className}`}>
      <p>© 2025 APPIDEA LIMITED. All rights reserved.</p>
      <p>KiwiLanka Ticketing Platform | NZBN: 9429048533461</p>
      <p>50b Merton Road, St. Johns, Auckland, 1072, New Zealand</p>
      <p><a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
      <p><a href="tel:+6422544681​6" className="text-blue-400 hover:text-blue-300">+64 22 544 6816</a></p>
      <p>Business Hours: Monday - Friday, 9:00 AM - 5:00 PM NZST</p>
    </div>
  );
};

export default BusinessInfo;
