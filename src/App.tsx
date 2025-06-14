import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HeroCarousel from './components/HeroCarousel';
import AnimatedHeader from './components/AnimatedHeader';
import { PrivateRoute } from './components/PrivateRoute';
import EventsList from './pages/EventsList';
import About from './pages/About';
import FoodSelection from './pages/FoodSelection';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import TicketSelection from './pages/TicketSelection';
import Contact from './pages/Contact';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ribbon */}
      <div className="bg-red-900 h-1 w-full" />
      {/* Page Content */}
      <AnimatedHeader />
      <HeroCarousel />      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/event/:eventTitle/tickets" element={<TicketSelection />} />
          <Route path="/event/:eventTitle/food" element={<FoodSelection />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
