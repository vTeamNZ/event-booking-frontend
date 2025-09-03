import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const OrganizerSalesDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to enhanced dashboard
    navigate('/organizer/sales-enhanced');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white mb-4">Redirecting to enhanced dashboard...</p>
      </div>
    </div>
  );
};

export default OrganizerSalesDashboard;
