const https = require('https');

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testEventsAPI() {
    try {
        console.log('=== Testing Events API ===');
        
        const response = await makeRequest('https://thelankanspace.co.nz/kw/api/Events');
        console.log('Response status:', response.status);
        
        if (response.data && Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} events:`);
            response.data.forEach((event, index) => {
                console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
                console.log(`   Active: ${event.isActive}, Status: ${event.status}, Date: ${event.date}`);
                console.log(`   Location: ${event.location}`);
                console.log('');
            });
        } else {
            console.log('No events array found or API error');
            console.log('Response:', response.data);
        }
        
    } catch (error) {
        console.error('API Error:', error.message);
    }
}

testEventsAPI();
