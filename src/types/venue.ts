export interface Venue {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    layoutType: string;
    layoutData: string;
    width: number;
    height: number;
    numberOfRows: number;
    seatsPerRow: number;
    rowSpacing: number;
    seatSpacing: number;
    hasStaggeredSeating: boolean;
    hasWheelchairSpaces: boolean;
    wheelchairSpaces: number;
    hasHorizontalAisles: boolean;
    horizontalAisleRows: number[];
    hasVerticalAisles: boolean;
    verticalAisleSeats: number[];
    aisleWidth: number;
    capacity: number;
}

export interface VenueFormData {
    name: string;
    description: string;
    address: string;
    city: string;
    layoutType: string;
    width: number;
    height: number;
    capacity: number;
    numberOfRows: number;
    seatsPerRow: number;
    rowSpacing: number;
    seatSpacing: number;
    hasStaggeredSeating: boolean;
    hasWheelchairSpaces: boolean;
    wheelchairSpaces: number;
    hasHorizontalAisles: boolean;
    horizontalAisleRows: number[];
    hasVerticalAisles: boolean;
    verticalAisleSeats: number[];
    aisleWidth: number;
}

export const LAYOUT_TYPES = [
    'Allocated Seating', // For venues with assigned seats
    'General Admission'  // For venues without seat allocation
] as const;

export type LayoutType = typeof LAYOUT_TYPES[number];

export interface SeatConfig {
    row: number;
    number: number;
    x: number;
    y: number;
    isWheelchair?: boolean;
    sectionId?: number;
    isAisle?: boolean;
}

export interface VenueLayout {
    venue: Venue;
    seats: SeatConfig[];
    sections: {
        id: number;
        name: string;
        color: string;
        basePrice: number;
    }[];
}
