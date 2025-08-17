import React, { useState } from 'react';

interface MonthlyRevenueData {
  year: number;
  month: number;
  monthName: string;
  processingFeesCollected: number;
  bookingsWithFees: number;
  activeEvents: number;
  growthPercentage: number;
}

interface QuarterlyRevenueData {
  year: number;
  quarter: number;
  processingFeesCollected: number;
  bookingsWithFees: number;
  growthPercentage: number;
}

interface GrowthAnalysisData {
  monthOverMonthGrowth: number;
  quarterOverQuarterGrowth: number;
  yearOverYearGrowth: number;
  growthTrend: string;
  growthFactors: string[];
}

interface SeasonalityInsightData {
  peakMonth: string;
  lowestMonth: string;
  seasonalityScore: number;
  seasonalPatterns: string[];
}

interface HistoricalAnalysisData {
  monthlyTrends: MonthlyRevenueData[];
  quarterlyTrends: QuarterlyRevenueData[];
  growthAnalysis: GrowthAnalysisData;
  seasonalityInsights: SeasonalityInsightData;
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
  historicalData: HistoricalAnalysisData;
  onFilterChange: (filter: Partial<AdminRevenueFilter>) => void;
  currentFilter: AdminRevenueFilter;
}

const HistoricalAnalysisPanel: React.FC<Props> = ({ historicalData, onFilterChange, currentFilter }) => {
  const [activeView, setActiveView] = useState<'monthly' | 'quarterly' | 'growth' | 'seasonality'>('monthly');

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return { color: 'text-green-600', bg: 'bg-green-100', icon: '📈', prefix: '+' };
    } else if (growth < 0) {
      return { color: 'text-red-600', bg: 'bg-red-100', icon: '📉', prefix: '' };
    } else {
      return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '➡️', prefix: '' };
    }
  };

  const getTrendIndicator = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: '🚀' };
      case 'decreasing':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: '📉' };
      default:
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: '📊' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with View Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center">
            <span className="mr-2">📅</span>
            Historical Analysis
          </h3>
          
          <div className="flex rounded-md shadow-sm">
            {[
              { id: 'monthly', name: 'Monthly', icon: '📊' },
              { id: 'quarterly', name: 'Quarterly', icon: '📈' },
              { id: 'growth', name: 'Growth', icon: '🚀' },
              { id: 'seasonality', name: 'Seasonality', icon: '🌟' }
            ].map((view, index) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`px-4 py-2 text-sm font-medium border ${
                  activeView === view.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${
                  index === 0 ? 'rounded-l-md' :
                  index === 3 ? 'rounded-r-md' : ''
                }`}
              >
                <span className="mr-1">{view.icon}</span>
                {view.name}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Analysis */}
        {activeView === 'monthly' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600">Total Months</div>
                <div className="text-2xl font-bold text-blue-900">{historicalData.monthlyTrends.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">Peak Month</div>
                <div className="text-lg font-semibold text-green-900">
                  {historicalData.monthlyTrends.length > 0 && 
                   historicalData.monthlyTrends.reduce((max, month) => 
                     month.processingFeesCollected > max.processingFeesCollected ? month : max
                   ).monthName}
                </div>
                <div className="text-sm text-green-700">
                  {historicalData.monthlyTrends.length > 0 && 
                   formatCurrency(Math.max(...historicalData.monthlyTrends.map(m => m.processingFeesCollected)))}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">Average Monthly</div>
                <div className="text-lg font-semibold text-purple-900">
                  {historicalData.monthlyTrends.length > 0 && 
                   formatCurrency(historicalData.monthlyTrends.reduce((sum, month) => sum + month.processingFeesCollected, 0) / historicalData.monthlyTrends.length)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicalData.monthlyTrends.slice(-12).reverse().map((month, index) => {
                    const growthIndicator = getGrowthIndicator(month.growthPercentage);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {month.monthName} {month.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(month.processingFeesCollected)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{month.bookingsWithFees}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{month.activeEvents}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${growthIndicator.bg} ${growthIndicator.color}`}>
                            {growthIndicator.icon} {growthIndicator.prefix}{Math.abs(month.growthPercentage).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quarterly Analysis */}
        {activeView === 'quarterly' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600">Total Quarters</div>
                <div className="text-2xl font-bold text-blue-900">{historicalData.quarterlyTrends.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">Best Quarter</div>
                <div className="text-lg font-semibold text-green-900">
                  {historicalData.quarterlyTrends.length > 0 && (() => {
                    const bestQuarter = historicalData.quarterlyTrends.reduce((max, quarter) => 
                      quarter.processingFeesCollected > max.processingFeesCollected ? quarter : max
                    );
                    return `Q${bestQuarter.quarter} ${bestQuarter.year}`;
                  })()}
                </div>
                <div className="text-sm text-green-700">
                  {historicalData.quarterlyTrends.length > 0 && 
                   formatCurrency(Math.max(...historicalData.quarterlyTrends.map(q => q.processingFeesCollected)))}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">Average Quarterly</div>
                <div className="text-lg font-semibold text-purple-900">
                  {historicalData.quarterlyTrends.length > 0 && 
                   formatCurrency(historicalData.quarterlyTrends.reduce((sum, quarter) => sum + quarter.processingFeesCollected, 0) / historicalData.quarterlyTrends.length)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quarter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicalData.quarterlyTrends.slice(-8).reverse().map((quarter, index) => {
                    const growthIndicator = getGrowthIndicator(quarter.growthPercentage);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Q{quarter.quarter} {quarter.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(quarter.processingFeesCollected)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quarter.bookingsWithFees}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${growthIndicator.bg} ${growthIndicator.color}`}>
                            {growthIndicator.icon} {growthIndicator.prefix}{Math.abs(quarter.growthPercentage).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Growth Analysis */}
        {activeView === 'growth' && (
          <div className="space-y-6">
            {/* Growth Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Month-over-Month</div>
                  <div className={`text-3xl font-bold mb-2 ${getGrowthIndicator(historicalData.growthAnalysis.monthOverMonthGrowth).color}`}>
                    {getGrowthIndicator(historicalData.growthAnalysis.monthOverMonthGrowth).prefix}
                    {Math.abs(historicalData.growthAnalysis.monthOverMonthGrowth).toFixed(1)}%
                  </div>
                  <div className="text-lg">
                    {getGrowthIndicator(historicalData.growthAnalysis.monthOverMonthGrowth).icon}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Quarter-over-Quarter</div>
                  <div className={`text-3xl font-bold mb-2 ${getGrowthIndicator(historicalData.growthAnalysis.quarterOverQuarterGrowth).color}`}>
                    {getGrowthIndicator(historicalData.growthAnalysis.quarterOverQuarterGrowth).prefix}
                    {Math.abs(historicalData.growthAnalysis.quarterOverQuarterGrowth).toFixed(1)}%
                  </div>
                  <div className="text-lg">
                    {getGrowthIndicator(historicalData.growthAnalysis.quarterOverQuarterGrowth).icon}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Year-over-Year</div>
                  <div className={`text-3xl font-bold mb-2 ${getGrowthIndicator(historicalData.growthAnalysis.yearOverYearGrowth).color}`}>
                    {getGrowthIndicator(historicalData.growthAnalysis.yearOverYearGrowth).prefix}
                    {Math.abs(historicalData.growthAnalysis.yearOverYearGrowth).toFixed(1)}%
                  </div>
                  <div className="text-lg">
                    {getGrowthIndicator(historicalData.growthAnalysis.yearOverYearGrowth).icon}
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Trend */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">{getTrendIndicator(historicalData.growthAnalysis.growthTrend).icon}</span>
                Overall Growth Trend: {historicalData.growthAnalysis.growthTrend}
              </h4>
              
              <div className="space-y-3">
                <h5 className="text-md font-medium text-gray-800">Key Growth Factors:</h5>
                {historicalData.growthAnalysis.growthFactors.map((factor, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-gray-700">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Seasonality Analysis */}
        {activeView === 'seasonality' && (
          <div className="space-y-6">
            {/* Seasonality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-green-600 mb-2">Peak Month</div>
                <div className="text-2xl font-bold text-green-900 mb-2">
                  🏆 {historicalData.seasonalityInsights.peakMonth}
                </div>
                <div className="text-green-700">Highest revenue month</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-blue-600 mb-2">Lowest Month</div>
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  📉 {historicalData.seasonalityInsights.lowestMonth}
                </div>
                <div className="text-blue-700">Lowest revenue month</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-purple-600 mb-2">Seasonality Score</div>
                <div className="text-2xl font-bold text-purple-900 mb-2">
                  {historicalData.seasonalityInsights.seasonalityScore.toFixed(1)}%
                </div>
                <div className="text-purple-700">
                  {historicalData.seasonalityInsights.seasonalityScore > 50 ? 'High' : 
                   historicalData.seasonalityInsights.seasonalityScore > 25 ? 'Moderate' : 'Low'} variation
                </div>
              </div>
            </div>

            {/* Seasonal Patterns */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🌟</span>
                Seasonal Patterns & Insights
              </h4>
              
              <div className="space-y-4">
                {historicalData.seasonalityInsights.seasonalPatterns.map((pattern, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-blue-800 flex-1">{pattern}</p>
                    </div>
                  </div>
                ))}
              </div>

              {historicalData.seasonalityInsights.seasonalPatterns.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Not enough historical data to determine seasonal patterns.</p>
                  <p className="text-sm mt-2">More data will be available as the platform grows.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalAnalysisPanel;
