import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  organizerSalesService, 
  EventSalesDetail, 
  DailyAnalytics,
  BookingDetailView,
  TicketTypeBreakdown 
} from '../services/organizerSalesService';
import { 
  RevenueAnalysisService,
  TicketCapacityDTO,
  StripeRevenueAnalysisDTO,
  OrganizerRevenueDTO,
  RevenueSummaryDTO
} from '../services/revenueAnalysisService';
import { api } from '../services/api';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TabType = 'analytics' | 'bookings';
type AnalyticsSubTab = 'ticket-capacity' | 'stripe-revenue' | 'organizer-revenue' | 'revenue-summary';

const OrganizerSalesDashboardEnhanced: React.FC = () => {
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventSalesDetail | null>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [bookings, setBookings] = useState<BookingDetailView[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<AnalyticsSubTab>('ticket-capacity');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Revenue Analysis state for new tabs
  const [ticketCapacityData, setTicketCapacityData] = useState<TicketCapacityDTO[]>([]);
  const [stripeRevenueData, setStripeRevenueData] = useState<StripeRevenueAnalysisDTO | null>(null);
  const [organizerRevenueData, setOrganizerRevenueData] = useState<OrganizerRevenueDTO | null>(null);
  const [revenueSummaryData, setRevenueSummaryData] = useState<RevenueSummaryDTO | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  // Chart navigation state
  const [chartDays, setChartDays] = useState(() => {
    const saved = localStorage.getItem('chartDays');
    return saved ? parseInt(saved, 10) : 14;
  });
  const [chartOffset, setChartOffset] = useState(0);

  // Booking filters
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalBookings, setTotalBookings] = useState(0);

  // Ticket breakdown state
  const [ticketBreakdown, setTicketBreakdown] = useState<TicketTypeBreakdown[]>([]);
  const [ticketBreakdownLoading, setTicketBreakdownLoading] = useState(false);

  // Mobile detection state
  const [isMobileView, setIsMobileView] = useState(false);

  // Effect to handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load initial events list
    loadEventsList();
    
    // Auto-refresh every 30 seconds if enabled
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        refreshEventStats(); // Use the new refresh function for auto-refresh
        if (selectedEventId) {
          loadEventDetail(selectedEventId);
          if (activeTab === 'analytics') {
            loadDailyAnalytics(selectedEventId);
            loadTicketBreakdown(selectedEventId);
          } else if (activeTab === 'bookings') {
            loadBookings(selectedEventId);
          }
        }
      }, 30000);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh, selectedEventId, activeTab]);

  const loadEventsList = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the existing Events API to get organizer's events
      const response = await api.get('/organizer/events');
      const events = response.data as any[];
      
      // Transform events data for display
      const eventsWithStats = await Promise.all(events.map(async (event: any) => {
        try {
          const salesDetail = await organizerSalesService.getEventSalesDetail(event.id);
          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            status: event.isActive ? 'Active' : 'Draft',
            totalTicketsSold: salesDetail.totalTicketsSold || 0,
            totalNetRevenue: salesDetail.totalNetRevenue || 0,
            totalAttendance: salesDetail.totalTicketsSold || 0
          };
        } catch (error) {
          console.error(`Failed to load sales data for event ${event.id}:`, error);
          // If we can't get sales data, show basic event info
          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            status: event.isActive ? 'Active' : 'Draft',
            totalTicketsSold: 0,
            totalNetRevenue: 0,
            totalAttendance: 0
          };
        }
      }));
      
      setEventsList(eventsWithStats);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  const refreshEventStats = async () => {
    if (eventsList.length === 0) return;
    
    try {
      setRefreshing(true);
      
      // Update sales data for existing events without re-fetching the events list
      const updatedEvents = await Promise.all(eventsList.map(async (event: any) => {
        try {
          const salesDetail = await organizerSalesService.getEventSalesDetail(event.eventId);
          return {
            ...event, // Keep all existing event data
            totalTicketsSold: salesDetail.totalTicketsSold || 0,
            totalNetRevenue: salesDetail.totalNetRevenue || 0,
            totalAttendance: salesDetail.totalTicketsSold || 0
          };
        } catch (error) {
          console.error(`Failed to refresh sales data for event ${event.eventId}:`, error);
          // Keep existing data if refresh fails
          return event;
        }
      }));
      
      setEventsList(updatedEvents);
      
      // Also refresh the selected event detail if one is selected
      if (selectedEventId) {
        loadEventDetail(selectedEventId);
      }
    } catch (error) {
      console.error('Error refreshing event stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadEventDetail = async (eventId: number) => {
    try {
      console.log('🔥 Loading event detail for:', eventId);
      setDetailLoading(true);
      const data = await organizerSalesService.getEventSalesDetail(eventId);
      console.log('🔥 Event detail loaded:', data);
      setSelectedEventDetail(data);
      setSelectedEventId(eventId);
    } catch (err: any) {
      console.error('Error loading event detail:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load event detail';
      toast.error(errorMessage);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadTicketBreakdown = async (eventId: number) => {
    try {
      const breakdown = await organizerSalesService.getEventTicketBreakdown(eventId);
      setTicketBreakdown(breakdown);
    } catch (error) {
      console.error('Error loading ticket breakdown:', error);
    }
  };

  const loadDailyAnalytics = async (eventId: number) => {
    try {
      console.log('🔥 Loading daily analytics for:', eventId, 'chartDays:', chartDays);
      setChartLoading(true);
      const data = await organizerSalesService.getDailyAnalytics(eventId, chartDays);
      console.log('🔥 Daily analytics loaded:', data);
      setDailyAnalytics(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setChartLoading(false);
    }
  };

  const loadBookings = async (eventId: number) => {
    try {
      setBookingsLoading(true);
      
      // Debug current filter values
      console.log('🔍 Loading bookings with filters:', {
        eventId,
        nameFilter,
        emailFilter,
        statusFilter,
        currentPage,
        pageSize
      });
      
      const searchQuery = nameFilter || emailFilter ? `${nameFilter} ${emailFilter}`.trim() : undefined;
      const statusQuery = statusFilter === 'all' ? undefined : statusFilter;
      
      const data = await organizerSalesService.getEventBookings(
        eventId, 
        currentPage, 
        pageSize, 
        searchQuery,
        statusQuery
      );
      
      console.log('📊 Bookings loaded:', data.bookings.length, 'total:', data.totalCount);
      setBookings(data.bookings);
      setTotalBookings(data.totalCount);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      toast.error('Failed to load booking details');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Revenue Analysis Data Loading Functions
  const loadTicketCapacityData = async (eventId: number) => {
    try {
      setRevenueLoading(true);
      const data = await RevenueAnalysisService.getTicketCapacity(eventId);
      setTicketCapacityData(data);
    } catch (err: any) {
      console.error('Error loading ticket capacity data:', err);
      toast.error('Failed to load ticket capacity data');
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadStripeRevenueData = async (eventId: number) => {
    try {
      setRevenueLoading(true);
      const data = await RevenueAnalysisService.getStripeRevenue(eventId);
      setStripeRevenueData(data);
    } catch (err: any) {
      console.error('Error loading Stripe revenue data:', err);
      toast.error('Failed to load Stripe revenue data');
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadOrganizerRevenueData = async (eventId: number) => {
    try {
      setRevenueLoading(true);
      const data = await RevenueAnalysisService.getOrganizerRevenue(eventId);
      setOrganizerRevenueData(data);
    } catch (err: any) {
      console.error('Error loading organizer revenue data:', err);
      toast.error('Failed to load organizer revenue data');
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadRevenueSummaryData = async (eventId: number) => {
    try {
      setRevenueLoading(true);
      const data = await RevenueAnalysisService.getRevenueSummary(eventId);
      setRevenueSummaryData(data);
    } catch (err: any) {
      console.error('Error loading revenue summary data:', err);
      toast.error('Failed to load revenue summary data');
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleEventSelect = (eventId: number) => {
    console.log('🔥 Event selected:', eventId);
    setSelectedEventId(eventId);
    
    // Load event detail first
    loadEventDetail(eventId);
    
    // Set active tab to analytics
    setActiveTab('analytics');
    
    // Load analytics data
    console.log('🔥 Loading analytics for event:', eventId);
    loadDailyAnalytics(eventId);
    loadTicketBreakdown(eventId);
    
    // Load all revenue analysis data
    loadTicketCapacityData(eventId);
    loadStripeRevenueData(eventId);
    loadOrganizerRevenueData(eventId);
    loadRevenueSummaryData(eventId);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (selectedEventId) {
      if (tab === 'analytics') {
        loadDailyAnalytics(selectedEventId);
        loadTicketBreakdown(selectedEventId);
      } else if (tab === 'bookings') {
        loadBookings(selectedEventId);
      }
    }
  };

  const handleAnalyticsSubTabChange = (subTab: AnalyticsSubTab) => {
    setActiveAnalyticsTab(subTab);
    if (selectedEventId) {
      // Load data for the specific sub-tab if not already loaded
      if (subTab === 'ticket-capacity' && ticketCapacityData.length === 0) {
        loadTicketCapacityData(selectedEventId);
      } else if (subTab === 'stripe-revenue' && !stripeRevenueData) {
        loadStripeRevenueData(selectedEventId);
      } else if (subTab === 'organizer-revenue' && !organizerRevenueData) {
        loadOrganizerRevenueData(selectedEventId);
      } else if (subTab === 'revenue-summary' && !revenueSummaryData) {
        loadRevenueSummaryData(selectedEventId);
      }
    }
  };

  // Chart navigation functions
  const goToPreviousDays = () => {
    const newOffset = chartOffset + chartDays;
    setChartOffset(newOffset);
    if (selectedEventId) {
      loadDailyAnalytics(selectedEventId);
    }
  };

  const goToNextDays = () => {
    if (chartOffset > 0) {
      const newOffset = Math.max(0, chartOffset - chartDays);
      setChartOffset(newOffset);
      if (selectedEventId) {
        loadDailyAnalytics(selectedEventId);
      }
    }
  };

  const handleChartDaysChange = (days: number) => {
    setChartDays(days);
    setChartOffset(0);
    localStorage.setItem('chartDays', days.toString());
    if (selectedEventId) {
      loadDailyAnalytics(selectedEventId);
    }
  };

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (selectedEventId) {
      // Add a small delay to ensure state has updated
      setTimeout(() => {
        loadBookings(selectedEventId);
      }, 100);
    }
  }, [selectedEventId, nameFilter, emailFilter, statusFilter, currentPage, pageSize]);

  // Effect to handle filter changes
  useEffect(() => {
    if (selectedEventId && activeTab === 'bookings') {
      const timeoutId = setTimeout(() => {
        loadBookings(selectedEventId);
      }, 300); // Debounce filter changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [nameFilter, emailFilter, statusFilter, selectedEventId, activeTab, currentPage]);

  // Get URL parameters for direct event access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('eventId');
    if (eventIdParam) {
      const eventId = parseInt(eventIdParam, 10);
      if (!isNaN(eventId)) {
        handleEventSelect(eventId);
      }
    }
  }, []);

  // Chart data preparation
  const chartData = {
    labels: dailyAnalytics.map(item => {
      const date = new Date(item.date);
      // For mobile, use shorter date format
      return isMobileView 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : organizerSalesService.formatDate(item.date);
    }),
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailyAnalytics.map(item => item.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: isMobileView ? 1 : 2,
      },
      {
        label: 'Tickets Sold',
        data: dailyAnalytics.map(item => item.paidTickets + item.organizerTickets),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: isMobileView ? 1 : 2,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: isMobileView ? 10 : 20,
          font: {
            size: isMobileView ? 10 : 12,
          },
          usePointStyle: isMobileView,
        },
      },
      title: {
        display: !isMobileView, // Hide title on mobile to save space
        text: `Daily Sales Trends (Last ${chartDays} days)`,
        font: {
          size: isMobileView ? 12 : 16,
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: !isMobileView, // Hide axis titles on mobile
          text: 'Revenue ($)',
          font: {
            size: isMobileView ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobileView ? 8 : 10,
          },
          maxTicksLimit: isMobileView ? 4 : 6,
          callback: function(value: any) {
            // Format currency values more compactly on mobile
            if (isMobileView && value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
            return '$' + value;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: !isMobileView, // Hide axis titles on mobile
          text: 'Tickets',
          font: {
            size: isMobileView ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobileView ? 8 : 10,
          },
          maxTicksLimit: isMobileView ? 4 : 6,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: !isMobileView, // Hide axis titles on mobile
          text: 'Date',
          font: {
            size: isMobileView ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobileView ? 8 : 10,
          },
          maxRotation: isMobileView ? 45 : 0,
          minRotation: isMobileView ? 45 : 0,
          maxTicksLimit: isMobileView ? 5 : 10,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load sales data'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Real-time Sales Dashboard | Organizer" 
        description="Real-time event analytics with daily trends, booking details, and revenue tracking." 
        keywords={["Real-time Dashboard", "Event Analytics", "Ticket Sales", "Revenue Tracking"]}
      />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 shadow-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white/5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Sales Analytics</h1>
                    <p className="text-blue-100 flex items-center">
                      <span>Real-time event performance dashboard</span>
                      <span className="ml-3 inline-flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                        <span className="text-xs text-green-200">Live Updates</span>
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <label className="text-white text-sm flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="select-none">Auto-refresh</span>
                    </label>
                  </div>
                  <div className="text-white text-sm">
                    <div className="text-xs text-blue-200">Total Events</div>
                    <div className="text-lg font-bold">{eventsList.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Events List Sidebar */}
            <div className="lg:w-80 lg:flex-shrink-0 w-full">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Your Events</h3>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-green-200 font-medium">LIVE</span>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm mt-1">Click to view analytics</p>
                </div>

                {/* Events List */}
                <div className="max-h-96 lg:max-h-96 md:max-h-80 sm:max-h-64 overflow-y-auto bg-gray-50">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading events...</p>
                    </div>
                  ) : eventsList.length > 0 ? (
                    <div className="space-y-2 p-2">
                      {eventsList.map((event: any) => (
                        <div
                          key={event.eventId}
                          className={`group relative bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
                            selectedEventDetail?.eventId === event.eventId 
                              ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => {
                            console.log('🔥 Event clicked:', event.eventId, event.eventTitle);
                            handleEventSelect(event.eventId);
                          }}
                        >
                          {/* Selection Indicator */}
                          {selectedEventDetail?.eventId === event.eventId && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                          )}
                          
                          <div className="p-4">
                            {/* Event Title & Date */}
                            <div className="mb-3">
                              <h4 className={`text-sm font-semibold truncate ${
                                selectedEventDetail?.eventId === event.eventId 
                                  ? 'text-blue-900' 
                                  : 'text-gray-900 group-hover:text-blue-700'
                              }`}>
                                {event.eventTitle}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(event.eventDate).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                event.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  event.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                                }`}></div>
                                {event.status}
                              </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center bg-gray-50 rounded-lg p-2">
                                <div className="text-lg font-bold text-gray-900">{event.totalTicketsSold || 0}</div>
                                <div className="text-xs text-gray-500">Tickets Sold</div>
                              </div>
                              <div className="text-center bg-gray-50 rounded-lg p-2">
                                <div className="text-lg font-bold text-green-600">
                                  ${(event.totalNetRevenue || 0).toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-500">Revenue</div>
                              </div>
                            </div>

                            {/* Click Indicator */}
                            <div className="mt-3 flex items-center justify-center text-xs text-gray-400 group-hover:text-blue-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Click for details
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No events found</p>
                      <p className="text-gray-400 text-xs mt-1">Create your first event to see analytics</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-100 px-4 py-3 border-t">
                  <div className="space-y-2">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-sm font-semibold text-gray-900">{eventsList.length}</div>
                        <div className="text-xs text-gray-500">Events</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-sm font-semibold text-blue-600">
                          {eventsList.reduce((total, event) => total + (event.totalTicketsSold || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total Sold</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-sm font-semibold text-green-600">
                          ${eventsList.reduce((total, event) => total + (event.totalNetRevenue || 0), 0).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Total Revenue</div>
                      </div>
                    </div>
                    {/* Refresh Button */}
                    <div className="flex justify-center">
                      <button 
                        onClick={() => refreshEventStats()}
                        disabled={refreshing}
                        className={`font-medium text-xs px-3 py-1 rounded-md transition-colors ${
                          refreshing 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {refreshing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                            Refreshing...
                          </div>
                        ) : (
                          'Refresh'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full">
              {detailLoading ? (
                /* Loading State */
                <div className="bg-white rounded-lg shadow-lg">
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading event details...</p>
                  </div>
                </div>
              ) : selectedEventDetail ? (
            /* Event Details Section */
            <div className="bg-white rounded-lg shadow-lg">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedEventDetail.eventTitle}
                  </h3>
                  <nav className="flex flex-wrap gap-4 lg:gap-8">
                    <button
                      onClick={() => handleTabChange('analytics')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'analytics'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      📈 Analytics & Charts
                    </button>
                    <button
                      onClick={() => handleTabChange('bookings')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'bookings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      📋 Booking Details
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* Sales Chart - Always Visible at Top */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">📊 Sales Analytics Chart</h4>
                      </div>
                      
                      {/* Chart Navigation */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={goToPreviousDays}
                            className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors w-full sm:w-auto justify-center"
                          >
                            ← Previous {chartDays} days
                          </button>
                          <button
                            onClick={goToNextDays}
                            disabled={chartOffset === 0}
                            className={`flex items-center gap-1 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors w-full sm:w-auto justify-center ${
                              chartOffset === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Next {chartDays} days →
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">View:</span>
                          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => handleChartDaysChange(days)}
                                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1 text-xs sm:text-sm rounded-md transition-colors ${
                                  chartDays === days
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {days}d
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Analytics Chart */}
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        {/* Mobile Chart Title */}
                        <div className="sm:hidden mb-3 text-center">
                          <h4 className="text-sm font-medium text-gray-700">
                            Sales Trends ({chartDays} days)
                          </h4>
                        </div>
                        
                        {chartLoading ? (
                          <div className="h-48 sm:h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        ) : dailyAnalytics.length > 0 ? (
                          <div className="h-48 sm:h-64 md:h-80">
                            <Bar data={chartData} options={chartOptions} />
                          </div>
                        ) : (
                          <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <p className="text-sm">No analytics data available</p>
                              <p className="text-xs text-gray-400 mt-1">for the selected period</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Revenue Analysis Sub-Tab Navigation - After Chart */}
                    <div className="border-b border-gray-200">
                      <nav className="flex flex-wrap gap-4 lg:gap-6">
                        <button
                          onClick={() => handleAnalyticsSubTabChange('ticket-capacity')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeAnalyticsTab === 'ticket-capacity'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          🎫 Ticket Capacity
                        </button>
                        <button
                          onClick={() => handleAnalyticsSubTabChange('stripe-revenue')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeAnalyticsTab === 'stripe-revenue'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          💳 Stripe Revenue
                        </button>
                        <button
                          onClick={() => handleAnalyticsSubTabChange('organizer-revenue')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeAnalyticsTab === 'organizer-revenue'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          🏢 Organizer Sales
                        </button>
                        <button
                          onClick={() => handleAnalyticsSubTabChange('revenue-summary')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeAnalyticsTab === 'revenue-summary'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          💰 Revenue Summary
                        </button>
                      </nav>
                    </div>

                    {/* Revenue Analysis Sub-Tab Content */}

                    {activeAnalyticsTab === 'ticket-capacity' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Ticket Capacity Analysis</h4>
                          {revenueLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              Loading...
                            </div>
                          )}
                        </div>
                        
                        {ticketCapacityData.length > 0 ? (
                          <div className="space-y-4">
                            {ticketCapacityData.map((ticketType) => (
                              <div key={ticketType.ticketTypeId} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium text-gray-900">{ticketType.ticketTypeName}</h5>
                                  <span className="text-sm font-medium text-gray-600">
                                    ${ticketType.ticketPrice.toFixed(2)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Sold:</span>
                                    <div className="font-semibold text-green-600">{ticketType.soldTickets}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Available:</span>
                                    <div className="font-semibold text-blue-600">{ticketType.availableTickets}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Total Capacity:</span>
                                    <div className="font-semibold text-gray-800">{ticketType.totalCapacity}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Utilization:</span>
                                    <div className="font-semibold text-purple-600">
                                      {ticketType.utilizationPercentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>0</span>
                                    <span>{ticketType.totalCapacity}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(ticketType.utilizationPercentage, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No ticket capacity data available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeAnalyticsTab === 'stripe-revenue' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Stripe Revenue Analysis</h4>
                          {revenueLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              Loading...
                            </div>
                          )}
                        </div>
                        
                        {stripeRevenueData ? (
                          <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600">Total Revenue</div>
                                <div className="text-2xl font-bold text-blue-800">
                                  ${stripeRevenueData.totalStripeRevenue.toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600">Tickets Sold</div>
                                <div className="text-2xl font-bold text-green-800">
                                  {stripeRevenueData.totalStripeTickets}
                                </div>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-sm text-purple-600">Transactions</div>
                                <div className="text-2xl font-bold text-purple-800">
                                  {stripeRevenueData.totalStripeTransactions}
                                </div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-sm text-orange-600">Avg. Price</div>
                                <div className="text-2xl font-bold text-orange-800">
                                  ${stripeRevenueData.averageTicketPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Pricing Tiers */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-4">Revenue by Pricing Tier</h5>
                              <div className="space-y-3">
                                {stripeRevenueData.pricingTiers.map((tier, index) => (
                                  <div key={index} className="bg-white border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">${tier.ticketPrice.toFixed(2)} tickets</span>
                                      <span className="text-sm text-gray-500">
                                        {tier.revenuePercentage.toFixed(1)}% of total revenue
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Revenue:</span>
                                        <div className="font-semibold">${tier.revenue.toFixed(2)}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Quantity:</span>
                                        <div className="font-semibold">{tier.quantity}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Transactions:</span>
                                        <div className="font-semibold">{tier.transactions}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Combinations:</span>
                                        <div className="font-semibold">{tier.seatCombinations}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No Stripe revenue data available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeAnalyticsTab === 'organizer-revenue' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Organizer Direct Sales</h4>
                          {revenueLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              Loading...
                            </div>
                          )}
                        </div>
                        
                        {organizerRevenueData ? (
                          <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600">Total Revenue</div>
                                <div className="text-2xl font-bold text-blue-800">
                                  ${organizerRevenueData.totalOrganizerRevenue.toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600">Paid Revenue</div>
                                <div className="text-2xl font-bold text-green-800">
                                  ${organizerRevenueData.paidOrganizerRevenue.toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-sm text-red-600">Unpaid Revenue</div>
                                <div className="text-2xl font-bold text-red-800">
                                  ${organizerRevenueData.unpaidOrganizerRevenue.toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-sm text-purple-600">Payment Rate</div>
                                <div className="text-2xl font-bold text-purple-800">
                                  {organizerRevenueData.overallPaymentPercentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Ticket Type Breakdown */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-4">Revenue by Ticket Type</h5>
                              <div className="space-y-3">
                                {organizerRevenueData.ticketTypes.map((ticketType) => (
                                  <div key={ticketType.ticketTypeId} className="bg-white border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">{ticketType.ticketTypeName}</span>
                                      <span className="text-sm text-gray-500">
                                        ${ticketType.ticketPrice.toFixed(2)} each
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Issued:</span>
                                        <div className="font-semibold">{ticketType.issuedTickets}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Paid:</span>
                                        <div className="font-semibold text-green-600">
                                          {ticketType.paidTickets} (${ticketType.paidRevenue.toFixed(2)})
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Unpaid:</span>
                                        <div className="font-semibold text-red-600">
                                          {ticketType.unpaidTickets} (${ticketType.unpaidRevenue.toFixed(2)})
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Payment Rate:</span>
                                        <div className="font-semibold text-purple-600">
                                          {ticketType.paymentPercentage.toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Paid: {ticketType.paidTickets}</span>
                                        <span>Total: {ticketType.issuedTickets}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-green-500 h-2 rounded-full"
                                          style={{
                                            width: `${Math.min(ticketType.paymentPercentage, 100)}%`
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No organizer revenue data available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeAnalyticsTab === 'revenue-summary' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Complete Revenue Summary</h4>
                          {revenueLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              Loading...
                            </div>
                          )}
                        </div>
                        
                        {revenueSummaryData ? (
                          <div className="space-y-6">
                            {/* Combined Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600">KiwiLanka Revenue</div>
                                <div className="text-lg font-bold text-green-800">
                                  ${revenueSummaryData.combinedSummary.kiwiLankaRevenue.toFixed(2)}
                                </div>
                                <div className="text-xs text-green-600">
                                  {revenueSummaryData.combinedSummary.kiwiLankaPercentage.toFixed(1)}% of total
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600">Organizer Revenue</div>
                                <div className="text-lg font-bold text-blue-800">
                                  ${revenueSummaryData.combinedSummary.organizerRevenue.toFixed(2)}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {revenueSummaryData.combinedSummary.organizerPercentage.toFixed(1)}% of total
                                </div>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-sm text-purple-600">Total Revenue</div>
                                <div className="text-lg font-bold text-purple-800">
                                  ${revenueSummaryData.combinedSummary.totalRevenue.toFixed(2)}
                                </div>
                                <div className="text-xs text-purple-600">
                                  {revenueSummaryData.combinedSummary.overallEventUtilization.toFixed(1)}% utilized
                                </div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4">
                                <div className="text-sm text-orange-600">Net to Organizer</div>
                                <div className="text-lg font-bold text-orange-800">
                                  ${revenueSummaryData.combinedSummary.estimatedNetToOrganizer.toFixed(2)}
                                </div>
                                <div className="text-xs text-orange-600">
                                  After fees: {revenueSummaryData.combinedSummary.estimatedNetPercentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Revenue Panels */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Max Possible Revenue Panel */}
                              <div className="bg-white border rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-3">
                                  {revenueSummaryData.maxPossibleRevenuePanel.panelTitle}
                                </h5>
                                <div className="space-y-2">
                                  {revenueSummaryData.maxPossibleRevenuePanel.breakdownItems.map((item, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">{item.ticketTypeName}:</span>
                                        <span className="font-medium">${item.revenue.toFixed(2)}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${item.ticketPrice.toFixed(2)} × {item.quantity}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                      <span>Total:</span>
                                      <span>${revenueSummaryData.maxPossibleRevenuePanel.totalRevenue.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* KiwiLanka Revenue Panel */}
                              <div className="bg-white border rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-3">
                                  {revenueSummaryData.kiwiLankaRevenuePanel.panelTitle}
                                </h5>
                                <div className="space-y-2">
                                  {revenueSummaryData.kiwiLankaRevenuePanel.breakdownItems.map((item, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">{item.ticketTypeName}:</span>
                                        <span className="font-medium">${item.revenue.toFixed(2)}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${item.ticketPrice.toFixed(2)} × {item.quantity}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                      <span>Total:</span>
                                      <span>${revenueSummaryData.kiwiLankaRevenuePanel.totalRevenue.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Organizer Revenue Panel */}
                              <div className="bg-white border rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-3">
                                  {revenueSummaryData.organizerRevenuePanel.panelTitle}
                                </h5>
                                <div className="space-y-2">
                                  {revenueSummaryData.organizerRevenuePanel.breakdownItems.map((item, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">{item.ticketTypeName}:</span>
                                        <span className="font-medium">${item.revenue.toFixed(2)}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${item.ticketPrice.toFixed(2)} × {item.quantity}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                      <span>Total:</span>
                                      <span>${revenueSummaryData.organizerRevenuePanel.totalRevenue.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No revenue summary data available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    {/* Booking Filters */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name Filter
                          </label>
                          <input
                            type="text"
                            value={nameFilter}
                            onChange={(e) => {
                              setNameFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Search by name..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Filter
                          </label>
                          <input
                            type="text"
                            value={emailFilter}
                            onChange={(e) => {
                              setEmailFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Search by email..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Status
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => {
                              setStatusFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={bookingsLoading}
                          >
                            <option value="all">All Bookings</option>
                            <option value="paid">Paid Only</option>
                            <option value="organizer">Organizer Guests</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              setNameFilter('');
                              setEmailFilter('');
                              setStatusFilter('all');
                              setCurrentPage(1);
                              // The useEffect will handle reloading the data
                            }}
                            disabled={bookingsLoading}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {bookingsLoading ? 'Loading...' : 'Clear Filters'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Filter Status Indicator */}
                      {(nameFilter || emailFilter || statusFilter !== 'all') && (
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center text-blue-600">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            <span>Filters applied</span>
                          </div>
                          {bookingsLoading && (
                            <div className="flex items-center text-gray-500">
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                              <span>Updating results...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {bookingsLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading booking details...</p>
                        </div>
                      ) : bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tickets
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Booking Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Payment
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bookings.map((booking) => (
                                <tr key={booking.bookingId} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {booking.firstName} {booking.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {booking.email}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {booking.ticketDetails.map(td => `${td.ticketTypeName} (${td.quantity})`).join(', ') || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {organizerSalesService.formatDate(booking.bookedTime)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        #{booking.paymentId}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {booking.ticketDetails.map(td => td.seatInfo).join(', ') || 'General'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        booking.paymentStatus === 'Completed' 
                                          ? 'bg-green-100 text-green-800' 
                                          : booking.paymentStatus === 'OrganizerDirect'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {booking.paymentStatus === 'OrganizerDirect' ? 'Organizer Guest' : booking.paymentStatus}
                                      </span>
                                      <div className="text-sm text-gray-900 mt-1">
                                        {organizerSalesService.formatCurrency(booking.totalAmount)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No bookings found for this event</p>
                        </div>
                      )}

                      {/* Pagination Info */}
                      {totalBookings > 0 && (
                        <div className="text-center text-sm text-gray-600 mt-4 p-4">
                          Showing {bookings.length} of {totalBookings} bookings
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* No Event Selected */
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Real-time Event Analytics
                  </h3>
                  <p className="text-blue-100">
                    Select an event from the sidebar to view detailed insights
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8">
                {/* Getting Started */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Get Started
                  </div>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Click on any event in the sidebar to unlock powerful analytics including sales trends, customer insights, and revenue tracking.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Daily Analytics</h4>
                    <p className="text-sm text-gray-600">Interactive charts showing daily sales trends and ticket sales patterns</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Booking Details</h4>
                    <p className="text-sm text-gray-600">Comprehensive booking information with advanced filtering and search</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Revenue Tracking</h4>
                    <p className="text-sm text-gray-600">Real-time revenue analytics with ticket breakdown and payment status</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attendance Insights</h4>
                    <p className="text-sm text-gray-600">Track attendance patterns and customer demographics</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Privacy Protected</h4>
                    <p className="text-sm text-gray-600">Customer data is anonymized and protected according to privacy standards</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Real-time Updates</h4>
                    <p className="text-sm text-gray-600">Live data updates every 30 seconds to keep you informed</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <div className="inline-flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Select an event to get started with analytics
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerSalesDashboardEnhanced;
