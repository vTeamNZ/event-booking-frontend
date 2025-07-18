import React from 'react';
import { useLocation } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';

const ConditionalCarousel: React.FC = () => {
  const location = useLocation();
  
  // Define routes where carousel should NOT be shown (event-specific pages)
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
  
  // Don't show carousel on event-specific pages
  if (isEventSpecificPage) {
    return null;
  }
  
  // Show carousel on general pages (home, about, contact, etc.)
  return <HeroCarousel />;
};

export default ConditionalCarousel;
