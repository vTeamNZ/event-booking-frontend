import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  organizerSalesService, 
  EventSalesDetail, 
  DailyAnalytics,
  BookingDetailView,
  TicketTypeBreakdown,
  ReservedSeatView 
} from '../services/organizerSalesService';
import { 
  RevenueAnalysisService,
  TicketCapacityDTO,
  TicketCapacityResponseDTO,
  TicketCapacitySummaryDTO,
  StripeRevenueAnalysisDTO,
  OrganizerRevenueDTO,
  RevenueSummaryDTO
} from '../services/revenueAnalysisService';
import OrganizerSalesManagementService from '../services/organizerSalesManagementService';
import { OrganizerTicketSalesDTO, SalesManagementFilters, UpdateCustomerDetailsRequest } from '../types/salesManagement';
import SalesManagementTable from '../components/SalesManagementTable';
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

type TabType = 'analytics' | 'bookings' | 'sales-management';
type AnalyticsSubTab = 'ticket-capacity' | 'stripe-revenue' | 'organizer-revenue' | 'revenue-summary';

const OrganizerSalesDashboardEnhanced: React.FC = () => {
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventSalesDetail | null>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [bookings, setBookings] = useState<BookingDetailView[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<AnalyticsSubTab>('ticket-capacity');
  const [loading, setLoading] = useState(false); // Changed from true to false since we use individual loading states
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Individual tile loading states to prevent full-page loading
  const [tilesLoading, setTilesLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(true);

  // Event data caching to prevent unnecessary reloads
  const [eventDataCache, setEventDataCache] = useState<Map<number, any>>(new Map());
  const [cacheTimestamps, setCacheTimestamps] = useState<Map<number, number>>(new Map());
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache
  
  // Revenue Analysis state for new tabs
  const [ticketCapacityData, setTicketCapacityData] = useState<TicketCapacityResponseDTO | null>(null);
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
  const [reservedSeats, setReservedSeats] = useState<ReservedSeatView[]>([]);
  const [pageSize] = useState(20);
  const [totalBookings, setTotalBookings] = useState(0);
  
  // Booking breakdown counts for "All Bookings" display
  const [stripeBookingsCount, setStripeBookingsCount] = useState(0);
  const [organizerBookingsCount, setOrganizerBookingsCount] = useState(0);
  const [reservedSeatsCount, setReservedSeatsCount] = useState(0);

  // Ticket breakdown state
  const [ticketBreakdown, setTicketBreakdown] = useState<TicketTypeBreakdown[]>([]);
  const [ticketBreakdownLoading, setTicketBreakdownLoading] = useState(false);

  // Sales Management state
  const [salesTickets, setSalesTickets] = useState<OrganizerTicketSalesDTO[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesFilters, setSalesFilters] = useState<SalesManagementFilters>({
    search: '',
    status: 'all'
  });
  const [editingTicket, setEditingTicket] = useState<number | null>(null);

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

  // Load initial data effect (only runs once and when selectedEventId/activeTab changes)
  useEffect(() => {
    // Clear cache when event selection changes to prevent data conflicts
    if (selectedEventId) {
      setEventDataCache(new Map());
      setCacheTimestamps(new Map());
    }

    // Load initial events list only when component mounts or when needed
    if (eventsList.length === 0) {
      loadEventsList();
    }

    // Load event-specific data when event selection changes
    if (selectedEventId) {
      loadEventDetail(selectedEventId);
      if (activeTab === 'analytics') {
        loadDailyAnalytics(selectedEventId);
        loadTicketBreakdown(selectedEventId);
      }
      // Note: Bookings are loaded by the filter effect below to ensure correct filter values
    }
  }, [selectedEventId, activeTab]);

  // Separate auto-refresh effect to prevent unnecessary reloads
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    // Only set up auto-refresh if it's enabled and we have a selected event
    if (autoRefresh && selectedEventId) {
      refreshInterval = setInterval(() => {
        performUnifiedRefresh();
      }, 30000); // 30 seconds
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh, selectedEventId, activeTab]);

  // Unified refresh function used by both manual refresh and auto-refresh
  const performUnifiedRefresh = async () => {
    if (!selectedEventId) return;
    
    try {
      // 1. Refresh event statistics for the events list
      await refreshEventStats();
      
      // 2. Refresh the selected event details
      await loadEventDetail(selectedEventId, true); // Force refresh to bypass cache
      
      // 3. Refresh tab-specific data
      if (activeTab === 'analytics') {
        await Promise.all([
          loadDailyAnalytics(selectedEventId),
          loadTicketBreakdown(selectedEventId),
          // Always refresh revenue data as it can be affected by sales management changes
          loadOrganizerRevenueData(selectedEventId)
        ]);
      } else if (activeTab === 'sales-management') {
        // Also refresh organizer revenue when refreshing sales management
        await Promise.all([
          loadSalesManagementData(selectedEventId),
          loadOrganizerRevenueData(selectedEventId)
        ]);
      }
      // Note: Bookings are automatically refreshed by the filter effect when filters change
      
    } catch (error) {
      console.error('Error during unified refresh:', error);
    }
  };

  // Manual refresh function for the button
  const performManualRefresh = async () => {
    await performUnifiedRefresh();
  };

  const loadEventsList = async () => {
    try {
      setEventsListLoading(true);
      setError(null);
      // Use the existing Events API to get organizer's events
      const response = await api.get('/organizer/events');
      const events = response.data as any[];
      
      // Filter for active events only
      const activeEvents = events.filter(event => event.isActive === true);
      
      // Show basic event data immediately, then load stats in background
      const eventsWithBasicData = activeEvents.map((event: any) => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        status: event.isActive ? 'Active' : 'Draft',
        totalTicketsSold: 0, // Will be updated by background loading
        totalNetRevenue: 0,  // Will be updated by background loading
        totalAttendance: 0
      }));
      
      // Sort by event date (earliest first)
      const sortedEvents = eventsWithBasicData.sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return dateA.getTime() - dateB.getTime();
      });
      
      setEventsList(sortedEvents);
      setEventsListLoading(false);
      
      // Auto-select the first event if no event is currently selected and events exist
      if (sortedEvents.length > 0 && !selectedEventId) {
        const firstEventId = sortedEvents[0].eventId;
        console.log('🎯 Auto-selecting first event:', firstEventId);
        handleEventSelect(firstEventId);
      }
      
      // Load tile data in background without blocking UI
      loadTileDataInBackground(activeEvents);
      
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events data');
      setEventsListLoading(false);
    }
  };

  // Cache helper functions
  const isCacheValid = (eventId: number): boolean => {
    const timestamp = cacheTimestamps.get(eventId);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION_MS;
  };

  const getCachedEventData = (eventId: number) => {
    if (isCacheValid(eventId)) {
      return eventDataCache.get(eventId);
    }
    return null;
  };

  const setCachedEventData = (eventId: number, data: any) => {
    setEventDataCache(prev => new Map(prev.set(eventId, data)));
    setCacheTimestamps(prev => new Map(prev.set(eventId, Date.now())));
  };

  const clearEventCache = (eventId?: number) => {
    if (eventId) {
      setEventDataCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(eventId);
        return newCache;
      });
      setCacheTimestamps(prev => {
        const newTimestamps = new Map(prev);
        newTimestamps.delete(eventId);
        return newTimestamps;
      });
    } else {
      // Clear all cache
      setEventDataCache(new Map());
      setCacheTimestamps(new Map());
    }
  };

  // Load tile data in background without affecting UI
  const loadTileDataInBackground = async (events: any[]) => {
    try {
      // Load stats data for each event in parallel
      const eventsWithStats = await Promise.all(events.map(async (event: any) => {
        try {
          // Get ticket capacity data for total sold tickets
          const ticketCapacityData = await RevenueAnalysisService.getTicketCapacity(event.id);
          const totalSoldTickets = ticketCapacityData?.summary?.totalSoldTickets || 0;
          
          // Get revenue summary data for total revenue
          const revenueSummaryData = await RevenueAnalysisService.getRevenueSummary(event.id);
          const totalRevenue = revenueSummaryData?.combinedSummary?.totalRevenue || 0;
          
          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            status: event.isActive ? 'Active' : 'Draft',
            totalTicketsSold: totalSoldTickets,
            totalNetRevenue: totalRevenue,
            totalAttendance: totalSoldTickets
          };
        } catch (error) {
          console.error(`Failed to load stats for event ${event.id}:`, error);
          // Return existing data if stats fail
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
      
      // Sort by event date (earliest first)
      const sortedEvents = eventsWithStats.sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Update events list with stats data
      setEventsList(sortedEvents);
    } catch (error) {
      console.error('Error loading tile data in background:', error);
    }
  };

  const refreshEventStats = async () => {
    if (eventsList.length === 0) return;
    
    try {
      setTilesLoading(true);
      
      // Clear cache for all events since we're refreshing
      clearEventCache();
      
      // Update events data with proper ticket capacity and revenue summary data
      const updatedEvents = await Promise.all(eventsList.map(async (event: any) => {
        try {
          // Get ticket capacity data for total sold tickets
          const ticketCapacityData = await RevenueAnalysisService.getTicketCapacity(event.eventId);
          const totalSoldTickets = ticketCapacityData?.summary?.totalSoldTickets || 0;
          
          // Get revenue summary data for total revenue
          const revenueSummaryData = await RevenueAnalysisService.getRevenueSummary(event.eventId);
          const totalRevenue = revenueSummaryData?.combinedSummary?.totalRevenue || 0;
          
          return {
            ...event, // Keep all existing event data
            totalTicketsSold: totalSoldTickets,
            totalNetRevenue: totalRevenue,
            totalAttendance: totalSoldTickets
          };
        } catch (error) {
          console.error(`Failed to refresh stats for event ${event.eventId}:`, error);
          // If refresh fails, keep existing data
          return event;
        }
      }));
      
      setEventsList(updatedEvents);
      
      // Also refresh the selected event detail if one is selected (force refresh to bypass cache)
      if (selectedEventId) {
        loadEventDetail(selectedEventId, true);
      }
    } catch (error) {
      console.error('Error refreshing event stats:', error);
    } finally {
      setTilesLoading(false);
    }
  };

  const loadEventDetail = async (eventId: number, forceRefresh = false) => {
    try {
      console.log('🔥 Loading event detail for:', eventId);
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = getCachedEventData(eventId);
        if (cachedData) {
          console.log('📦 Using cached event detail for:', eventId);
          setSelectedEventDetail(cachedData.eventDetail);
          setSelectedEventId(eventId);
          
          // Update all related data from cache
          if (cachedData.ticketCapacityData) setTicketCapacityData(cachedData.ticketCapacityData);
          if (cachedData.revenueSummaryData) setRevenueSummaryData(cachedData.revenueSummaryData);
          if (cachedData.stripeRevenueData) setStripeRevenueData(cachedData.stripeRevenueData);
          if (cachedData.organizerRevenueData) setOrganizerRevenueData(cachedData.organizerRevenueData);
          
          return; // Exit early with cached data
        }
      }
      
      setDetailLoading(true);
      
      // Load all event data in parallel
      const [
        eventDetailData,
        ticketCapacityData,
        revenueSummaryData,
        stripeRevenueData,
        organizerRevenueData
      ] = await Promise.all([
        organizerSalesService.getEventSalesDetail(eventId),
        RevenueAnalysisService.getTicketCapacity(eventId).catch(() => null),
        RevenueAnalysisService.getRevenueSummary(eventId).catch(() => null),
        RevenueAnalysisService.getStripeRevenue(eventId).catch(() => null),
        RevenueAnalysisService.getOrganizerRevenue(eventId).catch(() => null)
      ]);

      console.log('🔥 Event detail loaded:', eventDetailData);
      
      // Update all state
      setSelectedEventDetail(eventDetailData);
      setSelectedEventId(eventId);
      setTicketCapacityData(ticketCapacityData);
      setRevenueSummaryData(revenueSummaryData);
      setStripeRevenueData(stripeRevenueData);
      setOrganizerRevenueData(organizerRevenueData);
      
      // Cache the loaded data
      setCachedEventData(eventId, {
        eventDetail: eventDetailData,
        ticketCapacityData,
        revenueSummaryData,
        stripeRevenueData,
        organizerRevenueData
      });
      
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
      
      // If "Reserved Seats" filter is selected, load reserved seats instead
      if (statusFilter === 'reserved') {
        const data = await organizerSalesService.getEventReservedSeats(
          eventId,
          currentPage,
          pageSize
        );
        console.log('🪑 Reserved seats loaded:', data.reservedSeats.length, 'total:', data.totalCount);
        setReservedSeats(data.reservedSeats);
        setBookings([]); // Clear bookings when showing reserved seats
        setTotalBookings(data.totalCount);
      } else {
        const searchQuery = nameFilter || emailFilter ? `${nameFilter} ${emailFilter}`.trim() : undefined;
        const statusQuery = statusFilter === 'all' ? undefined : statusFilter;
        
        console.log('🔍 Sending booking request:', {
          eventId,
          currentPage,
          pageSize,
          searchQuery,
          statusQuery,
          statusFilter
        });
        
        const data = await organizerSalesService.getEventBookings(
          eventId, 
          currentPage, 
          pageSize, 
          searchQuery,
          statusQuery
        );
        
        console.log('📊 Bookings loaded:', data.bookings.length, 'total:', data.totalCount);
        console.log('📊 Booking sources breakdown:', {
          stripe: data.stripeCount || data.bookings.filter(b => b.paymentStatus !== 'OrganizerDirect' && b.paymentStatus !== 'Reserved').length,
          organizer: data.organizerCount || data.bookings.filter(b => b.paymentStatus === 'OrganizerDirect').length,
          reserved: data.reservedCount || data.bookings.filter(b => b.paymentStatus === 'Reserved').length,
          statusFilter: statusFilter
        });
        setBookings(data.bookings);
        setReservedSeats([]); // Clear reserved seats when showing bookings
        setTotalBookings(data.totalCount);
        
        // Set breakdown counts for "All Bookings" display
        setStripeBookingsCount(data.stripeCount || data.bookings.filter(b => b.paymentStatus !== 'OrganizerDirect' && b.paymentStatus !== 'Reserved').length);
        setOrganizerBookingsCount(data.organizerCount || data.bookings.filter(b => b.paymentStatus === 'OrganizerDirect').length);
        setReservedSeatsCount(data.reservedCount || data.bookings.filter(b => b.paymentStatus === 'Reserved').length);
      }
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
      console.log(`🔄 Loading organizer revenue data for event ${eventId}...`);
      const data = await RevenueAnalysisService.getOrganizerRevenue(eventId);
      console.log('📊 Raw organizer revenue response:', data);
      console.log('📊 Organizer revenue data properties:', {
        totalOrganizerRevenue: data.totalOrganizerRevenue,
        paidOrganizerRevenue: data.paidOrganizerRevenue,
        unpaidOrganizerRevenue: data.unpaidOrganizerRevenue,
        overallPaymentPercentage: data.overallPaymentPercentage,
        ticketTypes: data.ticketTypes?.length || 0,
        dataType: typeof data,
        hasTicketTypes: !!data.ticketTypes,
        allKeys: Object.keys(data || {})
      });
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

  const loadSalesManagementData = async (eventId: number) => {
    try {
      setSalesLoading(true);
      const tickets = await OrganizerSalesManagementService.getTicketsForSalesManagement(eventId);
      setSalesTickets(tickets);
    } catch (err: any) {
      console.error('Error loading sales management data:', err);
      toast.error('Failed to load sales management data');
    } finally {
      setSalesLoading(false);
    }
  };

  const handleEventSelect = (eventId: number) => {
    console.log('🔥 Event selected:', eventId);
    setSelectedEventId(eventId);
    
    // Load event detail with all data (using cache if available)
    loadEventDetail(eventId);
    
    // Set active tab to analytics
    setActiveTab('analytics');
    
    // Load additional analytics data that's not cached in main event detail
    console.log('🔥 Loading analytics for event:', eventId);
    loadDailyAnalytics(eventId);
    loadTicketBreakdown(eventId);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (selectedEventId) {
      if (tab === 'analytics') {
        // Only load analytics data if not cached or missing
        if (!dailyAnalytics.length) {
          loadDailyAnalytics(selectedEventId);
        }
        if (!ticketBreakdown.length) {
          loadTicketBreakdown(selectedEventId);
        }
      } else if (tab === 'sales-management') {
        // Load sales management data
        loadSalesManagementData(selectedEventId);
      }
      // Note: Bookings are loaded by the filter effect to ensure correct filter values
    }
  };

  const handleAnalyticsSubTabChange = (subTab: AnalyticsSubTab) => {
    setActiveAnalyticsTab(subTab);
    if (selectedEventId) {
      // Load data for the specific sub-tab if not already loaded
      if (subTab === 'ticket-capacity' && (!ticketCapacityData || ticketCapacityData.ticketTypes.length === 0)) {
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

  // Effect to handle filter changes - Debounced to prevent too many API calls
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
                  {/* Manual Refresh Button */}
                  <button 
                    onClick={() => performManualRefresh()}
                    disabled={tilesLoading}
                    className={`bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors ${
                      tilesLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Refresh all data"
                  >
                    {tilesLoading ? (
                      <div className="flex items-center text-white text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Refreshing...
                      </div>
                    ) : (
                      <div className="flex items-center text-white text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </div>
                    )}
                  </button>
                  
                  {/* Auto-refresh Toggle */}
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <label className="text-white text-sm flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="select-none">Auto-refresh (30s)</span>
                    </label>
                  </div>
                  
                  {/* Cache Indicator */}
                  {eventDataCache.size > 0 && (
                    <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Data cached"></div>
                      <span className="text-xs text-white">{eventDataCache.size} cached</span>
                      <button
                        onClick={() => clearEventCache()}
                        className="text-xs text-white/70 hover:text-red-300 transition-colors ml-2"
                        title="Clear all cache"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  
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
                  {eventsListLoading ? (
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
                    <button
                      onClick={() => handleTabChange('sales-management')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'sales-management'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🎫 Sales Management
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
                        
                        {ticketCapacityData && ticketCapacityData.ticketTypes.length > 0 ? (
                          <div className="space-y-6">
                            {/* Summary Totals Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                              <h5 className="font-semibold text-gray-900 mb-4">Overall Summary</h5>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-gray-600">Total Sold:</span>
                                  <div className="font-semibold text-green-600 text-lg">
                                    {ticketCapacityData.summary.totalSoldTickets}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Reserved:</span>
                                  <div className="font-semibold text-orange-600 text-lg">
                                    {ticketCapacityData.summary.totalReservedTickets}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Available:</span>
                                  <div className="font-semibold text-blue-600 text-lg">
                                    {ticketCapacityData.summary.totalAvailableTickets}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Max Capacity:</span>
                                  <div className="font-semibold text-gray-800 text-lg">
                                    {ticketCapacityData.summary.totalMaxCapacity}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Overall Utilization:</span>
                                  <div className="font-semibold text-purple-600 text-lg">
                                    {ticketCapacityData.summary.overallUtilizationPercentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>0</span>
                                  <span>{ticketCapacityData.summary.totalMaxCapacity}</span>
                                </div>
                                <div className="w-full bg-gray-300 rounded-full h-3">
                                  <div
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min(ticketCapacityData.summary.overallUtilizationPercentage, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Individual Ticket Types */}
                            <div className="space-y-4">
                              {ticketCapacityData.ticketTypes.map((ticketType) => (
                                <div key={ticketType.ticketTypeId} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-gray-900">{ticketType.ticketTypeName}</h5>
                                    <span className="text-sm font-medium text-gray-600">
                                      ${ticketType.ticketPrice.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Sold:</span>
                                      <div className="font-semibold text-green-600">{ticketType.soldTickets}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Reserved:</span>
                                      <div className="font-semibold text-orange-600">{ticketType.reservedTickets}</div>
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
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600">Total Revenue</div>
                                <div className="text-2xl font-bold text-blue-800">
                                  ${(organizerRevenueData.totalOrganizerRevenue || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600">Paid Revenue</div>
                                <div className="text-2xl font-bold text-green-800">
                                  ${(organizerRevenueData.paidOrganizerRevenue || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-sm text-red-600">Unpaid Revenue</div>
                                <div className="text-2xl font-bold text-red-800">
                                  ${(organizerRevenueData.unpaidOrganizerRevenue || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="text-sm text-yellow-600">Total Tickets</div>
                                <div className="text-2xl font-bold text-yellow-800">
                                  {organizerRevenueData.totalIssued || 0}
                                </div>
                              </div>
                              <div className="bg-indigo-50 rounded-lg p-4">
                                <div className="text-sm text-indigo-600">Transactions</div>
                                <div className="text-2xl font-bold text-indigo-800">
                                  {organizerRevenueData.totalTransactions || 0}
                                </div>
                              </div>
                            </div>

                            {/* Ticket Type Breakdown */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-4">Revenue by Ticket Type</h5>
                              <div className="space-y-3">
                                {(organizerRevenueData.ticketTypes || []).map((ticketType) => (
                                  <div key={ticketType.ticketTypeId} className="bg-white border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">{ticketType.ticketTypeName || 'Unknown'}</span>
                                      <span className="text-sm text-gray-500">
                                        ${(ticketType.ticketPrice || 0).toFixed(2)} each
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Issued:</span>
                                        <div className="font-semibold">{ticketType.issuedTickets || 0}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Paid:</span>
                                        <div className="font-semibold text-green-600">
                                          {ticketType.paidTickets || 0} (${(ticketType.paidRevenue || 0).toFixed(2)})
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Unpaid:</span>
                                        <div className="font-semibold text-red-600">
                                          {ticketType.unpaidTickets || 0} (${(ticketType.unpaidRevenue || 0).toFixed(2)})
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Payment Rate:</span>
                                        <div className="font-semibold text-purple-600">
                                          {(ticketType.paymentPercentage || 0).toFixed(1)}%
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            </div>

                            {/* Revenue Panels */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <option value="reserved">Reserved Seats (No Booking)</option>
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
                      {/* Status Info Bar - Shows what data is being displayed */}
                      {!bookingsLoading && statusFilter === 'all' && totalBookings > 0 && (
                        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
                          <div className="text-sm text-blue-800">
                            {reservedSeatsCount > 0 ? (
                              `Showing: ${stripeBookingsCount} Online Bookings + ${organizerBookingsCount} Organizer Guests + ${reservedSeatsCount} Reserved Seats = ${totalBookings} Total`
                            ) : (
                              `Showing: ${stripeBookingsCount} Online Bookings + ${organizerBookingsCount} Organizer Guests = ${totalBookings} Total Bookings`
                            )}
                          </div>
                        </div>
                      )}
                      
                      {bookingsLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading {statusFilter === 'reserved' ? 'reserved seats' : 'booking details'}...</p>
                        </div>
                      ) : statusFilter === 'reserved' && reservedSeats.length > 0 ? (
                        /* Reserved Seats Table */
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Seat Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Row / Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ticket Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Days Since Booked
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Reservation Info
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reservedSeats.map((seat) => (
                                <tr key={seat.seatId} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {seat.seatNumber}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      Row {seat.row}, Seat {seat.number}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {seat.ticketTypeName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {organizerSalesService.formatCurrency(seat.seatPrice)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      seat.daysSinceBooked > 7 
                                        ? 'bg-red-100 text-red-800' 
                                        : seat.daysSinceBooked > 3
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {seat.daysSinceBooked} {seat.daysSinceBooked === 1 ? 'day' : 'days'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">
                                      {seat.reservedBy ? (
                                        <div>
                                          <div>Reserved by: {seat.reservedBy}</div>
                                          {seat.reservedUntil && (
                                            <div>Until: {new Date(seat.reservedUntil).toLocaleString()}</div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-gray-400 italic">No reservation info</div>
                                      )}
                                      <div className="mt-1 text-xs">
                                        Marked: {new Date(seat.markedAsBookedTime).toLocaleString()}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : bookings.length > 0 ? (
                        /* Bookings Table */
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
                          <p>{statusFilter === 'reserved' ? 'No reserved seats found for this event' : 'No bookings found for this event'}</p>
                        </div>
                      )}

                      {/* Pagination Info */}
                      {totalBookings > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            {/* Pagination Info */}
                            <div className="text-sm text-gray-600">
                              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalBookings)} of {totalBookings} {statusFilter === 'reserved' ? 'reserved seats' : 'bookings'}
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                  }
                                }}
                                disabled={currentPage === 1 || bookingsLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              
                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {(() => {
                                  const totalPages = Math.ceil(totalBookings / pageSize);
                                  const pages = [];
                                  const maxVisiblePages = 5;
                                  
                                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                  
                                  if (endPage - startPage < maxVisiblePages - 1) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                  }
                                  
                                  if (startPage > 1) {
                                    pages.push(
                                      <button
                                        key={1}
                                        onClick={() => setCurrentPage(1)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                      >
                                        1
                                      </button>
                                    );
                                    if (startPage > 2) {
                                      pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                                    }
                                  }
                                  
                                  for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                      <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        disabled={bookingsLoading}
                                        className={`px-3 py-1 text-sm border rounded-md ${
                                          currentPage === i
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        {i}
                                      </button>
                                    );
                                  }
                                  
                                  if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                      pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                                    }
                                    pages.push(
                                      <button
                                        key={totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                      >
                                        {totalPages}
                                      </button>
                                    );
                                  }
                                  
                                  return pages;
                                })()}
                              </div>
                              
                              <button
                                onClick={() => {
                                  const totalPages = Math.ceil(totalBookings / pageSize);
                                  if (currentPage < totalPages) {
                                    setCurrentPage(currentPage + 1);
                                  }
                                }}
                                disabled={currentPage >= Math.ceil(totalBookings / pageSize) || bookingsLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sales Management Tab */}
                {activeTab === 'sales-management' && (
                  <div className="space-y-6">
                    {/* Search and Filter Controls */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Customers
                          </label>
                          <input
                            type="text"
                            value={salesFilters.search}
                            onChange={(e) => setSalesFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search by name or email..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status Filter
                          </label>
                          <select
                            value={salesFilters.status}
                            onChange={(e) => setSalesFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'cancelled' }))}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Tickets</option>
                            <option value="active">Active Only</option>
                            <option value="cancelled">Cancelled Only</option>
                          </select>
                        </div>
                        <button
                          onClick={() => loadSalesManagementData(selectedEventId!)}
                          disabled={salesLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {salesLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                    </div>

                    {/* Sales Management Table */}
                    {salesLoading ? (
                      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading sales data...</p>
                      </div>
                    ) : (
                      <SalesManagementTable
                        tickets={salesTickets}
                        filters={salesFilters}
                        onUpdateCustomer={async (ticketId: number, customerData: UpdateCustomerDetailsRequest) => {
                          try {
                            await OrganizerSalesManagementService.updateCustomerDetails(ticketId, customerData);
                            toast.success('Customer details updated successfully');
                            await loadSalesManagementData(selectedEventId!); // Refresh data
                          } catch (error) {
                            console.error('Error updating customer details:', error);
                            toast.error('Failed to update customer details');
                            throw error;
                          }
                        }}
                        onTogglePayment={async (ticketId: number, isPaid: boolean) => {
                          try {
                            console.log(`🔄 Toggling payment status for ticket ${ticketId} to ${isPaid ? 'PAID' : 'UNPAID'}`);
                            
                            // Log current revenue before update
                            console.log('📊 Revenue BEFORE toggle:', {
                              totalRevenue: organizerRevenueData?.totalOrganizerRevenue,
                              paidRevenue: organizerRevenueData?.paidOrganizerRevenue,
                              unpaidRevenue: organizerRevenueData?.unpaidOrganizerRevenue
                            });
                            
                            await OrganizerSalesManagementService.togglePaymentStatus(ticketId, { isPaid });
                            toast.success(isPaid ? 'Marked as paid' : 'Marked as unpaid');
                            
                            // Refresh data and log results
                            await loadSalesManagementData(selectedEventId!); // Refresh sales management data
                            await loadOrganizerRevenueData(selectedEventId!); // Refresh organizer revenue data
                            
                            // Log revenue after update (will log in next render)
                            setTimeout(() => {
                              console.log('📊 Revenue AFTER toggle:', {
                                totalRevenue: organizerRevenueData?.totalOrganizerRevenue,
                                paidRevenue: organizerRevenueData?.paidOrganizerRevenue,
                                unpaidRevenue: organizerRevenueData?.unpaidOrganizerRevenue
                              });
                            }, 1000);
                            
                          } catch (error) {
                            console.error('Error toggling payment status:', error);
                            toast.error('Failed to update payment status');
                          }
                        }}
                        onCancelTicket={async (ticketId: number) => {
                          try {
                            await OrganizerSalesManagementService.cancelTicket(ticketId);
                            toast.success('Ticket cancelled permanently');
                            await loadSalesManagementData(selectedEventId!); // Refresh sales management data
                            await loadOrganizerRevenueData(selectedEventId!); // Refresh organizer revenue data
                          } catch (error) {
                            console.error('Error cancelling ticket:', error);
                            toast.error('Failed to cancel ticket');
                          }
                        }}
                        editingTicket={editingTicket}
                        setEditingTicket={setEditingTicket}
                      />
                    )}
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
