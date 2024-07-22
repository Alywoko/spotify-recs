const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Configuration des sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Mettez à true si vous utilisez HTTPS
    httpOnly: true,
    sameSite: 'lax', // Nécessaire pour les cookies cross-origin
  },
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
}, (accessToken, refreshToken, expires_in, profile, done) => {
  return done(null, { profile, accessToken, refreshToken });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/spotify', passport.authenticate('spotify', {
  scope: ['user-read-recently-played', 'user-top-read']
}));

app.get('/auth/spotify/callback', passport.authenticate('spotify', {
  failureRedirect: '/'
}), (req, res) => {
  // Rediriger vers une page protégée où les cookies seront utilisés
  res.redirect('http://localhost:3000/dashboard');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('http://localhost:3000');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/spotify');
}

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`Hello ${req.user.profile.displayName}`);
});

app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json(req.user.profile);
});

app.get('/api/recently-played', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Recently played data:', response.data.items);
    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
});

// Route pour récupérer les top artistes
app.get('/api/top-artists', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Route pour récupérer les top tracks
app.get('/api/top-tracks', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
