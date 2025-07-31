const https = require('https');

// Test different API endpoints to see what's working
const endpoints = [
    'https://thelankanspace.co.nz/kw/api/Health',
    'https://thelankanspace.co.nz/kw/api/Events',
    'https://thelankanspace.co.nz/api/Events',  // Try without kw subdirectory
    'https://thelankanspace.co.nz/kw/api/',    // Try base API
];

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'NodeTest/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ 
                    url, 
                    status: res.statusCode, 
                    headers: Object.fromEntries(Object.entries(res.headers)), 
                    data: data.substring(0, 500) // First 500 chars
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({ url, error: err.message });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({ url, error: 'Timeout' });
        });
    });
}

async function testAllEndpoints() {
    console.log('=== Testing API Endpoints ===\n');
    
    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint}`);
        const result = await makeRequest(endpoint);
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}\n`);
        } else {
            console.log(`✅ Status: ${result.status}`);
            console.log(`Content-Type: ${result.headers['content-type'] || 'Not set'}`);
            
            // Check if it's JSON or HTML
            if (result.data.startsWith('<!DOCTYPE') || result.data.startsWith('<html')) {
                console.log(`🌐 Response: HTML page (redirected)\n`);
            } else if (result.data.startsWith('[') || result.data.startsWith('{')) {
                console.log(`📋 Response: JSON data`);
                console.log(`First 200 chars: ${result.data.substring(0, 200)}...\n`);
            } else {
                console.log(`📝 Response: ${result.data.substring(0, 100)}...\n`);
            }
        }
    }
}

testAllEndpoints();
