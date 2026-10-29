import axios from 'axios';

// Determine the API base URL dynamically.
// On mobile devices or LAN access (e.g. 10.246.128.80), always route via relative '/api'
// so requests proxy through the host computer rather than attempting to connect to localhost on the phone.
const getBaseURL = () => {
  const envApi = import.meta.env.VITE_API;
  if (!envApi || envApi === '/api') return '/api';
  if (typeof window !== 'undefined' && window.location) {
    const isRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isRemote && (envApi.includes('localhost') || envApi.includes('127.0.0.1'))) {
      return '/api';
    }
  }
  return envApi;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Inject Authorization header from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('redflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage
      localStorage.removeItem('redflow_token');
      localStorage.removeItem('redflow_user');
    }
    return Promise.reject(error);
  }
);

export default api;
