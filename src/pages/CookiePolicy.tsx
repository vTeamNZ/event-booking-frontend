import React from 'react';
import SEO from '../components/SEO';

const CookiePolicy: React.FC = () => {
  return (
    <>
      <SEO 
        title="Cookie Policy - KiwiLanka Ticketing Platform"
        description="Information about how we use cookies on our ticketing platform."
        keywords={['cookies', 'policy', 'tracking', 'privacy']}
      />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Cookie Policy</h1>
              <p className="text-gray-400 mb-8">Last updated: July 31, 2025</p>
              
              <div className="space-y-8 text-gray-300">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">1. What Are Cookies?</h2>
                  <p className="mb-4">
                    Cookies are small text files that are stored on your device when you visit our website. 
                    They help us provide you with a better browsing experience and enable certain features 
                    of our ticketing platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">2. Types of Cookies We Use</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-blue-200 mb-3">🔧 Essential Cookies</h3>
                      <p className="text-blue-100 mb-3">These cookies are necessary for the website to function properly.</p>
                      <div className="space-y-2 text-blue-100 text-sm">
                        <p>• <strong>Authentication:</strong> Keep you logged in during your session</p>
                        <p>• <strong>Shopping Cart:</strong> Remember your selected tickets and seats</p>
                        <p>• <strong>Security:</strong> Protect against cross-site request forgery</p>
                        <p>• <strong>Preferences:</strong> Remember your language and display settings</p>
                        <p><em>These cookies cannot be disabled as they are essential for site functionality.</em></p>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-green-200 mb-3">📊 Analytics Cookies</h3>
                      <p className="text-green-100 mb-3">Help us understand how visitors use our website.</p>
                      <div className="space-y-2 text-green-100 text-sm">
                        <p>• <strong>Usage Statistics:</strong> Page views, session duration, bounce rate</p>
                        <p>• <strong>Performance:</strong> Loading times and error tracking</p>
                        <p>• <strong>User Flow:</strong> How users navigate through our booking process</p>
                        <p>• <strong>Popular Content:</strong> Most viewed events and pages</p>
                        <p><em>This data is anonymized and used to improve our service.</em></p>
                      </div>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-purple-200 mb-3">🎯 Functional Cookies</h3>
                      <p className="text-purple-100 mb-3">Enhance your experience with personalized features.</p>
                      <div className="space-y-2 text-purple-100 text-sm">
                        <p>• <strong>Recent Searches:</strong> Remember your recent event searches</p>
                        <p>• <strong>Favorites:</strong> Save your favorite events and organizers</p>
                        <p>• <strong>Location:</strong> Remember your preferred location/city</p>
                        <p>• <strong>Display Preferences:</strong> Theme, layout, and accessibility settings</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Third-Party Cookies</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Stripe (Payment Processing)</h3>
                      <div className="space-y-2">
                        <p>• Used for secure payment processing</p>
                        <p>• Fraud detection and prevention</p>
                        <p>• PCI DSS compliant security measures</p>
                        <p>• Read <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Stripe's Privacy Policy</a></p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Google Analytics (Optional)</h3>
                      <div className="space-y-2">
                        <p>• Website traffic analysis</p>
                        <p>• User behavior insights (anonymized)</p>
                        <p>• Performance monitoring</p>
                        <p>• Can be disabled through cookie preferences</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">4. Managing Your Cookie Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-yellow-200 mb-3">Browser Settings</h3>
                      <div className="space-y-2 text-yellow-100">
                        <p>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</p>
                        <p>• <strong>Firefox:</strong> Options → Privacy & Security → Cookies</p>
                        <p>• <strong>Safari:</strong> Preferences → Privacy → Cookies</p>
                        <p>• <strong>Edge:</strong> Settings → Privacy → Cookies</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Cookie Consent Banner</h3>
                      <p>When you first visit our site, you'll see a cookie consent banner where you can:</p>
                      <div className="space-y-2 mt-2">
                        <p>• Accept all cookies</p>
                        <p>• Accept only essential cookies</p>
                        <p>• Customize your preferences</p>
                        <p>• Change your preferences later in site settings</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">5. Impact of Disabling Cookies</h2>
                  <div className="space-y-4">
                    <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-red-200 mb-3">⚠ If You Disable Essential Cookies</h3>
                      <div className="space-y-2 text-red-100">
                        <p>• You won't be able to log in or maintain your session</p>
                        <p>• Shopping cart functionality will not work</p>
                        <p>• Payment processing will be unavailable</p>
                        <p>• Site may not function properly</p>
                      </div>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-orange-200 mb-3">📉 If You Disable Analytics Cookies</h3>
                      <div className="space-y-2 text-orange-100">
                        <p>• Site will function normally</p>
                        <p>• We won't be able to improve user experience as effectively</p>
                        <p>• Performance issues may take longer to identify</p>
                        <p>• Your usage data won't contribute to site improvements</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">6. Cookie Retention</h2>
                  <div className="space-y-3">
                    <p>• <strong>Session Cookies:</strong> Deleted when you close your browser</p>
                    <p>• <strong>Authentication:</strong> Usually 24 hours or until logout</p>
                    <p>• <strong>Preferences:</strong> Up to 1 year</p>
                    <p>• <strong>Analytics:</strong> Up to 2 years (anonymized after 14 months)</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">7. Data Protection</h2>
                  <div className="space-y-3">
                    <p>• All cookie data is stored securely</p>
                    <p>• Personal information in cookies is encrypted</p>
                    <p>• We don't share cookie data with unauthorized third parties</p>
                    <p>• Regular security audits ensure data protection</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">8. Updates to This Policy</h2>
                  <p>
                    We may update this cookie policy to reflect changes in our practices or legal requirements. 
                    We'll notify you of significant changes through our website or by email.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
                  <div className="space-y-3">
                    <p>If you have questions about our use of cookies:</p>
                    <p><strong>Company:</strong> APPIDEA LIMITED</p>
                    <p><strong>NZBN:</strong> 9429048533461</p>
                    <p><strong>Address:</strong> 50b Merton Road, St. Johns, Auckland, 1072, New Zealand</p>
                    <p>• Email: <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
                    <p>• Subject: "Cookie Policy Inquiry"</p>
                    <p>• We'll respond within 2 business days</p>
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <p className="text-blue-200 font-medium mb-2">🍪 Your Privacy Matters</p>
                  <p className="text-blue-100 text-sm">
                    We're committed to transparency about how we use cookies. You're always in control 
                    of your privacy preferences, and we'll never use cookies to compromise your security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;
