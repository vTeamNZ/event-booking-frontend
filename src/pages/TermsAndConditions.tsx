import React from 'react';
import SEO from '../components/SEO';

const TermsAndConditions: React.FC = () => {
  return (
    <>
      <SEO 
        title="Terms and Conditions - KiwiLanka Ticketing Platform"
        description="Terms and conditions for using our professional ticketing platform."
        keywords={['terms', 'conditions', 'legal', 'booking terms']}
      />
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="bg-white border border-gray-300 shadow-lg">
            <div className="p-12">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif text-gray-900 mb-4">TERMS AND CONDITIONS</h1>
                <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-6"></div>
                <p className="text-gray-600 font-medium">KiwiLanka / AppIdea Limited</p>
                <p className="text-gray-600 font-medium">Last Updated: 31 July 2025</p>
              </div>
              
              <div className="space-y-12 text-gray-800 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using the KiwiLanka event ticketing platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">2. Services Provided</h2>
                  <p>
                    KiwiLanka provides a digital platform that enables customers to browse, book, and pay for tickets to events organized by independent third-party Organizers. KiwiLanka acts as an authorized ticketing agent but does not organize or host the events unless explicitly stated.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">3. Booking and Payment</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>All ticket sales are subject to availability and confirmation from the Organizer.</li>
                    <li>Prices are displayed in New Zealand Dollars (NZD) and are inclusive of GST (if applicable).</li>
                    <li>Payments are processed securely through Stripe, a PCI DSS Level 1 certified payment gateway.</li>
                    <li>A booking confirmation and digital ticket (including a QR code) will be issued upon successful payment.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">4. Ticket Validity and Entry</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Tickets are valid only for the specific event, date, and time shown.</li>
                    <li>Entry to events requires presentation of the QR code or ticket ID.</li>
                    <li>Tickets are non-transferable unless specified otherwise by the Organizer.</li>
                    <li>Lost or damaged tickets may be reissued at the discretion of the Organizer.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">5. Refunds and Cancellations</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>All refund requests are governed by KiwiLanka's Refund Policy.</li>
                    <li>Refunds are generally not issued for change of mind, personal circumstances, or no-shows.</li>
                    <li>If an event is cancelled or significantly changed, customers may be entitled to a refund.</li>
                    <li>Refunds will be processed to the original payment method within the timelines set out in the Refund Policy.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">6. User Responsibilities</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>You agree to provide accurate and complete information at the time of booking.</li>
                    <li>You are responsible for verifying event details before confirming a purchase.</li>
                    <li>You must comply with all venue terms and conditions and public health regulations.</li>
                    <li>Disruptive, abusive, or unlawful behaviour at events may result in denied entry or removal without refund.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">7. Limitation of Liability</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>KiwiLanka is not liable for event delivery, performance, or content.</li>
                    <li>Our liability is limited to the ticket price and applicable fees paid to us.</li>
                    <li>We are not responsible for indirect losses such as travel, accommodation, or incidental costs.</li>
                    <li>In no event will KiwiLanka be liable for any loss beyond what is explicitly stated by law.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">8. Data Protection</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Personal data is collected, stored, and used in accordance with our Privacy Policy.</li>
                    <li>By using our services, you consent to the processing of your data as outlined in the policy.</li>
                    <li>Payment details are not stored by KiwiLanka and are handled by Stripe.</li>
                    <li>We may share booking details with Organizers solely for event administration purposes.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">9. Intellectual Property</h2>
                  <p>
                    All content on the KiwiLanka website, including logos, branding, and layout, is the intellectual property of AppIdea Limited. Unauthorized reproduction or use is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">10. Amendments</h2>
                  <p>
                    KiwiLanka reserves the right to amend these Terms and Conditions at any time. Changes will be posted on our website with an updated revision date. Continued use of the platform following any changes constitutes acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">11. Governing Law</h2>
                  <p>
                    These Terms and Conditions are governed by the laws of New Zealand. Any disputes arising under or in connection with these terms will be subject to the exclusive jurisdiction of the New Zealand courts.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">12. Contact</h2>
                  <div className="bg-gray-50 p-6 border border-gray-300">
                    <p className="font-semibold text-lg mb-2">KiwiLanka / AppIdea Limited</p>
                    <p className="mb-1"><strong>NZBN:</strong> 9429048533461</p>
                    <p className="mb-1"><strong>Address:</strong> 50b Merton Road, St Johns, Auckland 1072, New Zealand</p>
                    <p className="mb-1"><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                    <p><strong>Business Hours:</strong> Monday to Friday, 9:00 AM – 5:00 PM NZST</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
