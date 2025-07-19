// src/components/AnimatedHeader.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AnimatedHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload(); // Refresh to update the nav
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
<header
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
    ${isScrolled
      ? 'bg-black/80 backdrop-blur-md shadow-md py-2'
      : 'bg-black/30 backdrop-blur-sm py-4'
    }`}
>

  <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <Link to="/" className="flex justify-center items-center w-full h-full space-x-3 mb-2 sm:mb-0 sm:justify-start sm:w-auto">
      <img src="/kiwilanka-logo.png" alt="Logo" className="h-full max-h-14 w-auto object-contain" />
      {/* <span className="text-white text-xl font-semibold tracking-wide opacity-80">
        KIWI LANKA Event Booking
      </span> */}
    </Link>

    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
      <nav className="flex space-x-6 text-white text-base font-medium justify-center">
        <Link to="/" className="hover:underline hover:opacity-100 opacity-80 transition">Home</Link>
        <span className="opacity-50">•</span>
        <Link to="/about" className="hover:underline hover:opacity-100 opacity-80 transition">About</Link>
        <span className="opacity-50">•</span>
        <Link to="/contact" className="hover:underline hover:opacity-100 opacity-80 transition">Contact</Link>
      </nav>

      <div className="flex items-center space-x-4 text-white text-sm justify-center">
        {isAuthenticated ? (
          <>
            <Link to="/my-bookings" className="hover:underline hover:opacity-100 opacity-80 transition">
              My Bookings
            </Link>
            {currentUser?.roles?.includes('Admin') && (
              <Link to="/admin" className="hover:underline hover:opacity-100 opacity-80 transition">
                Admin
              </Link>
            )}
            {currentUser?.roles?.includes('Organizer') && (
              <Link to="/organizer/dashboard" className="hover:underline hover:opacity-100 opacity-80 transition">
                Dashboard
              </Link>
            )}
            <span className="opacity-80">Welcome, {currentUser?.fullName}</span>
            <button 
              onClick={handleLogout}
              className="hover:underline hover:opacity-100 opacity-80 transition bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline hover:opacity-100 opacity-80 transition">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white hover:text-white transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
</header>

  );
};

export default AnimatedHeader;
