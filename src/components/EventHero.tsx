import React from 'react';

interface EventHeroProps {
  title: string;
  imageUrl?: string | null;
  date?: string | null;
  location?: string;
  description?: string;
  price?: number | null;
  className?: string;
}

const EventHero: React.FC<EventHeroProps> = ({ 
  title, 
  imageUrl, 
  date, 
  location, 
  description,
  price,
  className = "" 
}) => {
  const fallbackImage = '/events/fallback.jpg';
  const backgroundImage = imageUrl || fallbackImage;

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {title}
          </h1>
          
          {date && (
            <p className="text-xl md:text-2xl mb-2 opacity-90">
              🕒 {new Date(date).toLocaleString()}
            </p>
          )}
          
          {location && (
            <p className="text-lg md:text-xl mb-4 opacity-90">
              📍 {location}
            </p>
          )}
          
          {description && (
            <p className="text-base md:text-lg max-w-3xl mx-auto mb-4 opacity-80 line-clamp-3">
              {description}
            </p>
          )}
          
          {price && (
            <p className="text-xl md:text-2xl font-semibold">
              From ${price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventHero;
