// src/pages/About.tsx
import React from 'react';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO 
        title="About KiwiLanka Tickets"
        description="Professional ticketing platform serving Sri Lankan cultural events across New Zealand. Trusted ticketing partner for event organizers. Secure ticket sales solutions."
        keywords={['Professional Ticketing Platform', 'Sri Lankan Event Tickets', 'Ticketing Partner NZ']}
      />
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">About KiwiLanka Tickets</h1>
            <p className="text-gray-600">Professional Ticketing Platform for Sri Lankan Cultural Events</p>
          </div>

        <div className="space-y-6 text-gray-600">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              We provide professional ticketing solutions that enable Sri Lankan event organizers 
              to sell tickets securely and efficiently across New Zealand. Our platform empowers 
              cultural event organizers to focus on creating memorable experiences while we handle 
              their ticket sales with professionalism and reliability.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Ticketing Services</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-4">🎭</span>
                <div>
                  <h3 className="font-medium text-gray-800">Cultural Event Ticketing</h3>
                  <p>Professional ticket sales for traditional Sri Lankan festivals and celebrations</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🎵</span>
                <div>
                  <h3 className="font-medium text-gray-800">Entertainment Ticketing</h3>
                  <p>Secure ticket sales for music concerts, dance performances, and theatrical shows</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🍲</span>
                <div>
                  <h3 className="font-medium text-gray-800">Food Festival Tickets</h3>
                  <p>Complete ticketing solutions for culinary events and food festivals</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Partnership Approach</h2>
            <p className="leading-relaxed">
              We partner with Sri Lankan event organizers across New Zealand to provide professional 
              ticketing solutions that enable them to focus on what they do best - creating authentic 
              cultural experiences. Our secure platform handles the technical complexities of ticket 
              sales, payment processing, and customer management, allowing organizers to concentrate 
              on delivering exceptional events.
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Partner With Us</h2>
            <p className="leading-relaxed mb-4">
              Are you organizing a Sri Lankan cultural event and need professional ticketing services? 
              We provide secure, reliable ticket sales solutions with comprehensive support. Let us handle 
              your ticket sales while you focus on creating unforgettable cultural experiences.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-primary hover:text-red-600 font-medium transition-colors duration-200"
            >
              Contact Our Team <span className="ml-2">→</span>
            </a>
          </div>        </div>
      </div>
    </div>
    </>
  );
};

export default About;
