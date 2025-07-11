// Test script for QR Code Generation API
// Run this with: node qr-test.js

// Using built-in fetch (Node.js 18+)
// const fetch = require('node-fetch');

// Load environment variables (you can install dotenv if needed: npm install dotenv)
// For now, using fallback URL
const QR_API_BASE_URL = process.env.REACT_APP_QR_API_BASE_URL || 'http://localhost:5075';

async function testQRGeneration() {
    const testRequest = {
        eventID: "1",
        eventName: "Test Event",
        seatNo: "A1",
        firstName: "Test Organizer",
        paymentGUID: "test-guid-12345",
        buyerEmail: "organizer@test.com",
        organizerEmail: "organizer@test.com"
    };

    try {
        console.log('Testing QR Code Generation API...');
        console.log('Request data:', JSON.stringify(testRequest, null, 2));
        
        const response = await fetch(`${QR_API_BASE_URL}/api/etickets/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testRequest)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            return;
        }

        const result = await response.json();
        console.log('Success! API Response:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('Network Error:', error.message);
        console.log('\nMake sure the QR Code Generator API is running on port 5075');
        console.log('You can start it by running: dotnet run in the QRCodeGeneratorAPI directory');
    }
}

testQRGeneration();
