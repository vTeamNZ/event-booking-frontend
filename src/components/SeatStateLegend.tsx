// 🎯 INDUSTRY STANDARD: Comprehensive Seat Legend
// Shows all possible seat states with visual examples
import React from 'react';
import { Clock, AlertCircle, Check, X, User, Users } from 'lucide-react';

interface SeatLegendItem {
  className: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

interface SeatStateLegendProps {
  className?: string;
  compact?: boolean;
}

export const SeatStateLegend: React.FC<SeatStateLegendProps> = ({
  className = '',
  compact = false
}) => {
  const legendItems: SeatLegendItem[] = [
    {
      className: 'seat-available',
      label: 'Available',
      description: 'Click to select this seat',
      icon: compact ? undefined : <Check className="h-3 w-3" />
    },
    {
      className: 'seat-user-selected',
      label: 'Your Selection',
      description: 'Currently selected by you',
      icon: compact ? undefined : <User className="h-3 w-3" />
    },
    {
      className: 'seat-user-reserved',
      label: 'Your Reservation',
      description: 'Reserved for you with timer',
      icon: compact ? undefined : <Clock className="h-3 w-3" />
    },
    {
      className: 'seat-user-temporary',
      label: 'Temporary Hold',
      description: 'Held temporarily during selection',
      icon: compact ? undefined : <AlertCircle className="h-3 w-3" />
    },
    {
      className: 'seat-other-reserved',
      label: 'Reserved by Others',
      description: 'Not available - reserved by another user',
      icon: compact ? undefined : <Users className="h-3 w-3" />
    },
    {
      className: 'seat-sold',
      label: 'Sold',
      description: 'Not available - already purchased',
      icon: compact ? undefined : <X className="h-3 w-3" />
    },
    {
      className: 'seat-disabled',
      label: 'Not Available',
      description: 'Not bookable (maintenance, restricted, etc.)',
      icon: compact ? undefined : <X className="h-3 w-3" />
    }
  ];

  const SeatExample: React.FC<{ className: string }> = ({ className }) => (
    <div className={`
      w-6 h-6 border-2 rounded-sm flex items-center justify-center text-xs font-bold
      ${className}
    `}>
      {compact ? '' : 'A1'}
    </div>
  );

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg ${className}`}>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <SeatExample className={item.className} />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-xs">?</span>
        </div>
        Seat Selection Guide
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <SeatExample className={item.className} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.icon && (
                  <div className="text-gray-600">
                    {item.icon}
                  </div>
                )}
                <h4 className="font-medium text-gray-900 text-sm">{item.label}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Timer States */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          Timer States
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-6 h-6 border-2 rounded-sm seat-expiring-soon bg-orange-500 border-orange-600"></div>
            <div>
              <h5 className="font-medium text-orange-900 text-sm">Expiring Soon</h5>
              <p className="text-xs text-orange-700">Less than 2 minutes remaining</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-6 h-6 border-2 rounded-sm seat-expired bg-red-500 border-red-600"></div>
            <div>
              <h5 className="font-medium text-red-900 text-sm">Expired</h5>
              <p className="text-xs text-red-700">Reservation time expired</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatStateLegend;
