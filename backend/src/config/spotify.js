import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

let cachedToken = null;
let tokenExpiry = 0;

export const getSpotifyToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000; // refresh 1 min early
  return cachedToken;
};
