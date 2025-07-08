import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HeroCarousel from './components/HeroCarousel';
import AnimatedHeader from './components/AnimatedHeader';
import { PrivateRoute } from './components/PrivateRoute';
import RouteTracker from './components/RouteTracker';
import EventsList from './pages/EventsList';
import About from './pages/About';
import FoodSelection from './pages/FoodSelection';
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
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizers from './pages/AdminOrganizers';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import { VenueManagement } from './pages/VenueManagement';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Analytics Route Tracker */}
      <RouteTracker />
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Top Ribbon */}
      <div className="bg-red-900 h-1 w-full" />
      {/* Page Content */}
      <AnimatedHeader />
      <HeroCarousel />      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/event/:eventTitle/tickets" element={<TicketSelection />} />
          <Route path="/event/:eventTitle/seats" element={<SeatSelectionPage />} />
          <Route path="/event/:eventTitle/food" element={<FoodSelection />} />
          <Route path="/food-selection" element={<FoodSelection />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/contact" element={<Contact />} />
          
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
          
        </Routes>
      </main>
    </div>
  );
};

export default App;
