import { getAuthUrl, exchangeCode, logout, isLoggedIn } from '../services/spotifyAuth.service.js';

export const spotifyLogin = (req, res) => {
  res.redirect(getAuthUrl());
};

export const spotifyCallback = async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.redirect(`http://localhost:5173/?spotifyError=${encodeURIComponent(error)}`);
  }
  try {
    await exchangeCode(code);
    res.redirect('http://localhost:5173/?spotifyConnected=1');
  } catch (err) {
    res.redirect(`http://localhost:5173/?spotifyError=${encodeURIComponent(err.message)}`);
  }
};

export const spotifyStatus = (req, res) => {
  res.json({ connected: isLoggedIn() });
};

export const spotifyLogout = (req, res) => {
  logout();
  res.json({ message: 'Logged out' });
};
