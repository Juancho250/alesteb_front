import axios from 'axios';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configuración opcional de NProgress
nprogress.configure({ 
  showSpinner: false, 
  speed: 500, 
  minimum: 0.2 
});

const api = axios.create({
  baseURL: 'https://alesteb-back.onrender.com/api'
});

// --- INTERCEPTOR DE PETICIÓN (SALIDA) ---
api.interceptors.request.use((config) => {
  // 1. Iniciar animación de carga
  nprogress.start();

  // 2. Inyectar Token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  nprogress.done();
  return Promise.reject(error);
});

// --- INTERCEPTOR DE RESPUESTA (ENTRADA) ---
api.interceptors.response.use(
  (response) => {
    // Finalizar animación al recibir respuesta exitosa
    nprogress.done();
    return response;
  },
  (error) => {
    // Finalizar animación incluso si hay error (401, 404, 500, etc.)
    nprogress.done();
    return Promise.reject(error);
  }
);

export default api;