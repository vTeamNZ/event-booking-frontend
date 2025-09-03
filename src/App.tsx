import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ConditionalCarousel from './components/ConditionalCarousel';
import AnimatedHeader from './components/AnimatedHeader';
import ConditionalMain from './components/ConditionalMain';
import { PrivateRoute } from './components/PrivateRoute';
import { BookingProvider } from './contexts/BookingContext';
import RouteTracker from './components/RouteTracker';
import EventsList from './pages/EventsList';
import About from './pages/About';
import FoodSelectionEnhanced from './pages/FoodSelectionEnhanced';
import PaymentSummary from './pages/PaymentSummary';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';
import TicketSelection from './pages/TicketSelection';
import SeatSelectionPage from './pages/SeatSelectionPage';
import HybridSeatSelectionPage from './pages/HybridSeatSelectionPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerSalesDashboardEnhanced from './pages/OrganizerSalesDashboardEnhanced';
import OrganizerProfileEdit from './pages/OrganizerProfileEdit';
import OrganizerProfileView from './pages/OrganizerProfileView';
import CreateEvent from './pages/CreateEvent';
import EventPreview from './pages/EventPreview';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizers from './pages/AdminOrganizers';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import AdminRevenueDashboard from './pages/AdminRevenueDashboard';
import { VenueManagement } from './pages/VenueManagement';
import AdminPageUnderDevelopment from './pages/AdminPageUnderDevelopment';
import ManageFoodItems from './pages/ManageFoodItems';
import EventPage from './pages/EventPage';
import MyBookings from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import MaintenanceNotice from './components/MaintenanceNotice';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CookiePolicy from './pages/CookiePolicy';

const App: React.FC = () => {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Google Analytics Route Tracker */}
        <RouteTracker />
        
        {/* Toast Notifications */}
        <Toaster />
        
        {/* Maintenance Notice */}
        <div className="fixed top-0 left-0 right-0 z-[55]">
          <MaintenanceNotice />
        </div>
        
        {/* Top Ribbon */}
        <div className="bg-red-900 h-1 w-full" />
        
        {/* Page Content */}
        <div className="pt-24">
          <AnimatedHeader />
          <ConditionalCarousel />      
          <ConditionalMain>
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/event/:eventTitle/tickets" element={<TicketSelection />} />
            <Route path="/event/:eventTitle/seats" element={<SeatSelectionPage />} />
            <Route path="/event/:eventTitle/hybrid" element={<HybridSeatSelectionPage />} />
            <Route path="/event/:eventTitle/food" element={<FoodSelectionEnhanced />} />
            <Route path="/food-selection" element={<FoodSelectionEnhanced />} />
            <Route path="/payment-summary" element={<PaymentSummary />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/checkout" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Legal Document Routes */}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            
            {/* Booking Management Routes */}
            <Route path="/my-bookings" element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            } />
            <Route path="/booking/:id" element={
              <PrivateRoute>
                <BookingDetail />
              </PrivateRoute>
            } />
          
          {/* Direct Event Access Route - Must be before protected routes */}
          <Route path="/:eventTitle" element={<EventPage />} />
          
          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          } />
          <Route path="/organizer/sales" element={
            <PrivateRoute>
              <OrganizerSalesDashboardEnhanced />
            </PrivateRoute>
          } />
          <Route path="/organizer/profile/edit" element={
            <PrivateRoute>
              <OrganizerProfileEdit />
            </PrivateRoute>
          } />
          <Route path="/organizer/profile" element={
            <PrivateRoute>
              <OrganizerProfileView />
            </PrivateRoute>
          } />
          <Route path="/organizer/settings" element={
            <PrivateRoute>
              <OrganizerProfileView />
            </PrivateRoute>
          } />
          <Route path="/organizer/events/edit/:id" element={
            <PrivateRoute>
              <OrganizerProfileView />
            </PrivateRoute>
          } />
          <Route path="/organizer/events/create" element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          } />
          <Route path="/event/:id/preview" element={
            <PrivateRoute>
              <EventPreview />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/organizers" element={
            <PrivateRoute>
              <AdminOrganizers />
            </PrivateRoute>
          } />
          <Route path="/admin/events" element={
            <PrivateRoute>
              <AdminEvents />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          } />
          <Route path="/admin/venues" element={
            <PrivateRoute>
              <VenueManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/revenue" element={
            <PrivateRoute>
              <AdminRevenueDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute>
              <AdminPageUnderDevelopment />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute>
              <AdminPageUnderDevelopment />
            </PrivateRoute>
          } />
          <Route path="/admin/payments" element={
            <PrivateRoute>
              <AdminPageUnderDevelopment />
            </PrivateRoute>
          } />
          <Route path="/admin/audit" element={
            <PrivateRoute>
              <AdminPageUnderDevelopment />
            </PrivateRoute>
          } />
          <Route 
              path="/event/:eventId/manage-food" 
              element={
                <PrivateRoute>
                  <ManageFoodItems />
                </PrivateRoute>
              } 
            />
        </Routes>
        </ConditionalMain>
        
        {/* Footer */}
        <Footer />
        
        {/* Cookie Consent Banner */}
        <CookieConsentBanner />
        </div>
    </div>
    </BookingProvider>
  );
};

export default App;
