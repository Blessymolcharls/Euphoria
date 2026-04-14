import fetch from 'isomorphic-unfetch';

const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/spotify/callback';
const SCOPES = 'playlist-read-private playlist-read-collaborative';

// In-memory token store (good enough for a single-user local app)
let userAccessToken = null;
let userRefreshToken = null;
let tokenExpiresAt = 0;

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const exchangeCode = async (code) => {
  const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  
  userAccessToken = data.access_token;
  userRefreshToken = data.refresh_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return data;
};

const refreshAccessToken = async () => {
  const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: userRefreshToken,
    }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to refresh Spotify token');
  userAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
};

export const getUserToken = async () => {
  if (!userAccessToken) throw new Error('NOT_LOGGED_IN');
  if (Date.now() >= tokenExpiresAt && userRefreshToken) {
    await refreshAccessToken();
  }
  return userAccessToken;
};

export const isLoggedIn = () => !!userAccessToken;
export const logout = () => {
  userAccessToken = null;
  userRefreshToken = null;
  tokenExpiresAt = 0;
};
