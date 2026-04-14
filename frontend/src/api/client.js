import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // Large playlist parsing can take several minutes.
  // Keep this unlimited so the UI waits for completion.
  timeout: 0,
});

export default api;
