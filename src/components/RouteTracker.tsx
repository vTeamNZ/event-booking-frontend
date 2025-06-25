import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Declare gtag as a global function available on window
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'AW-17215959436', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  // This component doesn't render anything
  return null;
};

export default RouteTracker;
