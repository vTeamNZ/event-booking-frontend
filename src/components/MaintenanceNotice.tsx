import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronUp, ChevronDown, X } from 'lucide-react';

interface MaintenanceConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  date: string;
  message: {
    title: string;
    description: string;
    interruption: string;
    apology: string;
  };
  styling: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    titleColor: string;
    iconColor: string;
    badgeColor: string;
  };
}

interface MaintenanceNoticeProps {
  // Optional props to override config file
  show?: boolean;
  startTime?: string;
  endTime?: string;
  date?: string;
}

const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({
  show,
  startTime,
  endTime,
  date
}) => {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config/maintenance.json');
        const data = await response.json();
        setConfig(data.maintenanceNotice);
      } catch (error) {
        console.error('Failed to load maintenance config:', error);
        // Fallback config
        setConfig({
          enabled: false,
          startTime: "10:00 PM",
          endTime: "11:00 PM",
          date: "today",
          message: {
            title: "Scheduled Maintenance Notice",
            description: "Our system will undergo scheduled maintenance",
            interruption: "During this time, you may experience brief service interruptions.",
            apology: "We apologize for any inconvenience and appreciate your patience."
          },
          styling: {
            backgroundColor: "bg-yellow-50",
            borderColor: "border-yellow-400",
            textColor: "text-yellow-700",
            titleColor: "text-yellow-800",
            iconColor: "text-yellow-400",
            badgeColor: "bg-yellow-100 text-yellow-600"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading || !config) return null;

  // Use props to override config if provided
  const isEnabled = show !== undefined ? show : config.enabled;
  const displayStartTime = startTime || config.startTime;
  const displayEndTime = endTime || config.endTime;
  const displayDate = date || config.date;

  if (!isEnabled || isDismissed) return null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const dismissNotice = () => {
    setIsDismissed(true);
  };

  return (
    <div className={`${config.styling.backgroundColor} border-l-4 ${config.styling.borderColor} mx-4 rounded-r-lg shadow-sm transition-all duration-300 ease-in-out ${isExpanded ? 'p-4 mb-4' : 'p-2 mb-2'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${config.styling.iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className={`h-4 w-4 ${config.styling.iconColor} mr-2`} />
                <h3 className={`text-sm font-medium ${config.styling.titleColor}`}>
                  {config.message.title}
                </h3>
                {/* Show time inline when collapsed */}
                {!isExpanded && (
                  <span className={`ml-3 text-xs ${config.styling.textColor} font-medium`}>
                    {displayDate === "today" ? "Today" : displayDate} {displayStartTime}-{displayEndTime}
                  </span>
                )}
              </div>            <div className="flex items-center space-x-2 ml-4">
              {/* Collapse/Expand Button */}
              <button
                onClick={toggleExpanded}
                className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-600 transition-colors duration-200 ${config.styling.textColor}`}
                title={isExpanded ? "Minimize notice" : "Expand notice"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {/* Dismiss Button */}
              <button
                onClick={dismissNotice}
                className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-600 transition-colors duration-200 ${config.styling.textColor}`}
                title="Dismiss notice"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Time Badge */}
              <div className={`text-xs ${config.styling.badgeColor} px-2 py-1 rounded`}>
                {displayDate === "today" ? "Today" : displayDate}
              </div>
            </div>
          </div>
          
          {/* Expandable Content */}
          {isExpanded && (
            <div className={`mt-2 text-sm ${config.styling.textColor} transition-all duration-300 ease-in-out`}>
              <p>
                <strong>Please be advised:</strong> {config.message.description}
                {displayDate === "today" ? " today" : ` on ${displayDate}`} from{" "}
                <span className="font-semibold">{displayStartTime} to {displayEndTime}</span>.
              </p>
              <p className="mt-1">
                {config.message.interruption} {config.message.apology}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceNotice;
