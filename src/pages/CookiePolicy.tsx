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
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="bg-white border border-gray-300 shadow-lg">
            <div className="p-12">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif text-gray-900 mb-4">COOKIE POLICY</h1>
                <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-6"></div>
                <p className="text-gray-600 font-medium">KiwiLanka / AppIdea Limited</p>
                <p className="text-gray-600 font-medium">Last Updated: 31 July 2025</p>
              </div>
              
              <div className="space-y-12 text-gray-800 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">1. What Are Cookies?</h2>
                  <p>
                    Cookies are small text files that are stored on your device when you visit our website. 
                    They help us provide you with a better browsing experience and enable certain features 
                    of our ticketing platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">2. Types of Cookies We Use</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 border border-gray-300 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
                      <p className="mb-4">These cookies are necessary for the website to function properly.</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Authentication:</strong> Keep you logged in during your session</li>
                        <li><strong>Shopping Cart:</strong> Remember your selected tickets and seats</li>
                        <li><strong>Security:</strong> Protect against cross-site request forgery</li>
                        <li><strong>Preferences:</strong> Remember your language and display settings</li>
                      </ul>
                      <p className="mt-3 italic text-gray-600">These cookies cannot be disabled as they are essential for site functionality.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-300 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
                      <p className="mb-4">Help us understand how visitors use our website.</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Usage Statistics:</strong> Page views, session duration, bounce rate</li>
                        <li><strong>Performance:</strong> Loading times and error tracking</li>
                        <li><strong>User Flow:</strong> How users navigate through our booking process</li>
                        <li><strong>Popular Content:</strong> Most viewed events and pages</li>
                      </ul>
                      <p className="mt-3 italic text-gray-600">This data is anonymized and used to improve our service.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-300 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Functional Cookies</h3>
                      <p className="mb-4">Enhance your experience with personalized features.</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Recent Searches:</strong> Remember your recent event searches</li>
                        <li><strong>Favorites:</strong> Save your favorite events and organizers</li>
                        <li><strong>Location:</strong> Remember your preferred location/city</li>
                        <li><strong>Display Preferences:</strong> Theme, layout, and accessibility settings</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">3. Third-Party Cookies</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Stripe (Payment Processing)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Used for secure payment processing</li>
                        <li>Fraud detection and prevention</li>
                        <li>PCI DSS compliant security measures</li>
                        <li>Read <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Stripe's Privacy Policy</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Google Analytics (Optional)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Website traffic analysis</li>
                        <li>User behavior insights (anonymized)</li>
                        <li>Performance monitoring</li>
                        <li>Can be disabled through cookie preferences</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">4. Managing Your Cookie Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Settings</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                        <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                        <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                        <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Cookie Consent Banner</h3>
                      <p className="mb-3">When you first visit our site, you'll see a cookie consent banner where you can:</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Accept all cookies</li>
                        <li>Accept only essential cookies</li>
                        <li>Customize your preferences</li>
                        <li>Change your preferences later in site settings</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">5. Impact of Disabling Cookies</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border-l-4 border-red-400 p-6">
                      <h3 className="text-xl font-semibold text-red-800 mb-3">If You Disable Essential Cookies</h3>
                      <ul className="list-disc list-inside space-y-2 text-red-700">
                        <li>You won't be able to log in or maintain your session</li>
                        <li>Shopping cart functionality will not work</li>
                        <li>Payment processing will be unavailable</li>
                        <li>Site may not function properly</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-400 p-6">
                      <h3 className="text-xl font-semibold text-orange-800 mb-3">If You Disable Analytics Cookies</h3>
                      <ul className="list-disc list-inside space-y-2 text-orange-700">
                        <li>Site will function normally</li>
                        <li>We won't be able to improve user experience as effectively</li>
                        <li>Performance issues may take longer to identify</li>
                        <li>Your usage data won't contribute to site improvements</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">6. Cookie Retention</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                    <li><strong>Authentication:</strong> Usually 24 hours or until logout</li>
                    <li><strong>Preferences:</strong> Up to 1 year</li>
                    <li><strong>Analytics:</strong> Up to 2 years (anonymized after 14 months)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">7. Data Protection</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>All cookie data is stored securely</li>
                    <li>Personal information in cookies is encrypted</li>
                    <li>We don't share cookie data with unauthorized third parties</li>
                    <li>Regular security audits ensure data protection</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">8. Updates to This Policy</h2>
                  <p>
                    We may update this cookie policy to reflect changes in our practices or legal requirements. 
                    We'll notify you of significant changes through our website or by email.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">9. Contact</h2>
                  <p className="mb-4">If you have questions about our use of cookies:</p>
                  <div className="bg-gray-50 p-6 border border-gray-300">
                    <p className="font-semibold text-lg mb-2">KiwiLanka / AppIdea Limited</p>
                    <p className="mb-1"><strong>NZBN:</strong> 9429048533461</p>
                    <p className="mb-1"><strong>Address:</strong> 50b Merton Road, St Johns, Auckland 1072, New Zealand</p>
                    <p className="mb-1"><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                    <p className="mb-1"><strong>Subject:</strong> "Cookie Policy Inquiry"</p>
                    <p><strong>Response Time:</strong> Within 2 business days</p>
                  </div>
                </section>

                <section className="bg-blue-50 p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">🍪 Your Privacy Matters</h3>
                  <p className="text-blue-700">
                    We're committed to transparency about how we use cookies. You're always in control 
                    of your privacy preferences, and we'll never use cookies to compromise your security.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;
