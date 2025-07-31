// src/pages/Contact.tsx
import React from 'react';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  return (
    <>
      <SEO 
        title="Contact Us"
        description="Partner with KiwiLanka Tickets for professional ticketing services. Get professional support for your Sri Lankan cultural event ticketing needs."
        keywords={['Professional Ticketing Services', 'Ticketing Partner Support', 'Event Ticketing Solutions']}
      />
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
            <p className="text-gray-600">Partner with KiwiLanka Tickets for Professional Event Ticketing</p>
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
                    <p className="text-gray-600">+64 22 544 6816</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <a 
                      href="mailto:support@kiwilanka.co.nz" 
                      className="text-primary hover:text-red-600 transition-colors duration-200"
                    >
                      support@kiwilanka.co.nz
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
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Explore Our Platform</h2>
              <div className="space-y-2">
                <a href="/about" className="block text-primary hover:text-red-600 transition-colors duration-200">
                  → About Our Ticketing Services
                </a>
                <a href="/" className="block text-primary hover:text-red-600 transition-colors duration-200">
                  → Browse Current Events
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Ticketing Partnership */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Ticketing Partnership</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you organizing a Sri Lankan cultural event and need professional ticketing services? 
                Partner with us for secure, reliable ticket sales solutions.
              </p>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-800">Why Partner with Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Reach the Sri Lankan community across NZ
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Professional ticketing platform
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Secure ticketing and payment system
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="text-primary mr-2">✓</span>
                    Dedicated ticketing support team
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
