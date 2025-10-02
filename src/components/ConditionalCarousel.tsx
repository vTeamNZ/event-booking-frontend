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
  
  // Define known non-event routes (routes that are definitely NOT direct event pages)
  const knownRoutes = [
    '/',
    '/about',
    '/contact', 
    '/login',
    '/register',
    '/my-bookings',
    '/booking/',
    '/organizer/',
    '/admin/',
    '/terms-and-conditions',
    '/privacy-policy',
    '/refund-policy',
    '/cookie-policy'
  ];
  
  // Check if current path is an event-specific route
  const isEventSpecificPage = eventSpecificRoutes.some(route => 
    location.pathname.includes(route)
  );
  
  // Check if current path is a known non-event route
  const isKnownRoute = knownRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );
  
  // If it's an event-specific page, don't show carousel
  if (isEventSpecificPage) {
    return null;
  }
  
  // If it's not a known route, assume it's a direct event slug route and don't show carousel
  if (!isKnownRoute) {
    return null;
  }
  
  // Show carousel on general pages (home, about, contact, etc.)
  return <HeroCarousel />;
};

export default ConditionalCarousel;
