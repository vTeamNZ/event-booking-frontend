// src/pages/Contact.tsx
import React from 'react';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with KiwiLanka Events. List your event, ask questions, or provide feedback. We'd love to hear from you!"
        keywords={['Get Notified of Top Events', 'Support Community Events', 'List Your Sri Lankan Event']}
      />
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
            <p className="text-gray-600">List Your Event with Kiwi Lanka or Get in Touch</p>
          </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Contact Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Get In Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📞</span>
                  <div>
                    <h3 className="font-medium text-gray-800">Phone</h3>
                    <p className="text-gray-600">Gayan - +64 22 544 6816</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <a 
                      href="mailto:gayan@kiwilanka.co.nz" 
                      className="text-primary hover:text-red-600 transition-colors duration-200"
                    >
                      gayan@kiwilanka.co.nz
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">⏰</span>
                  <div>
                    <h3 className="font-medium text-gray-800">Response Time</h3>
                    <p className="text-gray-600">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Quick Links</h2>
              <div className="space-y-2">
                <a href="/about" className="block text-primary hover:text-red-600 transition-colors duration-200">
                  → About Us
                </a>
                <a href="/" className="block text-primary hover:text-red-600 transition-colors duration-200">
                  → Upcoming Events
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - List Your Event */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">List Your Event</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you organizing an event for the Sri Lankan community in New Zealand? 
                We'd love to feature it on our platform.
              </p>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-800">Why List with Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Reach the Sri Lankan community across NZ
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Professional event management platform
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Secure ticketing and payment system
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Marketing and promotion support
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                {/* <a 
                  href="mailto:Gayan@kiwilanka.co.nz?subject=New%20Event%20Listing%20Request"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Submit Your Event →
                </a> */}
              </div>
            </div>          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
