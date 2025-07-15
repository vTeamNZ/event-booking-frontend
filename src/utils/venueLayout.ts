import { Venue, SeatConfig } from '../types/venue';

export function generateSeatLayout(venue: Venue): SeatConfig[] {
    const seats: SeatConfig[] = [];
    const {
        numberOfRows,
        seatsPerRow,
        rowSpacing,
        seatSpacing,
        hasStaggeredSeating,
        wheelchairSpaces,
        hasHorizontalAisles,
        horizontalAisleRows,
        hasVerticalAisles,
        verticalAisleSeats,
        aisleWidth
    } = venue;

    // Calculate dimensions based on seats
    const margin = 50; // Margin from the edges
    const totalSeatWidth = seatsPerRow * seatSpacing;
    const totalRowHeight = numberOfRows * rowSpacing;

    // Calculate center offsets
    const startX = margin;
    let startY = margin;

    // Calculate vertical aisles space
    let totalVerticalAislesWidth = 0;
    if (hasVerticalAisles && verticalAisleSeats.length > 0) {
        totalVerticalAislesWidth = verticalAisleSeats.length * seatSpacing * (aisleWidth - 1);
    }

    // Calculate horizontal aisles space
    if (hasHorizontalAisles && horizontalAisleRows.length > 0) {
        const totalAisleSpace = horizontalAisleRows.length * rowSpacing * (aisleWidth - 1);
        startY += totalAisleSpace / 2;
    }

    // Track wheelchair seats to be added
    let wheelchairSeatsAdded = 0;
    const wheelchairSeatsPerRow = Math.ceil(wheelchairSpaces / numberOfRows);

    // Keep track of the current Y position
    let currentY = startY;

    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        // Calculate row offset for staggered seating
        const rowOffset = hasStaggeredSeating && rowIndex % 2 === 1 ? seatSpacing / 2 : 0;

        // Keep track of the current X position
        let currentX = startX + rowOffset;

        for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
            // Check if we need to skip this position due to a vertical aisle
            if (hasVerticalAisles && verticalAisleSeats.includes(seatIndex)) {
                currentX += seatSpacing * aisleWidth;
                continue;
            }

            // Determine if this seat should be a wheelchair space
            const isWheelchair = wheelchairSeatsAdded < wheelchairSpaces &&
                               seatIndex < wheelchairSeatsPerRow &&
                               rowIndex === Math.floor(wheelchairSeatsAdded / wheelchairSeatsPerRow);

            if (isWheelchair) {
                wheelchairSeatsAdded++;
            }

            seats.push({
                row: rowIndex,
                number: seatIndex + 1,
                x: currentX,
                y: currentY,
                isWheelchair,
            });

            // Move to the next seat position
            currentX += seatSpacing;
        }

        // Move to the next row position
        currentY += rowSpacing;

        // Add extra space for horizontal aisle if needed
        if (hasHorizontalAisles && horizontalAisleRows.includes(rowIndex)) {
            currentY += rowSpacing * (aisleWidth - 1);
        }
    }

    return seats;
}

export function generateSectionLayout(venue: Venue) {
    // This is a placeholder for generating section layouts
    // Sections can be added based on the venue configuration
    return [
        {
            id: 1,
            name: 'Standard',
            color: '#4A5568',
            basePrice: 0,
        }
    ];
}
