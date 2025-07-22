import React from 'react';

interface EventHeroProps {
  title: string;
  imageUrl?: string | null;
  date?: string | null;
  location?: string;
  description?: string;
  organizerName?: string; // For backward compatibility
  organizationName?: string; // Preferred - shows the organization/company name
  className?: string;
}

const EventHero: React.FC<EventHeroProps> = ({ 
  title, 
  imageUrl, 
  date, 
  location, 
  description,
  organizerName,
  organizationName,
  className = "" 
}) => {
  const fallbackImage = '/events/fallback.jpg';
  const backgroundImage = imageUrl || fallbackImage;

  // Prioritize organizationName over organizerName for display, with better fallback handling
  const displayName = (organizationName && organizationName.trim()) 
    ? organizationName.trim() 
    : (organizerName && organizerName.trim()) 
      ? organizerName.trim() 
      : 'Event Organizer';

  return (
    <div className={`relative ${className}`}>
      {/* Hero Image Section - Clean background without text overlay */}
      <div className="relative h-48 md:h-64 lg:h-72 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        >
          {/* Subtle gradient overlay for better visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>
        
        {/* Minimal branding in corner */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium opacity-80">
              {displayName}
            </span>
          </div>
        </div>
      </div>
      
      {/* Event Information Section - Dark cinema card below image */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Event details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                {title}
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-4 text-gray-300">
                {date && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{new Date(date).toLocaleString()}</span>
                  </div>
                )}
                
                {location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{location}</span>
                  </div>
                )}
              </div>
              
              {description && (
                <p className="text-gray-400 mt-3 text-lg leading-relaxed line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
