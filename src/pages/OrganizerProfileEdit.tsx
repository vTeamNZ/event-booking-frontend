import React from 'react';
import UnderDevelopment from '../components/UnderDevelopment';

const OrganizerProfileEdit: React.FC = () => {
  return (
    <UnderDevelopment
      title="Organizer Profile Editor"
      description="The organizer profile editing feature is currently under development. Soon you'll be able to update your organizer information, contact details, and social media links."
      expectedFeatures={[
        "Edit organizer name and contact information",
        "Update email and phone number",
        "Manage social media links (Facebook, YouTube, Website)",
        "Upload organizer logo and profile images",
        "Edit organization details and bio",
        "Manage verification status and documents",
        "Update notification preferences",
        "Preview changes before saving"
      ]}
    />
  );
};

export default OrganizerProfileEdit;
