/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
theme: {
  extend: {
    colors: {
      // Dark Cinema Theme Colors
      background: '#111827',      // Dark background (gray-900)
      primary: '#EAB308',         // Yellow primary (yellow-500) - for main actions, prices
      'primary-dark': '#CA8A04',  // Yellow-600 for hover states
      secondary: '#6B7280',       // Gray-500 for secondary elements
      card: '#1F2937',           // Gray-800 for cards and containers
      'card-light': '#374151',    // Gray-700 for lighter cards/hover states
      textPrimary: '#F9FAFB',     // White text for main content
      textSecondary: '#D1D5DB',   // Gray-300 for secondary text
      textMuted: '#9CA3AF',       // Gray-400 for muted text
      accent: '#10B981',          // Green for success states
      warning: '#F59E0B',         // Amber for warnings
      error: '#EF4444',           // Red for errors
      gray: {
        750: '#374151',           // Between gray-700 and gray-800
      }
    },
  },
}
,
  plugins: [],
}
