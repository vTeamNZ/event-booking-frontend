// src/pages/About.tsx
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">About Kiwi Lanka Events</h1>
          <p className="text-gray-600">Connecting Sri Lankan Culture with New Zealand Communities</p>
        </div>

        <div className="space-y-6 text-gray-600">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              We are dedicated to bringing authentic Sri Lankan cultural experiences to New Zealand,
              creating a vibrant bridge between both cultures through memorable events and celebrations.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">What We Do</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-4">🎭</span>
                <div>
                  <h3 className="font-medium text-gray-800">Cultural Events</h3>
                  <p>Organize and promote traditional Sri Lankan festivals and celebrations</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🎵</span>
                <div>
                  <h3 className="font-medium text-gray-800">Entertainment</h3>
                  <p>Host music concerts, dance performances, and theatrical shows</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🍲</span>
                <div>
                  <h3 className="font-medium text-gray-800">Food Festivals</h3>
                  <p>Showcase authentic Sri Lankan cuisine and culinary experiences</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Community</h2>
            <p className="leading-relaxed">
              We're proud to serve as a platform that brings together Sri Lankans living in New Zealand,
              while also sharing our rich cultural heritage with the wider New Zealand community.
              Our events create opportunities for cultural exchange, celebration, and building lasting connections.
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Get Involved</h2>
            <p className="leading-relaxed mb-4">
              Whether you're looking to attend our events, collaborate with us, or organize your own cultural event,
              we'd love to hear from you. Join us in celebrating and sharing Sri Lankan culture in New Zealand.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-primary hover:text-red-600 font-medium transition-colors duration-200"
            >
              Contact Us <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
