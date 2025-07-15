import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Save, RotateCw } from 'lucide-react';
import { VenueLayoutData, Section, VenueDesignerProps } from './types';

const AdvancedVenueDesigner: React.FC<VenueDesignerProps> = ({
  selectionMode = '1',
  onLayoutChange = () => {},
  onStagePositionChange = () => {},
  initialLayout = null,
  maxCapacity = 1000,
  venue = null
}) => {
  const calculateDimensions = (seatsPerRow: number, numberOfRows: number, seatSpacing: number, rowSpacing: number) => {
    const margin = 50; // Margin from the edges
    const stageMargin = 100; // Space for stage
    const width = Math.max(800, seatsPerRow * seatSpacing + margin * 2);
    const height = Math.max(600, numberOfRows * rowSpacing + stageMargin + margin * 2);
    return { width, height };
  };

  // State for venue configuration
  const [venueConfig, setVenueConfig] = useState({
    name: venue?.name || 'New Venue',
    type: selectionMode === '1' ? 'theater' : selectionMode === '2' ? 'banquet' : 'mixed',
    numberOfRows: initialLayout?.settings?.dimensions?.height ? 
      Math.floor(initialLayout.settings.dimensions.height / 40) : 10,
    seatsPerRow: initialLayout?.settings?.dimensions?.width ? 
      Math.floor(initialLayout.settings.dimensions.width / 30) : 12,
    rowSpacing: 40,
    seatSpacing: 30,
    hasStaggeredSeating: false,
    hasWheelchairSpaces: false,
    wheelchairSpaces: 0,
    stagePosition: 'top',
    width: 800,
    height: 600,
  });

  // State for sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'vip',
      name: 'VIP',
      color: '#DC2626',
      level: 0,
      basePrice: 100,
      capacity: 0,
      elements: []
    },
    {
      id: 'premium',
      name: 'Premium',
      color: '#2563EB',
      level: 0,
      basePrice: 75,
      capacity: 0,
      elements: []
    },
    {
      id: 'standard',
      name: 'Standard',
      color: '#4B5563',
      level: 0,
      basePrice: 50,
      capacity: 0,
      elements: []
    }
  ]);
  
  // State for section assignment
  const [sectionAssignments, setSectionAssignments] = useState([
    { rowStart: 0, rowEnd: 2, sectionId: 'vip' },
    { rowStart: 3, rowEnd: 5, sectionId: 'premium' },
    { rowStart: 6, rowEnd: 20, sectionId: 'standard' }
  ]);

  // State for settings
  const [showSettings, setShowSettings] = useState(false);

  // Generate the layout whenever venue configuration changes
  const generatedLayout = useMemo(() => {
    // Helper function to generate venue layout
    const generateLayout = (
      config: any, 
      secs: Section[], 
      assignments: { rowStart: number, rowEnd: number, sectionId: string }[]
    ): VenueLayoutData => {
      // Calculate dimensions
      const margin = 50; // Margin from the edges
      const totalWidth = Math.max(800, config.seatsPerRow * config.seatSpacing + margin * 2);
      const totalHeight = Math.max(600, config.numberOfRows * config.rowSpacing + margin * 2);
      
      // Calculate center offsets for positioning
      const startX = (totalWidth - config.seatsPerRow * config.seatSpacing) / 2;
      const startY = config.stagePosition === 'top' ? 100 : margin;
      
      // Generate seats
      const elements = [];
      let seatId = 1;
      
      // Track seats per section for capacity
      const sectionCapacity: Record<string, number> = {};
      secs.forEach(section => {
        sectionCapacity[section.id] = 0;
      });
      
      // Generate the stage
      let stageElement = null;
      const stageWidth = Math.min(600, totalWidth * 0.8);
      const stageHeight = 40;
      
      if (config.stagePosition === 'top') {
        stageElement = {
          id: 'stage',
          type: 'stage' as const,
          x: (totalWidth - stageWidth) / 2,
          y: 40,
          width: stageWidth,
          height: stageHeight,
          sectionId: 'general',
          level: 0,
          properties: { label: 'Stage' },
        };
      } else if (config.stagePosition === 'bottom') {
        stageElement = {
          id: 'stage',
          type: 'stage' as const,
          x: (totalWidth - stageWidth) / 2,
          y: totalHeight - 80,
          width: stageWidth,
          height: stageHeight,
          sectionId: 'general',
          level: 0,
          properties: { label: 'Stage' },
        };
      } else if (config.stagePosition === 'left') {
        stageElement = {
          id: 'stage',
          type: 'stage' as const,
          x: 40,
          y: (totalHeight - stageWidth) / 2,
          width: stageHeight,
          height: stageWidth,
          sectionId: 'general',
          level: 0,
          properties: { label: 'Stage' },
        };
      } else if (config.stagePosition === 'right') {
        stageElement = {
          id: 'stage',
          type: 'stage' as const,
          x: totalWidth - 80,
          y: (totalHeight - stageWidth) / 2,
          width: stageHeight,
          height: stageWidth,
          sectionId: 'general',
          level: 0,
          properties: { label: 'Stage' },
        };
      }
      
      if (stageElement) {
        elements.push(stageElement);
      }
      
      // Generate seats
      for (let row = 0; row < config.numberOfRows; row++) {
        const rowLabel = String.fromCharCode(65 + row);
        
        // Find the section for this row
        const assignment = assignments.find(
          a => row >= a.rowStart && row <= a.rowEnd
        );
        const sectionId = assignment ? assignment.sectionId : 'standard';
        
        // Find section for pricing
        const section = secs.find(s => s.id === sectionId);
        const basePrice = section ? section.basePrice : 50;
        
        // Update section capacity
        if (section) {
          sectionCapacity[section.id] = (sectionCapacity[section.id] || 0) + config.seatsPerRow;
        }
        
        // Calculate row offset for staggered seating
        const rowOffset = config.hasStaggeredSeating && row % 2 === 1 ? config.seatSpacing / 2 : 0;
        
        for (let seat = 0; seat < config.seatsPerRow; seat++) {
          // Determine if this seat should be a wheelchair space
          const isWheelchair = config.hasWheelchairSpaces && 
            row === 0 && 
            (seat === 0 || seat === config.seatsPerRow - 1);
            
          if (isWheelchair && config.wheelchairSpaces <= 0) {
            continue;
          }
          
          const x = startX + (seat * config.seatSpacing) + rowOffset;
          const y = startY + (row * config.rowSpacing);
          
          elements.push({
            id: `seat-${seatId++}`,
            type: 'seat' as const,
            x,
            y,
            width: 30,
            height: 30,
            sectionId,
            level: 0,
            properties: {
              seatNumber: `${seat + 1}`,
              rowLetter: rowLabel,
              isAccessible: isWheelchair,
              isVip: sectionId === 'vip',
              isBookable: true,
              basePrice
            }
          });
        }
      }
      
      // Update sections with capacities
      const updatedSections = secs.map(section => ({
        ...section,
        capacity: sectionCapacity[section.id] || 0
      }));
      
      // Create and return the layout
      return {
        sections: updatedSections,
        elements,
        settings: {
          name: config.name,
          type: config.type,
          maxCapacity: config.numberOfRows * config.seatsPerRow,
          dimensions: {
            width: totalWidth,
            height: totalHeight
          },
          defaultSectionColor: '#e2e8f0',
          gridSize: 10,
          showGrid: true,
          snapToGrid: true,
          allowMultipleSelections: true,
          enforceCapacityLimits: true
        }
      };
    };

    return generateLayout(venueConfig, sections, sectionAssignments);
  }, [venueConfig, sections, sectionAssignments]);

  // Calculate dimensions and generate layout whenever configuration changes
  useEffect(() => {
    const { width, height } = calculateDimensions(
      venueConfig.seatsPerRow,
      venueConfig.numberOfRows,
      venueConfig.seatSpacing,
      venueConfig.rowSpacing
    );
    setVenueConfig(prev => ({ ...prev, width, height }));
  }, [venueConfig.seatsPerRow, venueConfig.numberOfRows, venueConfig.seatSpacing, venueConfig.rowSpacing]);

  // Update parent component with layout changes
  useEffect(() => {
    onLayoutChange(generatedLayout);
    onStagePositionChange(venueConfig.stagePosition as any);
  }, [generatedLayout, venueConfig.stagePosition, onLayoutChange, onStagePositionChange]);

  // Load initial layout if provided
  useEffect(() => {
    if (initialLayout) {
      // Extract configuration from initialLayout if available
      try {
        // This is a simplified approach - would need more complex logic for a real implementation
        const existingSections = initialLayout.sections || [];
        if (existingSections.length > 0) {
          setSections(existingSections);
        }
        
        const settings = initialLayout.settings;
        if (settings) {
          setVenueConfig(prev => ({
            ...prev,
            name: settings.name || prev.name,
            type: settings.type || prev.type,
            width: settings.dimensions?.width || prev.width,
            height: settings.dimensions?.height || prev.height,
          }));
        }
      } catch (error) {
        console.error('Error loading initial layout:', error);
      }
    }
  }, [initialLayout]);

  // Update section assignment
  const handleSectionAssignmentChange = (index: number, field: 'rowStart' | 'rowEnd' | 'sectionId', value: any) => {
    const updatedAssignments = [...sectionAssignments];
    const assignment = {...updatedAssignments[index]};
    
    if (field === 'sectionId') {
      assignment.sectionId = value;
    } else if (field === 'rowStart') {
      assignment.rowStart = parseInt(value);
    } else if (field === 'rowEnd') {
      assignment.rowEnd = parseInt(value);
    }
    
    updatedAssignments[index] = assignment;
    setSectionAssignments(updatedAssignments);
  };

  // Add section assignment
  const addSectionAssignment = () => {
    const lastAssignment = sectionAssignments[sectionAssignments.length - 1];
    const newRowStart = lastAssignment.rowEnd + 1;
    setSectionAssignments([
      ...sectionAssignments, 
      { rowStart: newRowStart, rowEnd: newRowStart + 2, sectionId: 'standard' }
    ]);
  };

  // Remove section assignment
  const removeSectionAssignment = (index: number) => {
    if (sectionAssignments.length <= 1) return;
    const updatedAssignments = [...sectionAssignments];
    updatedAssignments.splice(index, 1);
    setSectionAssignments(updatedAssignments);
  };

  // Update section
  const handleSectionChange = (index: number, field: 'name' | 'color' | 'basePrice', value: any) => {
    const updatedSections = [...sections];
    const section = {...updatedSections[index]};
    
    if (field === 'name') {
      section.name = value;
    } else if (field === 'color') {
      section.color = value;
    } else if (field === 'basePrice') {
      section.basePrice = parseFloat(value);
    }
    
    updatedSections[index] = section;
    setSections(updatedSections);
  };

  // Regenerate layout with current settings
  const regenerateLayout = () => {
    const { width, height } = calculateDimensions(
      venueConfig.seatsPerRow,
      venueConfig.numberOfRows,
      venueConfig.seatSpacing,
      venueConfig.rowSpacing
    );
    setVenueConfig(prev => ({ ...prev, width, height }));
    // The layout will be regenerated automatically via the useMemo
  };

  // Add scrollable container around the venue preview
  return (
    <div className="venue-designer bg-white rounded-lg shadow">
      {/* Settings Panel */}
      <div className="border-b p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <button 
          className="flex items-center justify-between w-full text-left font-medium text-gray-700"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span>Venue Configuration</span>
          {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {showSettings && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.name}
                onChange={(e) => setVenueConfig({...venueConfig, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue Type</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.type}
                onChange={(e) => setVenueConfig({...venueConfig, type: e.target.value})}
              >
                <option value="theater">Theater</option>
                <option value="banquet">Banquet</option>
                <option value="conference">Conference</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Stage Position</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.stagePosition}
                onChange={(e) => {
                  setVenueConfig({...venueConfig, stagePosition: e.target.value});
                  onStagePositionChange(e.target.value as any);
                }}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Rows</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.numberOfRows}
                min={1}
                max={50}
                onChange={(e) => setVenueConfig({...venueConfig, numberOfRows: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Seats Per Row</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.seatsPerRow}
                min={1}
                max={50}
                onChange={(e) => setVenueConfig({...venueConfig, seatsPerRow: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Row Spacing (px)</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.rowSpacing}
                min={20}
                max={100}
                onChange={(e) => setVenueConfig({...venueConfig, rowSpacing: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Seat Spacing (px)</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={venueConfig.seatSpacing}
                min={20}
                max={100}
                onChange={(e) => setVenueConfig({...venueConfig, seatSpacing: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                id="staggered" 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={venueConfig.hasStaggeredSeating}
                onChange={(e) => setVenueConfig({...venueConfig, hasStaggeredSeating: e.target.checked})}
              />
              <label htmlFor="staggered" className="block text-sm font-medium text-gray-700">
                Staggered Seating
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                id="wheelchair" 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={venueConfig.hasWheelchairSpaces}
                onChange={(e) => setVenueConfig({...venueConfig, hasWheelchairSpaces: e.target.checked})}
              />
              <label htmlFor="wheelchair" className="block text-sm font-medium text-gray-700">
                Wheelchair Spaces
              </label>
            </div>
            
            {venueConfig.hasWheelchairSpaces && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Wheelchair Spaces</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={venueConfig.wheelchairSpaces}
                  min={0}
                  onChange={(e) => setVenueConfig({...venueConfig, wheelchairSpaces: parseInt(e.target.value)})}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sections Panel */}
      <div className="border-b p-4">
        <h3 className="text-lg font-medium mb-4">Seat Sections</h3>
        
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex flex-wrap items-center space-x-2 p-2 border rounded" style={{borderLeftColor: section.color, borderLeftWidth: 4}}>
              <div>
                <label className="block text-xs text-gray-500">Name</label>
                <input 
                  type="text" 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={section.name}
                  onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500">Color</label>
                <input 
                  type="color" 
                  className="block w-16 h-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={section.color}
                  onChange={(e) => handleSectionChange(index, 'color', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500">Base Price</label>
                <input 
                  type="number" 
                  className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={section.basePrice}
                  min={0}
                  step="0.01"
                  onChange={(e) => handleSectionChange(index, 'basePrice', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Row Section Assignments */}
      <div className="border-b p-4">
        <h3 className="text-lg font-medium mb-4">Row Section Assignments</h3>
        
        <div className="space-y-4">
          {sectionAssignments.map((assignment, index) => (
            <div key={index} className="flex flex-wrap items-center space-x-2 p-2 border rounded">
              <div>
                <label className="block text-xs text-gray-500">Rows From</label>
                <input 
                  type="number" 
                  className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={assignment.rowStart}
                  min={0}
                  max={25}
                  onChange={(e) => handleSectionAssignmentChange(index, 'rowStart', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500">Rows To</label>
                <input 
                  type="number" 
                  className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={assignment.rowEnd}
                  min={assignment.rowStart}
                  max={25}
                  onChange={(e) => handleSectionAssignmentChange(index, 'rowEnd', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500">Section</label>
                <select 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={assignment.sectionId}
                  onChange={(e) => handleSectionAssignmentChange(index, 'sectionId', e.target.value)}
                >
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  className="ml-2 p-2 text-red-600 hover:text-red-800"
                  onClick={() => removeSectionAssignment(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <button 
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={addSectionAssignment}
          >
            + Add Section Assignment
          </button>
        </div>
      </div>
      
      {/* Layout Preview */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Layout Preview</h3>
        
        <div className="border p-4 rounded-lg bg-gray-50 relative overflow-auto" style={{ height: '400px' }}>
          {/* Stage */}
          {venueConfig.stagePosition === 'top' && (
            <div 
              className="bg-gray-800 text-white text-center py-2 mx-auto mb-8 rounded-lg"
              style={{ width: '80%', maxWidth: '600px' }}
            >
              Stage
            </div>
          )}
          
          {/* Seat Grid with scrolling */}
          <div className="overflow-auto max-h-[60vh] p-4">
            <div className="flex flex-col items-center space-y-2 min-w-fit">
              {/* Render all rows without limiting to 20 */}
              {Array.from({ length: venueConfig.numberOfRows }).map((_, rowIndex) => {
                const rowLabel = String.fromCharCode(65 + rowIndex);
                const assignment = sectionAssignments.find(
                  a => rowIndex >= a.rowStart && rowIndex <= a.rowEnd
                );
                const section = sections.find(s => s.id === assignment?.sectionId);
                const rowColor = section?.color || '#cccccc';
                
                return (
                  <div key={rowLabel} className="flex items-center">
                    <div className="w-8 text-right mr-3 font-medium">{rowLabel}</div>
                    <div className="flex space-x-1">
                      {Array.from({ length: venueConfig.seatsPerRow }).map((_, seatIndex) => {
                        const isWheelchair = venueConfig.hasWheelchairSpaces && 
                          rowIndex === 0 && 
                          (seatIndex === 0 || seatIndex === venueConfig.seatsPerRow - 1);
                        
                        return (
                          <div 
                            key={seatIndex}
                            className={`w-6 h-6 flex items-center justify-center text-xs rounded ${isWheelchair ? 'bg-blue-200 border-2 border-blue-500' : 'bg-white border'}`}
                            style={{ borderColor: rowColor }}
                            title={`${rowLabel}${seatIndex + 1}`}
                          >
                            {isWheelchair ? '♿' : ''}
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-8 text-left ml-3 font-medium">{rowLabel}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Stage at bottom */}
          {venueConfig.stagePosition === 'bottom' && (
            <div 
              className="bg-gray-800 text-white text-center py-2 mx-auto mt-8 rounded-lg"
              style={{ width: '80%', maxWidth: '600px' }}
            >
              Stage
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="mt-4 flex justify-between">
          <div className="text-sm text-gray-600">
            <p>Total Capacity: {venueConfig.numberOfRows * venueConfig.seatsPerRow} seats</p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={regenerateLayout}
            >
              <RotateCw size={16} className="mr-2" />
              Regenerate Layout
            </button>
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={regenerateLayout}
            >
              <Save size={16} className="mr-2" />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVenueDesigner;
