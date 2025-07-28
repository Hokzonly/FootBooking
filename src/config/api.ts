// API configuration for different environments
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  
  // Production fallback - you'll need to update this with your Railway URL
  return 'http://localhost:4000'; // Changed from Railway URL to localhost for now
};

export const API_URL = getApiUrl(); 