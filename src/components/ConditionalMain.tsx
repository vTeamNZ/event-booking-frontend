import React from 'react';
import { useLocation } from 'react-router-dom';

interface ConditionalMainProps {
  children: React.ReactNode;
}

const ConditionalMain: React.FC<ConditionalMainProps> = ({ children }) => {
  const location = useLocation();
  
  // Define routes where we want reduced padding (event-specific pages)
  const eventSpecificRoutes = [
    '/event/',           // Any event route
    '/food-selection',   // Legacy food selection route
    '/payment-summary',
    '/payment',
    '/checkout'
  ];
  
  // Check if current path is an event-specific route
  const isEventSpecificPage = eventSpecificRoutes.some(route => 
    location.pathname.includes(route)
  );
  
  // Use different padding for event pages vs general pages
  const paddingClass = isEventSpecificPage ? 'py-4' : 'py-10';
  
  return (
    <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingClass}`}>
      {children}
    </main>
  );
};

export default ConditionalMain;
