import React from 'react';
import { useLocation } from 'react-router-dom';
import UnderDevelopment from '../components/UnderDevelopment';

const AdminPageUnderDevelopment: React.FC = () => {
  const location = useLocation();
  
  // Determine the specific admin page based on the URL
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/reports')) {
      return {
        title: "Admin Reports",
        description: "The comprehensive admin reporting system is currently under development.",
        features: [
          "Advanced analytics and reporting",
          "Custom report generation",
          "Data export capabilities",
          "Scheduled reports",
          "Visual charts and graphs"
        ]
      };
    } else if (path.includes('/admin/settings')) {
      return {
        title: "Admin Settings",
        description: "The admin settings panel is currently under development.",
        features: [
          "System configuration options",
          "Global application settings",
          "Security and access controls",
          "Email and notification settings",
          "Integration management"
        ]
      };
    } else if (path.includes('/admin/payments')) {
      return {
        title: "Payment Management",
        description: "The payment management system is currently under development.",
        features: [
          "Payment transaction monitoring",
          "Refund and dispute management",
          "Payment gateway configuration",
          "Financial reporting",
          "Fee and commission settings"
        ]
      };
    } else if (path.includes('/admin/audit')) {
      return {
        title: "Audit Logs",
        description: "The audit logging system is currently under development.",
        features: [
          "User activity tracking",
          "System change logs",
          "Security event monitoring",
          "Compliance reporting",
          "Log search and filtering"
        ]
      };
    } else {
      return {
        title: "Admin Feature",
        description: "This admin feature is currently under development.",
        features: [
          "Advanced admin tools",
          "Enhanced management capabilities",
          "Improved monitoring",
          "Better system controls"
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

export default AdminPageUnderDevelopment;
