// src/pages/Contact.tsx
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-3xl font-bold mb-6 text-black">📩 List Your Event with Kiwi Lanka</h1>

      <p className="text-lg mb-8 text-black">
        Are you organizing an event for the Sri Lankan community in New Zealand? We'd love to feature it on our platform.
        Reach out to us and we'll help you list your event on Kiwi Lanka.
      </p>

      <div className="bg-black/40 rounded-lg p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-black">📞 Phone</h2>
          <p className="text-black">Gayan - +64 22 544 6816</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-black">📧 Email</h2>
          <p className="text-black">Gayan@kiwilanka.co.nz</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
