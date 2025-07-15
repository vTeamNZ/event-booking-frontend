// Types for venue designer components

export interface LayoutElement {
  id: string;
  type: 'seat' | 'table' | 'stage' | 'aisle' | 'wall' | 'pillar' | 'balcony' | 'bar' | 'entrance' | 'emergency_exit';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  sectionId: string;
  level: number;
  properties: {
    seatNumber?: string;
    rowLetter?: string;
    isAccessible?: boolean;
    isVip?: boolean;
    isBlocked?: boolean;
    tableNumber?: number;
    capacity?: number;
    shape?: 'round' | 'square' | 'rectangle' | 'oval';
    isReserved?: boolean;
    minimumGuests?: number;
    color?: string;
    label?: string;
    icon?: string;
    basePrice?: number;
    priceMultiplier?: number;
    isBookable?: boolean;
    description?: string;
    notes?: string;
    customData?: Record<string, any>;
  };
}

export interface Section {
  id: string;
  name: string;
  color: string;
  level: number;
  basePrice: number;
  capacity: number;
  elements: LayoutElement[];
  isActive?: boolean;
  priceMultiplier?: number;
  viewQuality?: string;
  accessibilityFeatures?: string[];
}

export interface VenueSettings {
  name: string;
  type: 'theater' | 'banquet' | 'conference' | 'mixed';
  maxCapacity: number;
  dimensions: {
    width: number;
    height: number;
  };
  defaultSectionColor: string;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  allowMultipleSelections: boolean;
  enforceCapacityLimits: boolean;
  allowMixedSeating?: boolean;
  enableRealTimeReservation?: boolean;
  requireSeatSelection?: boolean;
  allowGroupBooking?: boolean;
  maxGroupSize?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  cancellationPolicy?: string;
  specialRequirements?: string[];
}

export interface Level {
  id: string;
  name: string;
  level: number;
  elements: LayoutElement[];
}

export interface VenueLayoutData {
  sections: Section[];
  elements: LayoutElement[];
  settings: VenueSettings;
  levels?: Level[];
}

export interface VenueTemplate {
  id: string;
  name: string;
  type: 'theater' | 'banquet' | 'conference' | 'mixed';
  layout: VenueLayoutData;
  thumbnail?: string;
}

export interface VenueDesignerProps {
  selectionMode: string;
  onLayoutChange: (layout: VenueLayoutData) => void;
  onStagePositionChange: (position: 'top' | 'bottom' | 'left' | 'right') => void;
  initialLayout: VenueLayoutData | null;
  maxCapacity: number;
  venue?: any;
}
