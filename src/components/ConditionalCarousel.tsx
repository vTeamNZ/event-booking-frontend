import React from 'react';
import { useLocation } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';

const ConditionalCarousel: React.FC = () => {
  const location = useLocation();
  
  // Define routes where carousel should NOT be shown (event-specific pages)
  const eventSpecificRoutes = [
    '/event/',           // Any event route (covers /event/:title/tickets, /event/:title/seats, etc.)
    '/food-selection',   // Legacy food selection route
    '/payment-summary',
    '/payment',
    '/checkout'
  ];
  
  // Define general pages where carousel SHOULD be shown
  const generalPageRoutes = [
    '/',
    '/events',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/organizer',
    '/admin'
  ];
  
  // Check if current path is an event-specific route
  const isEventSpecificPage = eventSpecificRoutes.some(route => 
    location.pathname.includes(route)
  );
  
  // Check if current path is a general page route
  const isGeneralPage = generalPageRoutes.some(route => 
    location.pathname === route || (route !== '/' && location.pathname.startsWith(route))
  );
  
  // Special check for event detail pages (any path that doesn't match general pages and isn't home)
  const isEventDetailPage = !isGeneralPage && 
                           !isEventSpecificPage && 
                           location.pathname !== '/' &&
                           !location.pathname.startsWith('/admin') &&
                           !location.pathname.startsWith('/organizer') &&
                           !location.pathname.startsWith('/my-bookings') &&
                           !location.pathname.startsWith('/booking/');
  
  // Show carousel only on general pages, not on event-specific pages or event details pages
  if (isEventSpecificPage || isEventDetailPage) {
    return null;
  }
  
  // Show carousel on general pages (home, about, contact, etc.)
  return <HeroCarousel />;
};

export default ConditionalCarousel;
