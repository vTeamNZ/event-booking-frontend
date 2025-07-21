const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const config = {
  apiBaseUrl: apiBaseUrl
};

export default config;
