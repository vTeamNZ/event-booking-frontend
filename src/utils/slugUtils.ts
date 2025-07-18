/**
 * Utility functions for creating and handling URL-friendly slugs
 */

/**
 * Creates a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns URL-friendly slug
 */
export const createEventSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-')   // Replace multiple - with single -
    .replace(/^-+|-+$/g, '')  // Trim - from start and end
    .trim();
};

/**
 * Creates a slug for organizer names
 * @param name - The organizer name to convert to a slug
 * @returns URL-friendly slug
 */
export const createOrganizerSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-')   // Replace multiple - with single -
    .replace(/^-+|-+$/g, '')  // Trim - from start and end
    .trim();
};

/**
 * Converts a slug back to a searchable format for API calls
 * @param slug - The URL slug to convert
 * @returns A more flexible search term
 */
export const slugToSearchTerm = (slug: string): string => {
  return slug
    .replace(/-+/g, ' ')  // Replace hyphens with spaces
    .trim();
};

/**
 * Centralized event navigation utility
 * Handles navigation to events using the new direct URL format
 * @param title - Event title
 * @param navigate - React Router navigate function
 * @param state - Optional state to pass with navigation
 */
export const navigateToEvent = (
  title: string, 
  navigate: (path: string, options?: any) => void,
  state?: any
) => {
  const slug = createEventSlug(title);
  navigate(`/${slug}`, state ? { state } : undefined);
};
