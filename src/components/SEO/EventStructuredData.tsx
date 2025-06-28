import React, { useEffect } from 'react';

interface EventInfo {
  id: number | string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  venue?: {
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  price?: number;
  imageUrl?: string;
  organizer?: string;
  ticketsAvailable?: number;
}

interface EventStructuredDataProps {
  event: EventInfo;
}

const EventStructuredData: React.FC<EventStructuredDataProps> = ({ event }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      '@type': 'Place',
      name: event.venue?.name || event.location || 'Event Venue',
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue?.address || '',
        addressLocality: event.venue?.city || 'New Zealand',
        postalCode: event.venue?.postalCode || '',
        addressCountry: 'NZ'
      }
    },
    image: event.imageUrl ? (event.imageUrl.startsWith('http') ? event.imageUrl : `https://kiwilanka.co.nz${event.imageUrl}`) : 'https://kiwilanka.co.nz/kiwilanka-logo-main.png',    offers: {
      '@type': 'Offer',
      price: event.price || 0,
      priceCurrency: 'NZD',
      url: `https://kiwilanka.co.nz/event/${encodeURIComponent(event.title.toLowerCase().replace(/\s+/g, '-'))}`,
      availability: (event.ticketsAvailable && event.ticketsAvailable > 0) 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut'
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer || 'KiwiLanka Events',
      url: 'https://kiwilanka.co.nz'
    }
  };  useEffect(() => {
    // Add or update schema.org script tag for structured data
    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    
    scriptTag.textContent = JSON.stringify(structuredData);
    
    // Clean up when component unmounts
    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [structuredData]);
  
  return null;
};

export default EventStructuredData;
