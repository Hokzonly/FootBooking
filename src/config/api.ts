// API configuration for different environments
function normalizeApiUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = String(raw).trim();

  // If it's already absolute, return as-is
  if (/^https?:\/\//i.test(value)) return value;

  // Handle values like ":4000" or "4000"
  if (/^:?\d{2,5}$/.test(value)) {
    const port = value.startsWith(':') ? value : `:${value}`;
    const protocol = window?.location?.protocol || 'http:';
    const hostname = window?.location?.hostname || 'localhost';
    return `${protocol}//${hostname}${port}`;
  }

  // Handle relative paths like "/api" – make them absolute to current origin
  if (value.startsWith('/')) {
    const origin = window?.location?.origin || 'http://localhost:5173';
    return `${origin}${value}`.replace(/\/$/, '');
  }

  // As a last resort, assume it's a hostname without protocol
  return `https://${value}`;
}

const getApiUrl = () => {
  const fromEnv = normalizeApiUrl(import.meta.env.VITE_API_URL as any);
  if (fromEnv) return fromEnv;

  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  // Production fallback - Railway URL
  return 'https://footbooking.up.railway.app';
};

export const API_URL = getApiUrl();