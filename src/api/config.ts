// API configuration
export const API_BASE_URL = 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  statements: '/statements',
  statement: '/statement',
  validator: '/validator',
  checker: '/checker',
  interactor: '/interactor',
  // Add more endpoints as needed
} as const;

// Request configuration
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};
