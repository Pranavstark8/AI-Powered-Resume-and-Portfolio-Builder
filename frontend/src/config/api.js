// API Configuration
// Uses environment variable or falls back to localhost for development
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Remove trailing slash to prevent double slashes in URLs
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export default API_URL;

