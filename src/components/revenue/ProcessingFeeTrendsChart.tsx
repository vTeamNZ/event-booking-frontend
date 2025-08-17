import React, { useState } from 'react';

interface ProcessingFeeTrendData {
  date: string;
  dailyFeesCollected: number;
  bookingsWithFees: number;
  averageFeeAmount: number;
  eventsActive: number;
}

interface AdminRevenueFilter {
  startDate?: string;
  endDate?: string;
  organizerId?: number;
  eventId?: number;
  processingFeeEnabled?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

interface Props {
  trendData: ProcessingFeeTrendData[];
  onFilterChange: (filter: Partial<AdminRevenueFilter>) => void;
  currentFilter: AdminRevenueFilter;
}

const ProcessingFeeTrendsChart: React.FC<Props> = ({ trendData, onFilterChange, currentFilter }) => {
  const [chartType, setChartType] = useState<'revenue' | 'bookings' | 'average'>('revenue');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter data based on date range
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        return trendData;
    }

    return trendData.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Calculate chart dimensions and data
  const maxValue = Math.max(...filteredData.map(item => {
    switch (chartType) {
      case 'revenue': return item.dailyFeesCollected;
      case 'bookings': return item.bookingsWithFees;
      case 'average': return item.averageFeeAmount;
      default: return 0;
    }
  }));

  const chartHeight = 300;
  const chartWidth = 800;
  const padding = 40;

  // Generate SVG points for the line chart
  const generatePoints = () => {
    if (filteredData.length === 0) return '';

    const points = filteredData.map((item, index) => {
      const x = padding + (index / (filteredData.length - 1)) * (chartWidth - 2 * padding);
      const value = chartType === 'revenue' ? item.dailyFeesCollected :
                   chartType === 'bookings' ? item.bookingsWithFees :
                   item.averageFeeAmount;
      const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  // Generate area path for the area chart
  const generateAreaPath = () => {
    if (filteredData.length === 0) return '';

    const points = generatePoints();
    if (!points) return '';

    const firstPoint = points.split(' ')[0];
    const lastPoint = points.split(' ')[points.split(' ').length - 1];
    
    const [firstX] = firstPoint.split(',');
    const [lastX] = lastPoint.split(',');
    
    return `M ${firstX},${chartHeight - padding} L ${points.replace(/,/g, ' L ')} L ${lastX},${chartHeight - padding} Z`;
  };

  // Calculate summary statistics
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.dailyFeesCollected, 0);
  const totalBookings = filteredData.reduce((sum, item) => sum + item.bookingsWithFees, 0);
  const averageDailyRevenue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
  const peakDay = filteredData.reduce((peak, item) => 
    item.dailyFeesCollected > peak.dailyFeesCollected ? item : peak, 
    filteredData[0] || { dailyFeesCollected: 0, date: '' }
  );

  // Handle date range filter change
  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range);
    
    if (range !== 'custom') {
      const now = new Date();
      let startDate = new Date();
      
      switch (range) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      onFilterChange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
            📈 Processing Fee Trends
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Chart Type Selector */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  chartType === 'revenue'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('bookings')}
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  chartType === 'bookings'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setChartType('average')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                  chartType === 'average'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Average
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex rounded-md shadow-sm">
              {(['7days', '30days', '90days'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-2 text-sm font-medium border ${
                    dateRange === range
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${
                    range === '7days' ? 'rounded-l-md' :
                    range === '90days' ? 'rounded-r-md' : ''
                  }`}
                >
                  {range === '7days' ? '7D' : range === '30days' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Total Revenue</div>
            <div className="text-lg font-semibold text-blue-900">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Total Bookings</div>
            <div className="text-lg font-semibold text-green-900">{totalBookings}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">Daily Average</div>
            <div className="text-lg font-semibold text-purple-900">{formatCurrency(averageDailyRevenue)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-600">Peak Day</div>
            <div className="text-lg font-semibold text-orange-900">
              {peakDay ? formatCurrency(peakDay.dailyFeesCollected) : 'N/A'}
            </div>
            {peakDay && (
              <div className="text-xs text-orange-700">{formatDate(peakDay.date)}</div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No trend data available for the selected period</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Area fill */}
                <path
                  d={generateAreaPath()}
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="none"
                />
                
                {/* Trend line */}
                <polyline
                  points={generatePoints()}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {filteredData.map((item, index) => {
                  const x = padding + (index / (filteredData.length - 1)) * (chartWidth - 2 * padding);
                  const value = chartType === 'revenue' ? item.dailyFeesCollected :
                               chartType === 'bookings' ? item.bookingsWithFees :
                               item.averageFeeAmount;
                  const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <title>
                        {formatDate(item.date)}: {
                          chartType === 'revenue' ? formatCurrency(item.dailyFeesCollected) :
                          chartType === 'bookings' ? `${item.bookingsWithFees} bookings` :
                          formatCurrency(item.averageFeeAmount)
                        }
                      </title>
                    </circle>
                  );
                })}
                
                {/* X-axis labels */}
                {filteredData.map((item, index) => {
                  if (index % Math.ceil(filteredData.length / 8) === 0) {
                    const x = padding + (index / (filteredData.length - 1)) * (chartWidth - 2 * padding);
                    return (
                      <text
                        key={`label-${index}`}
                        x={x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#6b7280"
                      >
                        {formatDate(item.date)}
                      </text>
                    );
                  }
                  return null;
                })}
              </svg>
              
              {/* Y-axis label */}
              <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 text-sm text-gray-600">
                {chartType === 'revenue' ? 'Daily Revenue' :
                 chartType === 'bookings' ? 'Bookings' :
                 'Average Fee Amount'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">📋 Detailed Trend Data</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(-10).reverse().map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(item.date).toLocaleDateString('en-NZ', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.dailyFeesCollected)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.bookingsWithFees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.averageFeeAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.eventsActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcessingFeeTrendsChart;
