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
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="bg-white border border-gray-300 shadow-lg">
            <div className="p-12">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif text-gray-900 mb-4">REFUND POLICY</h1>
                <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-6"></div>
                <p className="text-gray-600 font-medium">Last Updated: 31 July 2025</p>
              </div>
              
              <div className="space-y-12 text-gray-800 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">1. Scope of Application</h2>
                  <p className="mb-4">
                    This policy applies to all ticket sales completed via the KiwiLanka platform. KiwiLanka acts as an authorized ticketing agent on behalf of independent event organizers (Organizers). Each Organizer may define their own refund conditions; however, all refund terms are subject to minimum standards imposed by New Zealand consumer law, which cannot be waived or excluded.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">2. Eligibility for Refunds</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">a. Full Refunds</h3>
                    <p className="mb-3">Customers will be entitled to a full refund of the ticket price and any applicable service or processing fees under the following circumstances:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The event is cancelled and will not be rescheduled.</li>
                      <li>The event is rescheduled to a date or venue that materially differs, and the customer cannot or does not wish to attend the new date or location.</li>
                      <li>The ticket was issued due to a technical or processing error caused by the platform.</li>
                    </ul>
                    <p className="mt-3 italic">No action is generally required from the ticket-holder for cancelled events; refunds will be processed automatically where possible.</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">b. Partial Refunds</h3>
                    <p className="mb-3">In the following scenarios, partial refunds may be granted at our discretion or with the Organizer's approval:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The event is postponed or rescheduled and the customer is unable to attend the new date.</li>
                      <li>The event details (such as venue or headline performer) are significantly modified.</li>
                      <li>A duplicate booking was created in error.</li>
                    </ul>
                    <p className="mt-3">In such cases, any third-party non-refundable costs (e.g., payment processor fees) may be deducted from the refund amount. Customers will be advised of any applicable deductions prior to finalisation.</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">c. Non-Refundable Scenarios</h3>
                    <p className="mb-3">Refunds will not be provided under the following circumstances:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The customer fails to attend the event (no-show).</li>
                      <li>The customer changes their mind or experiences personal circumstances (e.g. illness, travel delays, scheduling conflicts) that prevent attendance.</li>
                      <li>Admittance is denied due to failure to comply with entry conditions (e.g. age limits, dress code, health mandates).</li>
                      <li>Weather-related disruptions where the event still proceeds.</li>
                    </ul>
                    <p className="mt-3">Requests falling within these scenarios will not be accepted unless the Organizer elects to override the policy or New Zealand law requires otherwise.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">3. Force Majeure</h2>
                  <p className="mb-4">
                    Where an event is disrupted, delayed, or cancelled due to circumstances beyond the control of the Organizer or KiwiLanka (including but not limited to natural disasters, pandemic-related restrictions, acts of government, or emergency public health orders), KiwiLanka shall not be held liable for any loss beyond the face value of the ticket(s) and applicable fees.
                  </p>
                  <p className="mb-3">In such instances, the customer may be offered:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>A full refund (if the event is cancelled outright)</li>
                    <li>An option to attend a rescheduled event or claim a credit</li>
                    <li>A refund of the ticket price only (excluding certain third-party charges, where allowed)</li>
                  </ul>
                  <p className="italic">This provision does not affect the customer's statutory rights under the Consumer Guarantees Act.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">4. Refund Request Procedure</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 1: Submission of Refund Request</h3>
                    <p className="mb-3">To request a refund, the customer must submit a written request via email to:</p>
                    <div className="bg-gray-50 p-4 border-l-4 border-gray-400 mb-4">
                      <p><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                      <p><strong>Subject Line:</strong> Refund Request – [Your Booking ID]</p>
                    </div>
                    <p className="mb-3">The request must include the following:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                      <li>Full name and contact information</li>
                      <li>Event name and scheduled date</li>
                      <li>Booking ID or ticket reference number</li>
                      <li>Reason for the refund</li>
                      <li>Any supporting evidence (e.g. cancellation notice, medical certificate, etc.)</li>
                    </ul>
                    <p>Requests must be submitted as soon as practicable after the grounds for refund arise and no later than 14 calendar days from the original event date, unless otherwise specified by KiwiLanka or the Organizer.</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2: Review and Determination</h3>
                    <p className="mb-3">All valid refund requests will be reviewed within three (3) business days of receipt. KiwiLanka may consult the Organizer to verify eligibility and determine whether the request satisfies applicable refund criteria.</p>
                    <p>We reserve the right to request additional documentation to support the claim. The customer will be notified in writing of the outcome.</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3: Refund Processing</h3>
                    <p className="mb-3">For approved refunds:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                      <li>The refund will be issued to the original payment method used for the purchase.</li>
                      <li>Refunds will be processed within 5 to 10 business days from the date of approval.</li>
                      <li>Please allow an additional 3 to 5 business days for the amount to reflect in your account, depending on your card issuer or payment processor.</li>
                    </ul>
                    <p>All refund transactions will be documented, and an electronic receipt will be provided to the customer upon processing.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">5. Processing Fees</h2>
                  <p className="mb-4">
                    Where a refund is initiated due to event cancellation or platform error, all service, booking, and payment processing fees will be refunded in full.
                  </p>
                  <p>
                    Where a refund is granted at the discretion of the Organizer or KiwiLanka for other reasons, Stripe processing fees (typically 2.9% + NZD 0.30) and platform administrative charges may be excluded from the refunded amount. Any such deductions will be disclosed in writing prior to confirmation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">6. Alternative Resolutions</h2>
                  <p className="mb-3">In cases where a refund is not available, KiwiLanka may — subject to Organizer approval — offer one or more of the following alternatives:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>Ticket transfer to another individual</li>
                    <li>Seat upgrade or date exchange (if applicable)</li>
                    <li>Credit for a future event hosted by the same organizer</li>
                  </ul>
                  <p>These options are not guaranteed and are subject to availability and operational feasibility.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">7. Dispute Resolution</h2>
                  <p className="mb-4">
                    If a customer is dissatisfied with the outcome of a refund request, they may submit an appeal to the KiwiLanka Customer Service Manager within seven (7) calendar days of the initial decision.
                  </p>
                  <p className="mb-3">Appeals must include:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>The original refund request</li>
                    <li>Additional justification or documentation</li>
                  </ul>
                  <p>The appeal decision will be final and communicated in writing within five (5) business days.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">8. Your Rights</h2>
                  <p className="mb-4">
                    Nothing in this Refund Policy is intended to exclude or limit your rights under the Consumer Guarantees Act 1993, the Fair Trading Act 1986, or any other applicable legislation.
                  </p>
                  <p>You are entitled to a refund where the service you paid for is not supplied or is materially different from what was advertised.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">9. Contact</h2>
                  <div className="bg-gray-50 p-6 border border-gray-300">
                    <p className="font-semibold text-lg mb-2">KiwiLanka / AppIdea Limited</p>
                    <p className="mb-1"><strong>NZBN:</strong> 9429048533461</p>
                    <p className="mb-1"><strong>Address:</strong> 50b Merton Road, St Johns, Auckland 1072, New Zealand</p>
                    <p className="mb-1"><strong>Email:</strong> <a href="mailto:support@kiwilanka.co.nz" className="text-blue-600 hover:text-blue-800 underline">support@kiwilanka.co.nz</a></p>
                    <p className="mb-1"><strong>Business Hours:</strong> Monday to Friday, 9:00 AM – 5:00 PM NZST</p>
                    <p><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                </section>

                <section className="bg-green-50 p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Service Commitment</h3>
                  <p className="text-green-700">
                    In the event of a cancellation by the Organizer, KiwiLanka guarantees a full refund to all ticket holders, including booking and service fees.
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

export default RefundPolicy;
