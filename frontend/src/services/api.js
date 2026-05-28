import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5258/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor do dodawania tokenu JWT do każdego żądania
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor do obsługi błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Wyloguj użytkownika, jeśli token wygasł lub jest nieprawidłowy
      localStorage.removeItem('token');
      // Przekieruj do logowania tylko jeśli nie jesteśmy już na stronie logowania
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
