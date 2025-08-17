import React, { useState } from 'react';

interface EventFeeConfigurationData {
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  organizerName: string;
  processingFeeEnabled: boolean;
  feePercentage: number;
  fixedFee: number;
  totalBookings: number;
  totalRevenue: number;
  totalProcessingFees: number;
  status: string;
  lastUpdated: string;
}

interface FeeStructureRecommendationData {
  currentFeePercentage: number;
  currentFixedFee: number;
  recommendedFeePercentage: number;
  recommendedFixedFee: number;
  projectedRevenueIncrease: number;
  reasoning: string;
  confidenceScore: number;
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
  eventConfigurations: EventFeeConfigurationData[];
  feeRecommendations: FeeStructureRecommendationData[];
  onFilterChange: (filter: Partial<AdminRevenueFilter>) => void;
  currentFilter: AdminRevenueFilter;
}

const FeeConfigurationPanel: React.FC<Props> = ({ 
  eventConfigurations, 
  feeRecommendations, 
  onFilterChange, 
  currentFilter 
}) => {
  const [activeView, setActiveView] = useState<'configurations' | 'recommendations' | 'analytics'>('configurations');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const getStatusBadge = (status: string, enabled: boolean) => {
    if (!enabled) {
      return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Disabled' };
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Active' };
      case 'completed':
        return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Completed' };
      case 'cancelled':
        return { color: 'text-red-600', bg: 'bg-red-100', text: 'Cancelled' };
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
    }
  };

  const getConfidenceIndicator = (score: number) => {
    if (score >= 80) {
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'High', icon: '🎯' };
    } else if (score >= 60) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium', icon: '⚠️' };
    } else {
      return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low', icon: '❌' };
    }
  };

  // Filtering and sorting
  const filteredConfigurations = eventConfigurations.filter(config => {
    const matchesSearch = config.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.organizerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'enabled' && config.processingFeeEnabled) ||
                         (filterStatus === 'disabled' && !config.processingFeeEnabled);
    
    return matchesSearch && matchesStatus;
  });

  const sortData = (data: EventFeeConfigurationData[], key: string, direction: string) => {
    return [...data].sort((a, b) => {
      let aValue = (a as any)[key];
      let bValue = (b as any)[key];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedConfigurations = sortConfig.key 
    ? sortData(filteredConfigurations, sortConfig.key, sortConfig.direction)
    : filteredConfigurations;

  // Analytics calculations
  const analytics = {
    totalEvents: eventConfigurations.length,
    enabledEvents: eventConfigurations.filter(e => e.processingFeeEnabled).length,
    averageFeePercentage: eventConfigurations.filter(e => e.processingFeeEnabled).reduce((sum, e) => sum + e.feePercentage, 0) / Math.max(eventConfigurations.filter(e => e.processingFeeEnabled).length, 1),
    averageFixedFee: eventConfigurations.filter(e => e.processingFeeEnabled).reduce((sum, e) => sum + e.fixedFee, 0) / Math.max(eventConfigurations.filter(e => e.processingFeeEnabled).length, 1),
    totalPotentialRevenue: feeRecommendations.reduce((sum, r) => sum + r.projectedRevenueIncrease, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with View Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center">
            <span className="mr-2">⚙️</span>
            Fee Configuration Management
          </h3>
          
          <div className="flex rounded-md shadow-sm">
            {[
              { id: 'configurations', name: 'Configurations', icon: '📊' },
              { id: 'recommendations', name: 'Recommendations', icon: '💡' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
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
                  index === 2 ? 'rounded-r-md' : ''
                }`}
              >
                <span className="mr-1">{view.icon}</span>
                {view.name}
              </button>
            ))}
          </div>
        </div>

        {/* Event Configurations View */}
        {activeView === 'configurations' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search events or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="enabled">Fee Enabled</option>
                <option value="disabled">Fee Disabled</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                Showing {sortedConfigurations.length} of {eventConfigurations.length} events
              </div>
            </div>

            {/* Configuration Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('eventTitle')}
                    >
                      Event
                      {sortConfig.key === 'eventTitle' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Structure
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalProcessingFees')}
                    >
                      Revenue Generated
                      {sortConfig.key === 'totalProcessingFees' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedConfigurations.map((config) => {
                    const statusBadge = getStatusBadge(config.status, config.processingFeeEnabled);
                    return (
                      <tr key={config.eventId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {config.eventTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(config.eventDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{config.organizerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {config.processingFeeEnabled ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {formatPercentage(config.feePercentage)} + {formatCurrency(config.fixedFee)}
                              </div>
                              <div className="text-gray-500">Per transaction</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No processing fee</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(config.totalProcessingFees)}
                            </div>
                            <div className="text-gray-500">
                              From {config.totalBookings} bookings
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(config.lastUpdated)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedConfigurations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg">No events found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or filter settings.</p>
              </div>
            )}
          </div>
        )}

        {/* Fee Recommendations View */}
        {activeView === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="text-2xl">💡</div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-blue-900 mb-2">AI-Powered Fee Recommendations</h4>
                  <p className="text-blue-800 text-sm">
                    Based on historical performance, market analysis, and booking patterns, here are our recommendations 
                    to optimize your processing fee structure and maximize revenue.
                  </p>
                </div>
              </div>
            </div>

            {feeRecommendations.length > 0 ? (
              <div className="space-y-4">
                {feeRecommendations.map((recommendation, index) => {
                  const confidence = getConfidenceIndicator(recommendation.confidenceScore);
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Fee Structure Optimization #{index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Current Structure</h5>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatPercentage(recommendation.currentFeePercentage)} + {formatCurrency(recommendation.currentFixedFee)}
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-green-700 mb-2">Recommended Structure</h5>
                              <div className="text-lg font-semibold text-green-900">
                                {formatPercentage(recommendation.recommendedFeePercentage)} + {formatCurrency(recommendation.recommendedFixedFee)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${confidence.bg} ${confidence.color}`}>
                            {confidence.icon} {confidence.label} Confidence
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {recommendation.confidenceScore}% sure
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Projected Revenue Impact</h5>
                            <div className="text-2xl font-bold text-green-600">
                              +{formatCurrency(recommendation.projectedRevenueIncrease)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Additional monthly revenue</p>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendation Reasoning</h5>
                            <p className="text-sm text-gray-800">{recommendation.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-lg">No fee recommendations available at this time.</p>
                <p className="text-sm mt-2">
                  Recommendations will appear as more data is collected from your events.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-blue-600 mb-2">Total Events</div>
                <div className="text-3xl font-bold text-blue-900">{analytics.totalEvents}</div>
                <div className="text-blue-700 text-sm mt-1">All configured events</div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-green-600 mb-2">Fee Enabled</div>
                <div className="text-3xl font-bold text-green-900">{analytics.enabledEvents}</div>
                <div className="text-green-700 text-sm mt-1">
                  {((analytics.enabledEvents / analytics.totalEvents) * 100).toFixed(1)}% adoption
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-purple-600 mb-2">Avg Fee Rate</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatPercentage(analytics.averageFeePercentage)}
                </div>
                <div className="text-purple-700 text-sm mt-1">Percentage component</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-orange-600 mb-2">Avg Fixed Fee</div>
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(analytics.averageFixedFee)}
                </div>
                <div className="text-orange-700 text-sm mt-1">Fixed component</div>
              </div>
            </div>

            {/* Fee Distribution Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">📊</span>
                Fee Structure Distribution
              </h4>
              
              <div className="space-y-4">
                {eventConfigurations.filter(e => e.processingFeeEnabled).length > 0 ? (
                  (() => {
                    // Group by fee structure
                    const feeGroups: { [key: string]: EventFeeConfigurationData[] } = {};
                    eventConfigurations.filter(e => e.processingFeeEnabled).forEach(event => {
                      const key = `${event.feePercentage.toFixed(2)}% + $${event.fixedFee.toFixed(2)}`;
                      if (!feeGroups[key]) feeGroups[key] = [];
                      feeGroups[key].push(event);
                    });

                    return Object.entries(feeGroups).map(([structure, events]) => {
                      const totalRevenue = events.reduce((sum, e) => sum + e.totalProcessingFees, 0);
                      const percentage = (events.length / eventConfigurations.filter(e => e.processingFeeEnabled).length) * 100;
                      
                      return (
                        <div key={structure} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                            <div>
                              <div className="font-medium text-gray-900">{structure}</div>
                              <div className="text-sm text-gray-600">{events.length} events ({percentage.toFixed(1)}%)</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
                            <div className="text-sm text-gray-600">Total revenue</div>
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <p>No fee structures to analyze yet.</p>
                    <p className="text-sm mt-2">Enable processing fees on events to see distribution analysis.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Potential Revenue Impact */}
            {feeRecommendations.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Revenue Optimization Potential
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      +{formatCurrency(analytics.totalPotentialRevenue)}
                    </div>
                    <p className="text-green-800">
                      Potential additional monthly revenue from implementing all fee recommendations
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎯</div>
                      <p className="text-sm text-gray-700">
                        {feeRecommendations.length} optimization opportunities identified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeConfigurationPanel;
