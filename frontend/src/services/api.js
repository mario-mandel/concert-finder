/**
 * API service for Concert Finder backend
 */

const API_BASE_URL = 'https://4z11zbyuvg.execute-api.us-west-2.amazonaws.com/development';

/**
 * Search for artists by name
 * @param {string} query - Artist name to search for
 * @returns {Promise<Array>} List of matching artists
 */
export async function searchArtists(query) {
  if (!query || query.length < 2) {
    throw new Error('Please enter at least 2 characters');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/artists/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to search artists');
  }

  const data = await response.json();
  return data.data.artists;
}
