// Debug script to test direct URL access
const slugToSearchTerm = (slug) => {
  return slug
    .replace(/-+/g, ' ')  // Replace hyphens with spaces
    .trim();
};

console.log('=== Testing URL Slug to Search Term Conversion ===');
console.log('ladies-night => "' + slugToSearchTerm('ladies-night') + '"');
console.log('sanketha => "' + slugToSearchTerm('sanketha') + '"');
console.log('');

// Test the API endpoint
const testApiEndpoint = async (searchTerm) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://kiwilanka.co.nz/api';
    const url = `${apiUrl}/Events/by-title/${encodeURIComponent(searchTerm)}`;
    
    console.log(`Testing API: ${url}`);
    
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Event found: ${data.title} (ID: ${data.id})`);
      console.log(`Status: ${data.status}, IsActive: ${data.isActive}`);
    } else {
      console.log(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`Network Error: ${error.message}`);
  }
  console.log('---');
};

(async () => {
  console.log('=== Testing API Endpoints ===');
  await testApiEndpoint('ladies night');
  await testApiEndpoint('sanketha');
})();
