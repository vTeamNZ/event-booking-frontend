import React from 'react';

interface ProcessingFeeRevenueData {
  totalProcessingFeesCollected: number;
  totalBookingsWithFees: number;
  totalEventsWithFeesEnabled: number;
  averageProcessingFee: number;
  thisMonthFees: number;
  lastMonthFees: number;
  monthOverMonthGrowth: number;
}

interface Props {
  data: ProcessingFeeRevenueData;
}

const ProcessingFeeSummaryCards: React.FC<Props> = ({ data }) => {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to get growth indicator
  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return { color: 'text-green-600', icon: '↗️', prefix: '+' };
    } else if (growth < 0) {
      return { color: 'text-red-600', icon: '↘️', prefix: '' };
    } else {
      return { color: 'text-gray-600', icon: '➡️', prefix: '' };
    }
  };

  const growthIndicator = getGrowthIndicator(data.monthOverMonthGrowth);

  const cards = [
    {
      title: 'Total Processing Fees Collected',
      value: formatCurrency(data.totalProcessingFeesCollected),
      icon: '💰',
      color: 'bg-green-500',
      description: 'All-time processing fee revenue',
      trend: null
    },
    {
      title: 'This Month\'s Fees',
      value: formatCurrency(data.thisMonthFees),
      icon: '📈',
      color: 'bg-blue-500',
      description: 'Current month revenue',
      trend: {
        value: `${growthIndicator.prefix}${Math.abs(data.monthOverMonthGrowth).toFixed(1)}%`,
        color: growthIndicator.color,
        icon: growthIndicator.icon,
        label: 'vs last month'
      }
    },
    {
      title: 'Average Processing Fee',
      value: formatCurrency(data.averageProcessingFee),
      icon: '📊',
      color: 'bg-purple-500',
      description: 'Per booking average',
      trend: null
    },
    {
      title: 'Bookings with Fees',
      value: data.totalBookingsWithFees.toLocaleString(),
      icon: '🎫',
      color: 'bg-indigo-500',
      description: 'Total processed bookings',
      trend: null
    },
    {
      title: 'Events with Fees Enabled',
      value: data.totalEventsWithFeesEnabled.toString(),
      icon: '⚙️',
      color: 'bg-orange-500',
      description: 'Active fee-enabled events',
      trend: null
    },
    {
      title: 'Last Month\'s Fees',
      value: formatCurrency(data.lastMonthFees),
      icon: '📅',
      color: 'bg-gray-500',
      description: 'Previous month revenue',
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                <span className="text-2xl text-white">{card.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </div>
                    {card.trend && (
                      <div className="ml-2 flex items-baseline text-sm">
                        <span className={`${card.trend.color} flex items-center`}>
                          <span className="mr-1">{card.trend.icon}</span>
                          {card.trend.value}
                        </span>
                        <span className="text-gray-500 ml-1">{card.trend.label}</span>
                      </div>
                    )}
                  </dd>
                  <dd className="text-sm text-gray-600 mt-1">
                    {card.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Highlight border for main revenue card */}
          {index === 0 && (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-1"></div>
          )}
          
          {/* Highlight border for this month's revenue with trend */}
          {index === 1 && (
            <div className={`h-1 ${
              data.monthOverMonthGrowth > 0 ? 'bg-green-500' :
              data.monthOverMonthGrowth < 0 ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessingFeeSummaryCards;
