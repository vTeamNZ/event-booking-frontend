import React from 'react';
import SEO from '../components/SEO';

const RefundPolicy: React.FC = () => {
  return (
    <>
      <SEO 
        title="Refund Policy - KiwiLanka Ticketing Platform"
        description="Refund and cancellation policy for ticket purchases."
        keywords={['refund', 'policy', 'cancellation', 'money back']}
      />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Refund Policy</h1>
              <p className="text-gray-400 mb-8">Last updated: July 31, 2025</p>
              
              <div className="space-y-8 text-gray-300">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">1. Overview</h2>
                  <p className="mb-4">
                    We strive to provide excellent service and customer satisfaction. This refund policy 
                    outlines the conditions under which refunds may be granted for ticket purchases.
                  </p>
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      <strong>Important:</strong> Refund policies may vary by event organizer. 
                      Always check the specific event's refund policy before booking.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">2. Standard Refund Conditions</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-green-200 mb-3">✓ Full Refund Guaranteed</h3>
                      <div className="space-y-2 text-green-100">
                        <p>• Event cancelled by organizer</p>
                        <p>• Event postponed without suitable alternative</p>
                        <p>• Venue changed significantly</p>
                        <p>• Technical error in our booking system</p>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-yellow-200 mb-3">⚠ Partial Refund (Minus Processing Fees)</h3>
                      <div className="space-y-2 text-yellow-100">
                        <p>• Cancellation more than 7 days before event</p>
                        <p>• Event details changed significantly</p>
                        <p>• Duplicate booking (our error)</p>
                      </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-red-200 mb-3">✗ No Refund</h3>
                      <div className="space-y-2 text-red-100">
                        <p>• Cancellation within 7 days of event</p>
                        <p>• No-show at event</p>
                        <p>• Personal circumstances preventing attendance</p>
                        <p>• Weather conditions (unless event cancelled)</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Processing Fees</h2>
                  <div className="space-y-3">
                    <p>• Processing fees are generally non-refundable</p>
                    <p>• Stripe processing fees: 2.9% + $0.30 per transaction</p>
                    <p>• Platform service fees may apply (displayed at checkout)</p>
                    <p>• Processing fees are waived for event organizer cancellations</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">4. Refund Process</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Step 1: Request Refund</h3>
                      <div className="space-y-2">
                        <p><strong>Company:</strong> APPIDEA LIMITED (NZBN: 9429048533461)</p>
                        <p>• Email: <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
                        <p>• Subject: "Refund Request - [Booking ID]"</p>
                        <p>• Include booking details and reason for refund</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Step 2: Review Process</h3>
                      <div className="space-y-2">
                        <p>• We review all requests within 2-3 business days</p>
                        <p>• You'll receive an email confirmation of our decision</p>
                        <p>• Additional documentation may be requested</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Step 3: Refund Processing</h3>
                      <div className="space-y-2">
                        <p>• Approved refunds are processed within 5-10 business days</p>
                        <p>• Refunds return to your original payment method</p>
                        <p>• Bank processing times may add 3-5 additional days</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">5. Special Circumstances</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Medical Emergencies</h3>
                      <p>Refunds may be considered for serious medical emergencies with appropriate documentation.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Travel Restrictions</h3>
                      <p>Government-imposed travel restrictions may qualify for refund consideration.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Force Majeure</h3>
                      <p>Events beyond reasonable control (natural disasters, pandemics) will be handled case-by-case.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">6. Alternative Options</h2>
                  <div className="space-y-3">
                    <p>• <strong>Event Transfer:</strong> Some organizers allow ticket transfers to future events</p>
                    <p>• <strong>Name Changes:</strong> Ticket holder name changes (subject to organizer approval)</p>
                    <p>• <strong>Seat Changes:</strong> Seat upgrades or changes (where available)</p>
                    <p>• <strong>Credit Notes:</strong> Platform credit for future bookings</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">7. Organizer-Specific Policies</h2>
                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                    <p className="text-amber-200 mb-3">
                      <strong>Important Notice:</strong> Individual event organizers may have their own refund policies 
                      that supersede our standard policy.
                    </p>
                    <div className="space-y-2 text-amber-100">
                      <p>• Always check event-specific terms before booking</p>
                      <p>• Organizer policies are displayed on the event page</p>
                      <p>• Contact the organizer directly for policy clarifications</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">8. Disputes</h2>
                  <div className="space-y-3">
                    <p>• If you're not satisfied with our refund decision, you may appeal</p>
                    <p>• Appeals should be submitted within 14 days of our decision</p>
                    <p>• Include additional evidence or circumstances</p>
                    <p>• Final decisions will be made by our customer service manager</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">9. Consumer Rights</h2>
                  <p>
                    This policy doesn't affect your statutory rights under New Zealand consumer law. 
                    You may be entitled to additional remedies under the Consumer Guarantees Act 1993.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
                  <div className="space-y-3">
                    <p>For refund requests and questions:</p>
                    <p><strong>Company:</strong> APPIDEA LIMITED</p>
                    <p><strong>NZBN:</strong> 9429048533461</p>
                    <p><strong>Address:</strong> 50b Merton Road, St. Johns, Auckland, 1072, New Zealand</p>
                    <p>• Email: <a href="mailto:support@kiwilanka.co.nz" className="text-blue-400 hover:text-blue-300">support@kiwilanka.co.nz</a></p>
                    <p>• Business hours: Monday to Friday, 9:00 AM - 5:00 PM NZST</p>
                    <p>• Response time: Within 48 hours</p>
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                  <p className="text-green-200 font-medium mb-2">🛡️ Money-Back Guarantee</p>
                  <p className="text-green-100 text-sm">
                    We stand behind our service. If an event is cancelled by the organizer, 
                    you'll receive a full refund including all fees - guaranteed.
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

export default RefundPolicy;
