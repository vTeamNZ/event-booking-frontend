/**
 * Utility functions for ticket availability status display
 */

export interface AvailabilityStatus {
  colorClass: string;
  statusText: string;
  percentage: number;
}

/**
 * Calculate availability status based on available and sold tickets
 * @param available Number of available tickets
 * @param sold Number of sold tickets  
 * @param hasLimit Whether the ticket type has a limit
 * @param isTable Whether this is for tables (affects text)
 * @returns AvailabilityStatus object with color, text, and percentage
 */
export const getAvailabilityStatus = (
  available: number, 
  sold: number, 
  hasLimit: boolean, 
  isTable: boolean = false
): AvailabilityStatus => {
  // Handle unlimited availability
  if (!hasLimit || available === -1) {
    return {
      colorClass: 'text-green-400',
      statusText: 'Unlimited availability',
      percentage: 100
    };
  }

  // Handle sold out
  if (available === 0) {
    return {
      colorClass: 'text-red-400', 
      statusText: isTable ? 'No tables available' : 'No tickets available',
      percentage: 0
    };
  }

  // Calculate availability percentage
  const totalCapacity = sold + available;
  const availabilityPercentage = totalCapacity > 0 ? (available / totalCapacity) * 100 : 0;

  // Determine status based on percentage thresholds
  if (availabilityPercentage > 75) {
    return {
      colorClass: 'text-green-400',
      statusText: isTable ? 'Tables Available' : 'Available', 
      percentage: Math.round(availabilityPercentage)
    };
  } else if (availabilityPercentage > 25) {
    return {
      colorClass: 'text-orange-400',
      statusText: isTable ? 'Limited Tables Available' : 'Limited Tickets Available',
      percentage: Math.round(availabilityPercentage)
    };
  } else {
    return {
      colorClass: 'text-red-400',
      statusText: isTable ? 'Few Tables Remaining' : 'Few Tickets Remaining', 
      percentage: Math.round(availabilityPercentage)
    };
  }
};

/**
 * Get availability status with exact count (fallback for simple displays)
 * @param available Number of available tickets
 * @param hasLimit Whether the ticket type has a limit  
 * @param isTable Whether this is for tables
 * @returns AvailabilityStatus object
 */
export const getSimpleAvailabilityStatus = (
  available: number,
  hasLimit: boolean,
  isTable: boolean = false
): AvailabilityStatus => {
  if (!hasLimit || available === -1) {
    return {
      colorClass: 'text-green-400',
      statusText: 'Unlimited availability',
      percentage: 100
    };
  }

  if (available === 0) {
    return {
      colorClass: 'text-red-400',
      statusText: isTable ? 'No tables available' : 'No tickets available', 
      percentage: 0
    };
  }

  // Use simple thresholds when sold count is unknown
  let colorClass = 'text-green-400';
  let statusText = `${available} ${isTable ? 'tables' : 'tickets'} available`;

  if (available <= 5) {
    colorClass = 'text-red-400';
    statusText = isTable ? 'Few tables remaining' : 'Few tickets remaining';
  } else if (available <= 20) {
    colorClass = 'text-orange-400';
    statusText = isTable ? 'Limited tables available' : 'Limited tickets available';
  }

  return {
    colorClass,
    statusText,
    percentage: available <= 5 ? 10 : available <= 20 ? 50 : 90 // Estimated
  };
};
