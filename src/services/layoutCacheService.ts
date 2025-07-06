import { SeatLayoutResponse } from '../types/seatSelection';

// Cache key format: layout-{eventId}
const CACHE_PREFIX = 'layout-';
const CACHE_EXPIRY_DAYS = 7; // How long to keep layouts in cache

interface CachedLayout {
  timestamp: number;
  layout: SeatLayoutResponse;
}

/**
 * Service for caching and retrieving event hall layouts
 */
export const layoutCacheService = {
  /**
   * Store a layout in the cache
   */
  saveLayout(eventId: number, layout: SeatLayoutResponse): void {
    try {
      const cacheKey = `${CACHE_PREFIX}${eventId}`;
      const cacheData: CachedLayout = {
        timestamp: Date.now(),
        layout
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Layout for event ${eventId} saved to cache`);
    } catch (error) {
      console.error('Failed to cache layout:', error);
    }
  },

  /**
   * Get a layout from the cache if it exists and is not expired
   */
  getLayout(eventId: number): SeatLayoutResponse | null {
    try {
      const cacheKey = `${CACHE_PREFIX}${eventId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        console.log(`No cached layout found for event ${eventId}`);
        return null;
      }

      const cacheEntry: CachedLayout = JSON.parse(cachedData);
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // days to ms
      
      // Check if cache is expired
      if (Date.now() - cacheEntry.timestamp > expiryTime) {
        console.log(`Cached layout for event ${eventId} is expired`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`Retrieved layout for event ${eventId} from cache`);
      return cacheEntry.layout;
    } catch (error) {
      console.error('Error retrieving cached layout:', error);
      return null;
    }
  },

  /**
   * Clear a specific layout from cache
   */
  clearLayout(eventId: number): void {
    const cacheKey = `${CACHE_PREFIX}${eventId}`;
    localStorage.removeItem(cacheKey);
    console.log(`Layout cache cleared for event ${eventId}`);
  },

  /**
   * Clear all cached layouts
   */
  clearAllLayouts(): void {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} cached layouts`);
  }
};
