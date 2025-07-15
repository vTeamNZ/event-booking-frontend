// src/components/NavBar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload(); // Refresh to update the nav
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">
        <Link to="/">🎫 Event Booking</Link>
      </h1>
      <ul className="flex space-x-6 items-center">
        <li>
          <Link to="/" className="hover:text-yellow-300">Home</Link>
        </li>
        <li>
          <Link to="/events" className="hover:text-yellow-300">Events</Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-yellow-300">About</Link>
        </li>
        
        {isAuthenticated ? (
          <>
            {currentUser?.role === 'Organizer' && (
              <li>
                <Link to="/organizer/dashboard" className="hover:text-yellow-300">Dashboard</Link>
              </li>
            )}
            <li className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Welcome, {currentUser?.fullName}</span>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="hover:text-yellow-300 bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="hover:text-yellow-300">Login</Link>
            </li>
            <li>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-red-700 px-3 py-1 rounded text-white hover:text-white"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
