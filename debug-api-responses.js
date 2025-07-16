// API Response Diagnostic Test
// Run this in browser console on https://kiwilanka.co.nz to debug the API

console.log('Testing API responses...');

// Test 1: Check if API is reachable
fetch('https://kiwilanka.co.nz/api/Events')
  .then(response => {
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', [...response.headers.entries()]);
    return response.text();
  })
  .then(text => {
    console.log('Raw API Response:', text);
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
      console.log('Is Array?', Array.isArray(json));
      console.log('Type:', typeof json);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  })
  .catch(error => {
    console.error('API Request Failed:', error);
  });

// Test 2: Check with auth for organizer endpoint
const token = localStorage.getItem('token');
if (token) {
  console.log('Testing authenticated endpoint...');
  fetch('https://kiwilanka.co.nz/api/Events/by-organizer', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Auth API Response Status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('Auth Raw API Response:', text);
    try {
      const json = JSON.parse(text);
      console.log('Auth Parsed JSON:', json);
      console.log('Auth Is Array?', Array.isArray(json));
    } catch (e) {
      console.error('Auth Failed to parse JSON:', e);
    }
  })
  .catch(error => {
    console.error('Auth API Request Failed:', error);
  });
} else {
  console.log('No token found - cannot test authenticated endpoint');
}
