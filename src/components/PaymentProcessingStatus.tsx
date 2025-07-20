import React from 'react';

interface EmailDeliveryResult {
  success: boolean;
  errorMessage?: string;
  sentAt?: string;
  recipientEmail: string;
  emailType: string;
}

interface QRGenerationResult {
  seatNumber: string;
  success: boolean;
  ticketPath?: string;
  bookingId?: string;
  errorMessage?: string;
  customerEmailResult: EmailDeliveryResult;
  organizerEmailResult: EmailDeliveryResult;
}

interface ProcessingSummary {
  totalTickets: number;
  successfulQRGenerations: number;
  failedQRGenerations: number;
  successfulCustomerEmails: number;
  failedCustomerEmails: number;
  successfulOrganizerEmails: number;
  failedOrganizerEmails: number;
  allQRGenerationsSuccessful: boolean;
  allCustomerEmailsSuccessful: boolean;
  allOrganizerEmailsSuccessful: boolean;
  hasAnyFailures: boolean;
}

interface PaymentProcessingStatusProps {
  qrResults: QRGenerationResult[];
  processingSummary: ProcessingSummary;
}

const PaymentProcessingStatus: React.FC<PaymentProcessingStatusProps> = ({ 
  qrResults, 
  processingSummary 
}) => {
  const getStatusIcon = (success: boolean) => {
    return success ? (
      <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Status</h3>
      
      {/* Overall Summary */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">QR Tickets:</span>
            <div className="flex items-center">
              {getStatusIcon(processingSummary.allQRGenerationsSuccessful)}
              <span className={`ml-1 font-medium ${processingSummary.allQRGenerationsSuccessful ? 'text-success' : 'text-error'}`}>
                {processingSummary.successfulQRGenerations}/{processingSummary.totalTickets}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Customer Emails:</span>
            <div className="flex items-center">
              {getStatusIcon(processingSummary.allCustomerEmailsSuccessful)}
              <span className={`ml-1 font-medium ${processingSummary.allCustomerEmailsSuccessful ? 'text-success' : 'text-error'}`}>
                {processingSummary.successfulCustomerEmails}/{processingSummary.totalTickets}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Organizer Emails:</span>
            <div className="flex items-center">
              {getStatusIcon(processingSummary.allOrganizerEmailsSuccessful)}
              <span className={`ml-1 font-medium ${processingSummary.allOrganizerEmailsSuccessful ? 'text-success' : 'text-error'}`}>
                {processingSummary.successfulOrganizerEmails}/{processingSummary.totalTickets}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status Message */}
        {processingSummary.hasAnyFailures && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-warning mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-warning">Some operations encountered issues</span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Results per Ticket */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Detailed Status by Ticket</h4>
        {qrResults.map((qr, index) => (
          <div key={index} className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">Seat/Ticket: {qr.seatNumber}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                qr.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
              }`}>
                QR: {qr.success ? '✓ Generated' : '✗ Failed'}
              </span>
            </div>
            
            {/* QR Generation Status */}
            {!qr.success && qr.errorMessage && (
              <div className="mb-3 p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
                QR Error: {qr.errorMessage}
              </div>
            )}
            
            {/* Email Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Customer Email:</span>
                <div className="flex items-center">
                  {getStatusIcon(qr.customerEmailResult.success)}
                  <span className={`ml-1 ${qr.customerEmailResult.success ? 'text-success' : 'text-error'}`}>
                    {qr.customerEmailResult.success ? 'Sent' : 'Failed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Organizer Email:</span>
                <div className="flex items-center">
                  {getStatusIcon(qr.organizerEmailResult.success)}
                  <span className={`ml-1 ${qr.organizerEmailResult.success ? 'text-success' : 'text-error'}`}>
                    {qr.organizerEmailResult.success ? 'Sent' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Email Error Messages */}
            {!qr.customerEmailResult.success && qr.customerEmailResult.errorMessage && (
              <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
                Customer Email Error: {qr.customerEmailResult.errorMessage}
              </div>
            )}
            
            {!qr.organizerEmailResult.success && qr.organizerEmailResult.errorMessage && (
              <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
                Organizer Email Error: {qr.organizerEmailResult.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Action Items for Failures */}
      {processingSummary.hasAnyFailures && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">What to do next:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {processingSummary.failedQRGenerations > 0 && (
              <li>• Contact support to regenerate failed QR tickets</li>
            )}
            {processingSummary.failedCustomerEmails > 0 && (
              <li>• Customer emails failed - tickets may need to be resent manually</li>
            )}
            {processingSummary.failedOrganizerEmails > 0 && (
              <li>• Organizer notifications failed - they may need manual notification</li>
            )}
            <li>• Your booking is confirmed regardless of email delivery issues</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessingStatus;
