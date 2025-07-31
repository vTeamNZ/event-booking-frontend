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
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Terms and Conditions</h1>
              <p className="text-gray-400 mb-8">Last updated: July 31, 2025</p>
              
              <div className="space-y-8 text-gray-300">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                  <p className="mb-4">
                    By using our ticketing platform, you agree to be bound by these Terms and Conditions. 
                    If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">2. Booking and Payment</h2>
                  <div className="space-y-3">
                    <p>• All bookings are subject to availability and confirmation.</p>
                    <p>• Payment is processed securely through Stripe, a PCI DSS compliant payment processor.</p>
                    <p>• Processing fees may apply as displayed during checkout.</p>
                    <p>• Prices are displayed in New Zealand Dollars (NZD) unless otherwise specified.</p>
                    <p>• You will receive a confirmation email with your ticket(s) and QR code(s) upon successful payment.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Ticket Validity and Usage</h2>
                  <div className="space-y-3">
                    <p>• Tickets are valid only for the specific event, date, and time shown.</p>
                    <p>• QR codes must be presented for entry - screenshots or printed versions are acceptable.</p>
                    <p>• Lost or damaged tickets may be reissued at the discretion of the event organizer.</p>
                    <p>• Tickets are non-transferable unless specifically stated otherwise.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">4. Cancellations and Refunds</h2>
                  <div className="space-y-3">
                    <p>• Refund policies are set by individual event organizers.</p>
                    <p>• Processing fees are generally non-refundable.</p>
                    <p>• In case of event cancellation by the organizer, full refunds will be provided.</p>
                    <p>• Refund requests must be submitted through our support system.</p>
                    <p>• Please refer to our Refund Policy for detailed information.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">5. User Responsibilities</h2>
                  <div className="space-y-3">
                    <p>• You must provide accurate and complete information when booking.</p>
                    <p>• You are responsible for checking event details before booking.</p>
                    <p>• Inappropriate behavior at events may result in removal without refund.</p>
                    <p>• You must comply with venue rules and local regulations.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
                  <div className="space-y-3">
                    <p>• We act as a booking platform connecting customers with event organizers.</p>
                    <p>• Event organizers are responsible for the quality and delivery of their events.</p>
                    <p>• Our liability is limited to the cost of your ticket purchase.</p>
                    <p>• We are not responsible for travel expenses or other indirect costs.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">7. Data Protection</h2>
                  <div className="space-y-3">
                    <p>• We collect and process personal data in accordance with our Privacy Policy.</p>
                    <p>• Your payment information is processed securely by Stripe and is not stored on our servers.</p>
                    <p>• We may share necessary booking information with event organizers.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">8. Contact Information</h2>
                  <div className="space-y-3">
                    <p><strong>Company:</strong> APPIDEA LIMITED</p>
                    <p><strong>NZBN:</strong> 9429048533461</p>
                    <p><strong>Address:</strong> 50b Merton Road, St. Johns, Auckland, 1072, New Zealand</p>
                    <p>• Support Email: <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
                    <p>• For urgent matters, please contact us through our support system.</p>
                    <p>• Business hours: Monday to Friday, 9:00 AM - 5:00 PM NZST</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these terms at any time. Changes will be posted on this page 
                    with an updated revision date. Continued use of our services after changes constitutes acceptance 
                    of the new terms.
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  These terms are governed by New Zealand law. Any disputes will be resolved in New Zealand courts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
