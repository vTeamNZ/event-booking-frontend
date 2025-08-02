import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - KiwiLanka Ticketing Platform"
        description="Privacy policy and data protection information for our ticketing platform."
        keywords={['privacy', 'policy', 'data protection', 'GDPR']}
      />
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="bg-white border border-gray-300 shadow-lg">
            <div className="p-12">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif text-gray-900 mb-4">PRIVACY POLICY</h1>
                <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-6"></div>
                <p className="text-gray-600 font-medium">Last Updated: 31 July 2025</p>
              </div>
              
              <div className="space-y-12 text-gray-800 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">1. Introduction</h2>
                  <p>
                    This Privacy Policy describes how KiwiLanka, operated by AppIdea Limited, collects, uses, and protects personal information obtained through our event ticketing platform. We are committed to complying with the New Zealand Privacy Act 2020 and relevant obligations under the General Data Protection Regulation (GDPR), where applicable.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">2. Data Controller</h2>
                  <p className="mb-4">AppIdea Limited is the data controller for all personal information collected via the KiwiLanka platform.</p>
                  <div className="bg-gray-50 p-6 border border-gray-300">
                    <p className="mb-1"><strong>NZBN:</strong> 9429048533461</p>
                    <p className="mb-1"><strong>Address:</strong> 50b Merton Road, St Johns, Auckland 1072, New Zealand</p>
                    <p><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">3. Information We Collect</h2>
                  <p className="mb-4">We collect the following types of information when you use our platform:</p>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">a. Personal Information:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Billing and event booking details</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">b. Technical Information:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP address and browser type</li>
                      <li>Device identifiers</li>
                      <li>Usage and interaction data (e.g., clicks, pages viewed)</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">c. Payment Information:</h3>
                    <p className="ml-4">We do not store credit or debit card details. All payments are processed securely by Stripe, a PCI DSS Level 1 certified provider.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">4. How We Use Your Information</h2>
                  <p className="mb-3">We use your information for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>To process event bookings and issue e-tickets</li>
                    <li>To send order confirmations and event reminders</li>
                    <li>To provide customer support</li>
                    <li>To detect, investigate, and prevent fraud or system abuse</li>
                    <li>To meet our legal obligations</li>
                    <li>To analyze usage patterns and improve our services</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">5. Sharing of Information</h2>
                  <p className="mb-3">We may share your information as follows:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>With event organizers:</strong> only for events you've booked</li>
                    <li><strong>With service providers:</strong> such as Stripe (payments), email delivery services, and analytics tools</li>
                    <li><strong>When legally required:</strong> to comply with court orders, law enforcement, or regulatory obligations</li>
                    <li><strong>In connection with a merger, acquisition, or business restructuring,</strong> subject to standard confidentiality requirements</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">6. Data Security</h2>
                  <p className="mb-4">We take reasonable steps to protect your data from unauthorized access, disclosure, alteration, or destruction. Security measures include:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>SSL/TLS encryption</li>
                    <li>Secure hosting infrastructure</li>
                    <li>Role-based access controls</li>
                    <li>Staff training and internal data handling policies</li>
                  </ul>
                  <p className="italic">Payment information is not stored on our servers and is managed entirely by Stripe.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">7. Cookies and Tracking Technologies</h2>
                  <p className="mb-3">We use cookies to enhance user experience, including:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Essential cookies for session management and login</li>
                    <li>Analytical cookies (e.g., Google Analytics) to understand site performance</li>
                  </ul>
                  <p>You may disable cookies in your browser, but some features of the site may not function properly.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">8. Your Rights</h2>
                  <p className="mb-3">Under the Privacy Act and GDPR (where applicable), you have the following rights:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or amend your information</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to retention laws)</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                    <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                  </ul>
                  <p>To exercise these rights, please contact us at <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a>.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">9. Data Retention</h2>
                  <p className="mb-3">We retain personal information as follows:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Booking and transaction data:</strong> for 7 years to comply with tax and legal requirements</li>
                    <li><strong>Account information:</strong> for as long as the account is active and up to 2 years thereafter</li>
                    <li><strong>Marketing data:</strong> until you opt out or unsubscribe</li>
                    <li><strong>Technical logs:</strong> generally retained for 24 months for analytics and security monitoring</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">10. International Transfers</h2>
                  <p>
                    We primarily store and process data in New Zealand. Where service providers operate outside New Zealand (e.g. cloud infrastructure), we ensure appropriate safeguards such as contractual data protection clauses are in place.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">11. Children's Privacy</h2>
                  <p>
                    Our services are not intended for use by individuals under the age of 16. We do not knowingly collect personal data from children. If we learn that we have collected information from a child under 16, we will delete it promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">12. Changes to this Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes to our practices or for legal or regulatory reasons. Any updates will be posted on this page with a revised effective date. We encourage users to review the policy periodically.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">13. Contact</h2>
                  <p className="mb-4">If you have questions or concerns about this Privacy Policy or your personal information, please contact:</p>
                  <div className="bg-gray-50 p-6 border border-gray-300">
                    <p className="font-semibold text-lg mb-2">KiwiLanka / AppIdea Limited</p>
                    <p className="mb-1"><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                    <p className="mb-1"><strong>Address:</strong> 50b Merton Road, St Johns, Auckland 1072, New Zealand</p>
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

export default PrivacyPolicy;
