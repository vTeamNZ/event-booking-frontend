import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import About from './pages/About';
import Food from './pages/Food';
import Payment from './pages/Payment';
import TicketSelection from './pages/TicketSelection';

const App: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        📅 Upcoming Events
      </h1>

      <Routes>
        <Route path="/" element={<EventsList />} />
        <Route path="/event/:id/tickets" element={<TicketSelection />} />
        <Route path="/event/:id/food" element={<Food />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </div>
  );
};

export default App;
