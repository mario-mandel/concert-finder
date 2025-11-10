/**
 * Lambda function to search for artists via Ticketmaster API
 *
 * GET /api/v1/artists/search?q={artistName}
 */

const axios = require('axios');

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

/**
 * Search for artists by name
 * @param {string} query - Artist name to search for
 * @returns {Promise<Array>} List of matching artists
 */
async function searchArtists(query) {
  if (!query || query.length < 2) {
    throw new Error('Query must be at least 2 characters');
  }

  try {
    const response = await axios.get(`${TICKETMASTER_BASE_URL}/attractions.json`, {
      params: {
        keyword: query,
        classificationName: 'music',
        apikey: TICKETMASTER_API_KEY,
        size: 10,
      },
    });

    if (!response.data._embedded || !response.data._embedded.attractions) {
      return [];
    }

    // Normalize artist data
    const artists = response.data._embedded.attractions.map(attraction => ({
      id: `tm:${attraction.id}`,
      name: attraction.name,
      imageUrl: attraction.images && attraction.images.length > 0
        ? attraction.images[0].url
        : null,
      genres: attraction.classifications
        ? attraction.classifications
            .map(c => c.genre?.name)
            .filter(g => g && g !== 'Undefined')
        : [],
      upcomingConcerts: attraction.upcomingEvents?._total || 0,
    }));

    return artists;
  } catch (error) {
    console.error('Ticketmaster API error:', error.response?.data || error.message);
    throw new Error('Failed to search artists');
  }
}

/**
 * Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Enable CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get query parameter
    const query = event.queryStringParameters?.q;

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'Query parameter "q" is required',
        }),
      };
    }

    // Validate API key is configured
    if (!TICKETMASTER_API_KEY) {
      console.error('TICKETMASTER_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'INTERNAL_ERROR',
          message: 'Service configuration error',
        }),
      };
    }

    // Search for artists
    const artists = await searchArtists(query);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: {
          artists,
        },
      }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: error.message.includes('Query must be') ? 400 : 500,
      headers,
      body: JSON.stringify({
        error: error.message.includes('Query must be') ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message: error.message,
      }),
    };
  }
};
