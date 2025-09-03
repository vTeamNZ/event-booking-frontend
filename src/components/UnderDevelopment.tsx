import React from 'react';
import SEO from './SEO';

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
  expectedFeatures?: string[];
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ 
  title = "Page Under Development",
  description = "This page is currently under development and will be available soon.",
  expectedFeatures = []
}) => {
  return (
    <>
      <SEO 
        title={title}
        description={description}
        keywords={["Under Development", "Coming Soon", "EventBooking"]}
      />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 px-8 py-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                {title}
              </h1>
              <p className="text-blue-100 text-lg">
                {description}
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              {/* Status Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-8">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Under Development
              </div>

              {/* Main Message */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  We're Working Hard to Bring This to You!
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our development team is actively working on this feature. We appreciate your patience 
                  as we build something amazing for you. In the meantime, feel free to explore other 
                  sections of our platform.
                </p>
              </div>

              {/* Expected Features */}
              {expectedFeatures.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What to Expect:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {expectedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Development Progress</span>
                  <span>In Progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Home
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Questions? Feel free to <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">contact us</a> for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnderDevelopment;
