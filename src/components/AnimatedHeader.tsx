// src/components/AnimatedHeader.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AnimatedHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

<nav className="flex space-x-6 text-white text-base font-medium justify-center">
  <Link to="/" className="hover:underline hover:opacity-100 opacity-80 transition">Home</Link>
  <span className="opacity-50">•</span>
  <Link to="/about" className="hover:underline hover:opacity-100 opacity-80 transition">About</Link>
  <span className="opacity-50">•</span>
  <Link to="/contact" className="hover:underline hover:opacity-100 opacity-80 transition">Contact</Link>
</nav>
  </div>
</header>

  );
};

export default AnimatedHeader;
