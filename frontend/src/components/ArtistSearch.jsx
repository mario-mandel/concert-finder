import { useState } from 'react';
import { searchArtists } from '../services/api';
import './ArtistSearch.css';

function ArtistSearch() {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await searchArtists(query);
      setArtists(results);
    } catch (err) {
      setError(err.message);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artist-search">
      <h1>🎵 Concert Finder</h1>
      <p className="subtitle">Search for artists to track their Denver shows</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an artist (e.g., The Lumineers)..."
          className="search-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()} className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {artists.length > 0 && (
        <div className="results">
          <h2>Found {artists.length} artist{artists.length !== 1 ? 's' : ''}</h2>
          <div className="artist-grid">
            {artists.map((artist) => (
              <div key={artist.id} className="artist-card">
                {artist.imageUrl && (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="artist-image"
                  />
                )}
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  {artist.genres.length > 0 && (
                    <div className="artist-genres">
                      {artist.genres.join(', ')}
                    </div>
                  )}
                  <div className="artist-concerts">
                    🎤 {artist.upcomingConcerts} upcoming concert{artist.upcomingConcerts !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && artists.length === 0 && query && (
        <div className="no-results">
          No artists found for "{query}". Try a different search!
        </div>
      )}
    </div>
  );
}

export default ArtistSearch;
