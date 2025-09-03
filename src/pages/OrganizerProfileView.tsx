import React from 'react';
import { useLocation } from 'react-router-dom';
import UnderDevelopment from '../components/UnderDevelopment';

const OrganizerProfileView: React.FC = () => {
  const location = useLocation();
  
  // Determine the specific page based on the URL
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path.includes('/profile/edit')) {
      return {
        title: "Organizer Profile Editor",
        description: "The organizer profile editing feature is currently under development.",
        features: [
          "Edit organizer name and contact information",
          "Update email and phone number",
          "Manage social media links",
          "Upload organizer logo and profile images"
        ]
      };
    } else if (path.includes('/profile')) {
      return {
        title: "Organizer Profile",
        description: "The organizer profile view is currently under development.",
        features: [
          "View organizer information",
          "Display contact details",
          "Show social media links",
          "Display verification status"
        ]
      };
    } else if (path.includes('/settings')) {
      return {
        title: "Organizer Settings",
        description: "The organizer settings page is currently under development.",
        features: [
          "Notification preferences",
          "Account security settings",
          "Privacy controls",
          "Integration settings"
        ]
      };
    } else if (path.includes('/events/edit')) {
      return {
        title: "Edit Event",
        description: "The event editing feature is currently under development.",
        features: [
          "Edit event details",
          "Update event description and images",
          "Modify ticket types and pricing",
          "Manage event settings"
        ]
      };
    } else {
      return {
        title: "Organizer Feature",
        description: "This organizer feature is currently under development.",
        features: [
          "Enhanced organizer tools",
          "Improved user experience",
          "Advanced functionality",
          "Better performance"
        ]
      };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <UnderDevelopment
      title={pageInfo.title}
      description={pageInfo.description}
      expectedFeatures={pageInfo.features}
    />
  );
};

export default OrganizerProfileView;
