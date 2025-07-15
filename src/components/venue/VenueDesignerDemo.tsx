import React, { useState } from 'react';
import AdvancedVenueDesigner from './AdvancedVenueDesigner';
import type { VenueLayoutData } from './types';

const VenueDesignerDemo: React.FC = () => {
  const [layout, setLayout] = useState<VenueLayoutData | null>(null);
  const [stagePosition, setStagePosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  const handleLayoutChange = (newLayout: VenueLayoutData) => {
    setLayout(newLayout);
    console.log('Layout updated:', newLayout);
  };

  const handleStagePositionChange = (position: 'top' | 'bottom' | 'left' | 'right') => {
    setStagePosition(position);
    console.log('Stage position changed:', position);
  };

  const saveLayout = () => {
    if (layout) {
      // Here you would typically save to your backend
      console.log('Saving layout:', layout);
      localStorage.setItem('venueLayout', JSON.stringify(layout));
      alert('Layout saved to localStorage!');
    }
  };

  const loadLayout = () => {
    const saved = localStorage.getItem('venueLayout');
    if (saved) {
      const parsedLayout = JSON.parse(saved);
      setLayout(parsedLayout);
      alert('Layout loaded from localStorage!');
    } else {
      alert('No saved layout found!');
    }
  };

  const exportToJSON = () => {
    if (layout) {
      const dataStr = JSON.stringify(layout, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `venue-layout-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Venue Designer Demo</h1>
        <div className="flex space-x-2">
          <button
            onClick={loadLayout}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Load Layout
          </button>
          <button
            onClick={saveLayout}
            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Save Layout
          </button>
          <button
            onClick={exportToJSON}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Designer */}
      <div className="flex-1">
        <AdvancedVenueDesigner
          selectionMode="1" // 1 = theater, 2 = banquet, 3 = mixed
          onLayoutChange={handleLayoutChange}
          onStagePositionChange={handleStagePositionChange}
          initialLayout={layout}
          maxCapacity={1000}
          venue={{ name: 'Demo Venue' }}
        />
      </div>

      {/* Footer Info */}
      {layout && (
        <div className="bg-gray-50 border-t px-4 py-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>
              Layout Type: {layout.settings.type} | 
              Elements: {layout.elements.length} | 
              Total Capacity: {layout.elements.reduce((sum: number, el: any) => sum + (el.properties.capacity || 0), 0)}
            </span>
            <span>
              Dimensions: {layout.settings.dimensions.width}×{layout.settings.dimensions.height} | 
              Grid: {layout.settings.gridSize}px
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDesignerDemo;
