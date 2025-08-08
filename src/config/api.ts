// API configuration for different environments
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  
  // Production fallback - Railway URL
  return 'https://footbooking.up.railway.app';
};

export const API_URL = getApiUrl(); 