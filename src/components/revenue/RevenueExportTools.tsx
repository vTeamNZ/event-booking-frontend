import React, { useState } from 'react';

interface AdminRevenueFilter {
  startDate?: string;
  endDate?: string;
  organizerId?: number;
  eventId?: number;
  processingFeeEnabled?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

interface ExportData {
  processingFeeSummary: any;
  historicalAnalysis: any;
  eventConfigurations: any[];
}

interface Props {
  exportData: ExportData;
  currentFilter: AdminRevenueFilter;
  onExport: (format: 'csv' | 'excel' | 'pdf', dataType: string, customOptions?: any) => Promise<void>;
}

const RevenueExportTools: React.FC<Props> = ({ exportData, currentFilter, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['summary']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({
    start: currentFilter.startDate || '',
    end: currentFilter.endDate || ''
  });
  const [customOptions, setCustomOptions] = useState({
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
    currency: 'NZD',
    groupBy: 'month'
  });

  const dataTypeOptions = [
    {
      id: 'summary',
      name: 'Processing Fee Summary',
      description: 'Key metrics and totals',
      icon: '📊'
    },
    {
      id: 'events',
      name: 'Event Breakdown',
      description: 'Per-event processing fee details',
      icon: '🎫'
    },
    {
      id: 'historical',
      name: 'Historical Trends',
      description: 'Monthly and quarterly analysis',
      icon: '📈'
    },
    {
      id: 'configurations',
      name: 'Fee Configurations',
      description: 'Current fee structure settings',
      icon: '⚙️'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'AI-powered optimization suggestions',
      icon: '💡'
    }
  ];

  const formatOptions = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for spreadsheets',
      icon: '📄',
      best: 'Data analysis'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel workbook with multiple sheets',
      icon: '📗',
      best: 'Comprehensive reports'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Professional report with charts and formatting',
      icon: '📋',
      best: 'Presentations'
    }
  ];

  const handleDataTypeChange = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleExport = async () => {
    if (selectedDataTypes.length === 0) {
      alert('Please select at least one data type to export.');
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = {
        ...customOptions,
        dataTypes: selectedDataTypes,
        dateRange,
        filter: currentFilter
      };

      await onExport(exportFormat, selectedDataTypes.join(','), exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedFileSize = () => {
    let baseSize = 0;
    if (selectedDataTypes.includes('summary')) baseSize += 5;
    if (selectedDataTypes.includes('events')) baseSize += exportData.eventConfigurations.length * 0.5;
    if (selectedDataTypes.includes('historical')) baseSize += 20;
    if (selectedDataTypes.includes('configurations')) baseSize += exportData.eventConfigurations.length * 0.3;
    if (selectedDataTypes.includes('recommendations')) baseSize += 10;

    const formatMultiplier = exportFormat === 'pdf' ? 3 : exportFormat === 'excel' ? 2 : 1;
    return Math.max(baseSize * formatMultiplier, 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📤</span>
              Export Revenue Data
            </h3>
            <p className="text-gray-600 mt-1">Generate reports for financial analysis and compliance</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="text-sm font-medium text-blue-900">Quick Export</div>
            <div className="text-xs text-blue-700">All data as Excel</div>
            <button 
              onClick={() => {
                setSelectedDataTypes(['summary', 'events', 'historical']);
                setExportFormat('excel');
                handleExport();
              }}
              disabled={isExporting}
              className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Export Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Data Selection */}
          <div className="space-y-6">
            {/* Data Types Selection */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Select Data to Export
              </h4>
              
              <div className="space-y-3">
                {dataTypeOptions.map((option) => (
                  <div key={option.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={selectedDataTypes.includes(option.id)}
                      onChange={() => handleDataTypeChange(option.id)}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={option.id} className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-start">
                        <span className="text-lg mr-2">{option.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{option.name}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Override */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Date Range (Optional Override)
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Leave empty to use current filter dates
              </div>
            </div>
          </div>

          {/* Right Column: Format & Options */}
          <div className="space-y-6">
            {/* Export Format Selection */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📁</span>
                Choose Export Format
              </h4>
              
              <div className="space-y-3">
                {formatOptions.map((format) => (
                  <div key={format.id} className="flex items-start">
                    <input
                      type="radio"
                      id={format.id}
                      name="exportFormat"
                      checked={exportFormat === format.id}
                      onChange={() => setExportFormat(format.id as any)}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor={format.id} className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-start">
                        <span className="text-lg mr-2">{format.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{format.name}</div>
                          <div className="text-sm text-gray-600">{format.description}</div>
                          <div className="text-xs text-blue-600 mt-1">Best for: {format.best}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Options */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Export Options
              </h4>
              
              <div className="space-y-4">
                {exportFormat === 'pdf' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-charts"
                      checked={customOptions.includeCharts}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="include-charts" className="ml-3 text-sm text-gray-700">
                      Include charts and visualizations
                    </label>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-summary"
                    checked={customOptions.includeSummary}
                    onChange={(e) => setCustomOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="include-summary" className="ml-3 text-sm text-gray-700">
                    Include executive summary
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-details"
                    checked={customOptions.includeDetails}
                    onChange={(e) => setCustomOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="include-details" className="ml-3 text-sm text-gray-700">
                    Include detailed breakdowns
                  </label>
                </div>

                <div>
                  <label htmlFor="group-by" className="block text-sm font-medium text-gray-700 mb-2">
                    Group historical data by:
                  </label>
                  <select
                    id="group-by"
                    value={customOptions.groupBy}
                    onChange={(e) => setCustomOptions(prev => ({ ...prev, groupBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Export Summary</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Data types:</span>
                  <span className="font-medium">{selectedDataTypes.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">{exportFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated size:</span>
                  <span className="font-medium">~{getEstimatedFileSize().toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing time:</span>
                  <span className="font-medium">~{Math.max(selectedDataTypes.length * 2, 5)}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            {selectedDataTypes.length === 0 ? (
              <span className="text-red-600">⚠️ Please select at least one data type</span>
            ) : (
              <span>✅ Ready to export {selectedDataTypes.length} data type(s) as {exportFormat.toUpperCase()}</span>
            )}
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting || selectedDataTypes.length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Export...
              </>
            ) : (
              <>
                <span className="mr-2">📤</span>
                Generate Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Export Templates */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Export Templates
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedDataTypes(['summary', 'events']);
              setExportFormat('excel');
              handleExport();
            }}
            disabled={isExporting}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📊</span>
              <span className="font-medium text-gray-900">Financial Summary</span>
            </div>
            <p className="text-sm text-gray-600">Key metrics and event breakdown for accounting</p>
          </button>

          <button
            onClick={() => {
              setSelectedDataTypes(['historical', 'configurations']);
              setExportFormat('pdf');
              handleExport();
            }}
            disabled={isExporting}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📈</span>
              <span className="font-medium text-gray-900">Performance Report</span>
            </div>
            <p className="text-sm text-gray-600">Trends and analysis for stakeholder presentations</p>
          </button>

          <button
            onClick={() => {
              setSelectedDataTypes(['summary', 'events', 'historical', 'configurations', 'recommendations']);
              setExportFormat('excel');
              handleExport();
            }}
            disabled={isExporting}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📋</span>
              <span className="font-medium text-gray-900">Complete Report</span>
            </div>
            <p className="text-sm text-gray-600">All data with recommendations for comprehensive analysis</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueExportTools;
