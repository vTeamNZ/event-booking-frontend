import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminRevenueService } from '../services/adminRevenueService';
import type { 
  ProcessingFeeRevenueData, 
  HistoricalAnalysisData,
  EventFeeConfigurationData,
  FeeStructureRecommendationData2,
  AdminRevenueFilter
} from '../services/adminRevenueService';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import ProcessingFeeSummaryCards from '../components/revenue/ProcessingFeeSummaryCards';
import EventProcessingFeeTable from '../components/revenue/EventProcessingFeeTable';
import ProcessingFeeTrendsChart from '../components/revenue/ProcessingFeeTrendsChart';
import FeeConfigurationPanel from '../components/revenue/FeeConfigurationPanel';
import HistoricalAnalysisPanel from '../components/revenue/HistoricalAnalysisPanel';
import RevenueExportTools from '../components/revenue/RevenueExportTools';

const AdminRevenueDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'historical' | 'configuration' | 'export'>('overview');
  
  // Data state
  const [processingFeeData, setProcessingFeeData] = useState<ProcessingFeeRevenueData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalAnalysisData | null>(null);
  const [configurationData, setConfigurationData] = useState<{
    eventConfigurations: EventFeeConfigurationData[];
    feeRecommendations: FeeStructureRecommendationData2[];
  } | null>(null);

  // Filter state
  const [filter, setFilter] = useState<AdminRevenueFilter>({
    startDate: undefined,
    endDate: undefined,
    organizerId: undefined,
    eventId: undefined,
    processingFeeEnabled: undefined,
    sortBy: 'totalFeesCollected',
    sortDirection: 'desc'
  });

  // Check admin access
  useEffect(() => {
    if (!user || !isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/login';
      return;
    }
  }, [user, isAdmin]);

  // Load data
  useEffect(() => {
    if (user && isAdmin()) {
      loadDashboardData();
    }
  }, [filter, user, isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, historyData, configData] = await Promise.all([
        adminRevenueService.getProcessingFeesSummary(filter),
        adminRevenueService.getHistoricalAnalysis(filter),
        adminRevenueService.getEventFeeConfiguration(filter)
      ]);

      setProcessingFeeData(summaryData);
      setHistoricalData(historyData);
      setConfigurationData(configData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: Partial<AdminRevenueFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf', dataType: string, customOptions?: any) => {
    try {
      const blob = await adminRevenueService.exportRevenueData(format, dataType, customOptions);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `revenue-dashboard-${dataType}-${timestamp}`;
      
      adminRevenueService.downloadFile(blob, filename, format);
      toast.success(`Export completed successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  // Show loading state
  if (loading && !processingFeeData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Revenue Dashboard</h2>
          <p className="text-gray-600">Analyzing processing fee data...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO 
        title="Admin Revenue Dashboard - EventHero"
        description="Processing fee analytics, trends, and revenue insights for administrators"
        keywords={["admin", "revenue", "processing fees", "analytics", "dashboard"]}
      />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">💰</span>
                  Admin Revenue Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Processing fee analytics, trends, and recommendations
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Filter Controls */}
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={filter.startDate || ''}
                    onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={filter.endDate || ''}
                    onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
                
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'trends', name: 'Trends', icon: '📈' },
                  { id: 'historical', name: 'Historical', icon: '📅' },
                  { id: 'configuration', name: 'Configuration', icon: '⚙️' },
                  { id: 'export', name: 'Export', icon: '📤' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && processingFeeData && (
            <>
              <ProcessingFeeSummaryCards data={processingFeeData} />
              <EventProcessingFeeTable 
                events={processingFeeData.eventBreakdown} 
                onFilterChange={handleFilterChange}
                currentFilter={filter}
              />
            </>
          )}

          {activeTab === 'trends' && processingFeeData && (
            <ProcessingFeeTrendsChart 
              trendData={processingFeeData.trendData}
              onFilterChange={handleFilterChange}
              currentFilter={filter}
            />
          )}

          {activeTab === 'historical' && historicalData && (
            <HistoricalAnalysisPanel 
              historicalData={historicalData}
              onFilterChange={handleFilterChange}
              currentFilter={filter}
            />
          )}

          {activeTab === 'configuration' && configurationData && (
            <FeeConfigurationPanel 
              eventConfigurations={configurationData.eventConfigurations}
              feeRecommendations={configurationData.feeRecommendations}
              onFilterChange={handleFilterChange}
              currentFilter={filter}
            />
          )}

          {activeTab === 'export' && (
            <RevenueExportTools 
              exportData={{
                processingFeeSummary: processingFeeData,
                historicalAnalysis: historicalData,
                eventConfigurations: configurationData?.eventConfigurations || []
              }}
              currentFilter={filter}
              onExport={handleExport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueDashboard;
