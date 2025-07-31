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
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
              <p className="text-gray-400 mb-8">Last updated: July 31, 2025</p>
              
              <div className="space-y-8 text-gray-300">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Personal Information</h3>
                      <div className="space-y-2">
                        <p>• Name and contact details (email address, phone number)</p>
                        <p>• Booking and payment information</p>
                        <p>• Event preferences and attendance history</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Technical Information</h3>
                      <div className="space-y-2">
                        <p>• IP address and browser information</p>
                        <p>• Website usage data and analytics</p>
                        <p>• Device and session information</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                  <div className="space-y-3">
                    <p>• Process your bookings and payments</p>
                    <p>• Send booking confirmations and tickets</p>
                    <p>• Provide customer support and assistance</p>
                    <p>• Improve our platform and services</p>
                    <p>• Send important updates about your bookings</p>
                    <p>• Comply with legal obligations</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">With Event Organizers</h3>
                      <p>We share necessary booking information (name, email, ticket details) with event organizers to facilitate your attendance.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">With Service Providers</h3>
                      <div className="space-y-2">
                        <p>• Stripe (payment processing) - PCI DSS compliant</p>
                        <p>• Email service providers (for sending confirmations)</p>
                        <p>• Analytics services (anonymized data only)</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Legal Requirements</h3>
                      <p>We may disclose information when required by law or to protect our rights and users' safety.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
                  <div className="space-y-3">
                    <p>• All data transmission is encrypted using SSL/TLS</p>
                    <p>• Payment information is processed by Stripe (PCI DSS Level 1 compliant)</p>
                    <p>• We never store your full credit card details</p>
                    <p>• Regular security audits and updates</p>
                    <p>• Access controls and staff training on data protection</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">5. Cookies and Tracking</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Essential Cookies</h3>
                      <p>Required for basic website functionality, user authentication, and shopping cart operations.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Analytics Cookies</h3>
                      <p>Help us understand how users interact with our site to improve user experience.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Managing Cookies</h3>
                      <p>You can control cookies through your browser settings, though this may affect site functionality.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
                  <div className="space-y-3">
                    <p>• <strong>Access:</strong> Request a copy of your personal data</p>
                    <p>• <strong>Correction:</strong> Update or correct your information</p>
                    <p>• <strong>Deletion:</strong> Request deletion of your account and data</p>
                    <p>• <strong>Portability:</strong> Receive your data in a portable format</p>
                    <p>• <strong>Objection:</strong> Object to processing for marketing purposes</p>
                    <p>• <strong>Withdrawal:</strong> Withdraw consent for data processing</p>
                  </div>
                  <p className="mt-4 text-sm">
                    To exercise these rights, contact us at <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">7. Data Retention</h2>
                  <div className="space-y-3">
                    <p>• Booking data: Retained for 7 years for tax and legal purposes</p>
                    <p>• Account data: Retained while account is active, plus 2 years</p>
                    <p>• Marketing data: Retained until you unsubscribe</p>
                    <p>• Technical data: Typically retained for 2 years</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">8. International Transfers</h2>
                  <p>
                    Your data is primarily processed in New Zealand. When we use international service providers, 
                    we ensure appropriate safeguards are in place to protect your data.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                  <p>
                    Our service is not intended for children under 16. We do not knowingly collect personal 
                    information from children under 16. If we become aware of such data collection, 
                    we will delete it promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
                  <div className="space-y-3">
                    <p>For privacy-related questions or requests:</p>
                    <p><strong>Company:</strong> APPIDEA LIMITED</p>
                    <p><strong>NZBN:</strong> 9429048533461</p>
                    <p><strong>Address:</strong> 50b Merton Road, St. Johns, Auckland, 1072, New Zealand</p>
                    <p>• Email: <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
                    <p>• Subject: "Privacy Policy Inquiry"</p>
                    <p>• We will respond within 30 days</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any significant 
                    changes by email or through our website. Your continued use of our services after changes 
                    constitutes acceptance of the updated policy.
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  This policy complies with New Zealand Privacy Act 2020 and GDPR requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
