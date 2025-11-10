/**
 * Simple test script for artist search function
 */

// Set environment variable
process.env.TICKETMASTER_API_KEY = 'jZ2MWFwTCfb5IT6vhIPb1HWG14IRu1Hn';

// Load the handler
const { handler } = require('./search');

// Create test event
const event = {
  httpMethod: 'GET',
  path: '/api/v1/artists/search',
  queryStringParameters: {
    q: 'lumineers'
  },
  headers: {
    'Content-Type': 'application/json'
  },
  body: null,
  isBase64Encoded: false
};

// Test the function
(async () => {
  console.log('Testing artist search with query: "lumineers"\n');

  try {
    const result = await handler(event);
    console.log('Status Code:', result.statusCode);
    console.log('\nResponse:');
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();
