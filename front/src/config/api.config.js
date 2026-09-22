export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof window !== 'undefined' && window.VINCULO_API_URL) ||
  'http://localhost:3000';
