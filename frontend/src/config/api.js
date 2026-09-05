// Base API URL configuration
// In local dev without env, fallback to relative path or localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default API_BASE_URL;
