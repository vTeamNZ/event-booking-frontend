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
import FoodSelection from './pages/FoodSelection';
import PaymentSummary from './pages/PaymentSummary';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';
import TicketSelection from './pages/TicketSelection';
import SeatSelectionPage from './pages/SeatSelectionPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import EventPreview from './pages/EventPreview';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizers from './pages/AdminOrganizers';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import { VenueManagement } from './pages/VenueManagement';
import SeatingDemo from './components/SeatingDemo';
import ManageFoodItems from './pages/ManageFoodItems';
import EventPage from './pages/EventPage';

const App: React.FC = () => {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Google Analytics Route Tracker */}
        <RouteTracker />
        
        {/* Toast Notifications */}
        <Toaster />
        
        {/* Top Ribbon */}
        <div className="bg-red-900 h-1 w-full" />
        {/* Page Content */}
        <AnimatedHeader />
        <ConditionalCarousel />      
        <ConditionalMain>
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/event/:eventTitle/tickets" element={<TicketSelection />} />
            <Route path="/event/:eventTitle/seats" element={<SeatSelectionPage />} />
            <Route path="/event/:eventTitle/food" element={<FoodSelection />} />
            <Route path="/food-selection" element={<FoodSelection />} />
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
          
          {/* Direct Event Access Route - Must be before protected routes */}
          <Route path="/:eventTitle" element={<EventPage />} />
          
          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={
            <PrivateRoute>
              <OrganizerDashboard />
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
          <Route path="/seating-demo" element={<SeatingDemo />} />            <Route 
              path="/event/:eventId/manage-food" 
              element={
                <PrivateRoute>
                  <ManageFoodItems />
                </PrivateRoute>
              } 
            />
        </Routes>
        </ConditionalMain>
    </div>
    </BookingProvider>
  );
};

export default App;
