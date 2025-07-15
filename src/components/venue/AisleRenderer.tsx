import React from 'react';

interface AisleRendererProps {
  layoutData: {
    hasHorizontalAisles?: boolean;
    horizontalAisleRows?: string;
    hasVerticalAisles?: boolean;
    verticalAisleSeats?: string;
    aisleWidth?: number;
  };
  containerWidth: number;
  containerHeight: number;
  rowSpacing?: number;
  seatSpacing?: number;
}

const AisleRenderer: React.FC<AisleRendererProps> = ({
  layoutData,
  containerWidth,
  containerHeight,
  rowSpacing = 40,
  seatSpacing = 30
}) => {
  const parseAisleData = (data: string): number[] => {
    if (!data) return [];
    
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'number') : [];
      } catch {
        // If JSON parsing fails, try comma-separated values
        return data.split(',')
          .map(item => parseInt(item.trim()))
          .filter(num => !isNaN(num));
      }
    }
    
    if (typeof data === 'number') {
      return [data];
    }
    
    return [];
  };

  const aisles: JSX.Element[] = [];

  // Horizontal aisles
  if (layoutData.hasHorizontalAisles && layoutData.horizontalAisleRows) {
    const horizontalAisles = parseAisleData(layoutData.horizontalAisleRows);
    horizontalAisles.forEach((rowNum: number) => {
      const y = rowNum * rowSpacing;
      aisles.push(
        <div
          key={`h-aisle-${rowNum}`}
          className="absolute bg-gray-100 border-y border-gray-300 flex items-center justify-center z-10"
          style={{
            left: 0,
            top: `${y}px`,
            width: `${containerWidth}px`,
            height: `${layoutData.aisleWidth || 20}px`
          }}
        >
          <span className="text-xs text-gray-500 whitespace-nowrap px-2">
            Aisle
          </span>
        </div>
      );
    });
  }

  // Vertical aisles
  if (layoutData.hasVerticalAisles && layoutData.verticalAisleSeats) {
    const verticalAisles = parseAisleData(layoutData.verticalAisleSeats);
    verticalAisles.forEach((seatNum: number) => {
      const x = seatNum * seatSpacing;
      aisles.push(
        <div
          key={`v-aisle-${seatNum}`}
          className="absolute bg-gray-100 border-x border-gray-300 flex items-center justify-center z-10"
          style={{
            left: `${x}px`,
            top: 0,
            width: `${layoutData.aisleWidth || 20}px`,
            height: `${containerHeight}px`
          }}
        >
          <span 
            className="text-xs text-gray-500 whitespace-nowrap px-2"
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          >
            Aisle
          </span>
        </div>
      );
    });
  }

  return <>{aisles}</>;
};

export default AisleRenderer;
