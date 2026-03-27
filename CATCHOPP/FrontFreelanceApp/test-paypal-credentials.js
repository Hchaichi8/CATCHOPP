/**
 * Test PayPal Credentials
 * Run this with: node test-paypal-credentials.js
 * 
 * This will verify your PayPal credentials are valid
 */

const https = require('https');

const CLIENT_ID = 'AauXbiepXCvfC78g_iwbKstLlbaHNuIDe9AyEco0MhVr2r3kqIkAbHa0labeXgyjQOPUxhF8ir3FkLee';
const SECRET = 'EC299mqLxGgoEu09IuryH0DbU4iujeHx6NiQJpOZkFATEpnIqVzwaHry43QuTvlMVZn-0muRdm8n7BUEi';

console.log('🔍 Testing PayPal Credentials...\n');
console.log('Client ID:', CLIENT_ID.substring(0, 20) + '...');
console.log('Secret:', SECRET.substring(0, 20) + '...\n');

// Get access token
const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');

const options = {
    hostname: 'api-m.sandbox.paypal.com',
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (response.access_token) {
                console.log('✅ SUCCESS! Your credentials are valid.\n');
                console.log('Access Token:', response.access_token.substring(0, 30) + '...');
                console.log('Token Type:', response.token_type);
                console.log('Expires In:', response.expires_in, 'seconds');
                console.log('App ID:', response.app_id);
                console.log('\n🎉 You can now use PayPal in your Angular app!');
                console.log('\n📝 Next Steps:');
                console.log('1. Open paypal-test.html in your browser to test the button');
                console.log('2. Or run: npm start (to test in your Angular app)');
            } else if (response.error) {
                console.log('❌ ERROR! Credentials are invalid.\n');
                console.log('Error:', response.error);
                console.log('Description:', response.error_description);
                console.log('\n💡 Solution:');
                console.log('1. Go to https://developer.paypal.com/dashboard/');
                console.log('2. Check your app credentials');
                console.log('3. Make sure you\'re using SANDBOX credentials');
            }
        } catch (e) {
            console.log('❌ ERROR! Could not parse response.\n');
            console.log('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.log('❌ ERROR! Could not connect to PayPal.\n');
    console.log('Error:', e.message);
    console.log('\n💡 Check your internet connection and try again.');
});

req.write('grant_type=client_credentials');
req.end();
