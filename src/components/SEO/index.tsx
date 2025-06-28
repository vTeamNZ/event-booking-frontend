import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  canonical?: string;
  article?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = '/kiwilanka-logo-main.png',
  keywords,
  canonical,
  article = false,
}) => {
  const location = useLocation();
  const siteTitle = title ? `${title} | KiwiLanka Events` : 'Book NZ Events Easily Online | KiwiLanka Events';
  
  // Default description from your provided text
  const defaultDescription = 'Discover and book Sri Lankan community events across New Zealand. Pay online with Stripe. Get instant email confirmations after your booking.';
  const metaDescription = description || defaultDescription;
  
  // Default keywords from your provided list
  const defaultKeywords = [
    'Book NZ Events Easily Online',
    'Find Sri Lankan Events NZ',
    'Secure Your Event Tickets',
    'Instant Ticket Booking',
    'Pay Securely With Stripe',
    'Book Food With Your Ticket',
    'New Zealand Events Hub',
    'Easy Event Ticketing',
    'Browse Local Events Now',
    'Events You\'ll Love',
    'Enjoy Food + Entertainment',
    'Events for Everyone in NZ',
    'Hassle-Free Booking',
    'Get Notified of Top Events',
    'Support Community Events'
  ];
  
  const metaKeywords = keywords 
    ? [...keywords, ...defaultKeywords].slice(0, 10).join(', ') 
    : defaultKeywords.join(', ');
  
  // URLs
  const baseUrl = 'https://kiwilanka.co.nz';
  const currentUrl = canonical || `${baseUrl}${location.pathname}`;
  
  // Image
  const seoImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Update document head directly using useEffect
  useEffect(() => {
    // Set title
    document.title = siteTitle;
    
    // Function to create or update meta tag
    const setMetaTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = name;
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    // Function to create or update meta property tags (like Open Graph)
    const setMetaProperty = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    // Function to set canonical link
    const setCanonical = (href: string) => {
      let linkTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.rel = 'canonical';
        document.head.appendChild(linkTag);
      }
      linkTag.href = href;
    };

    // Apply all meta tags
    // Basic meta tags
    setMetaTag('description', metaDescription);
    setMetaTag('keywords', metaKeywords);
    
    // Standard meta tags
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('author', 'KiwiLanka Events');
    
    // Canonical URL
    setCanonical(currentUrl);
    
    // Open Graph / Facebook
    setMetaProperty('og:type', article ? 'article' : 'website');
    setMetaProperty('og:url', currentUrl);
    setMetaProperty('og:title', siteTitle);
    setMetaProperty('og:description', metaDescription);
    setMetaProperty('og:image', seoImage);
    setMetaProperty('og:site_name', 'KiwiLanka Events');
    
    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', currentUrl);
    setMetaTag('twitter:title', siteTitle);
    setMetaTag('twitter:description', metaDescription);
    setMetaTag('twitter:image', seoImage);
    
    // HTTP equiv
    let httpEquivTag = document.querySelector('meta[http-equiv="Content-Type"]') as HTMLMetaElement;
    if (!httpEquivTag) {
      httpEquivTag = document.createElement('meta');
      httpEquivTag.setAttribute('http-equiv', 'Content-Type');
      document.head.appendChild(httpEquivTag);
    }
    httpEquivTag.content = 'text/html; charset=utf-8';
  }, [siteTitle, metaDescription, metaKeywords, currentUrl, seoImage, article]);

  // No need to render anything as we're directly manipulating the document head
  return null;
};

export default SEO;
