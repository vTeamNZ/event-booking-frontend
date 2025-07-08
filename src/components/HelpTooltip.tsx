import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle size={16} />
      </button>
      
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-32">
          {content}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-white border-l border-t border-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
