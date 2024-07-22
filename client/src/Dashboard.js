import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile data
        const userResponse = await axios.get('http://localhost:3001/api/user', { withCredentials: true });
        setUser(userResponse.data);

        // Fetch recently played tracks
        const recentlyPlayedResponse = await axios.get('http://localhost:3001/api/recently-played', { withCredentials: true });
        setRecentlyPlayed(recentlyPlayedResponse.data);

        // Fetch top artists and tracks
        const topArtistsResponse = await axios.get('http://localhost:3001/api/top-artists', { withCredentials: true });
        setTopArtists(topArtistsResponse.data);

        const topTracksResponse = await axios.get('http://localhost:3001/api/top-tracks', { withCredentials: true });
        setTopTracks(topTracksResponse.data);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="dashboard-container">
        <div className="profile-header">
            <img src={user._json.images[1]?.url || 'default-profile.png'} alt="Profile" className="profile-image" />
            <h1 className="username">{user.displayName}</h1>
        </div>
      {user ? (
        <div className="dashboard">
          <div className="dashboard-content">
          <div className="sidebar-section">
            <h2>Last 5 Played Songs</h2>
            <ul>
              {recentlyPlayed.slice(0, 5).map((track, index) => (
                <li key={index}>
                  {track.track.name} by {track.track.artists.map(artist => artist.name).join(', ')}
                </li>
              ))}
            </ul>
          </div>
          </div>
          <div className="profile-sidebar">
          <div className="sidebar-section">
            <h3>Top Artists</h3>
            <ul>
              {topArtists.slice(0, 5).map((artist, index) => (
                <li key={index}>
                  {artist.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-section">
            <h3>Top Tracks</h3>
            <ul>
            {topTracks.slice(0, 5).map((track, index) => (
            <li key={index}>
              {track.name} by {track.artists.map(artist => artist.name).join(', ')}
            </li>
          ))}
            </ul>
          </div>
        </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
