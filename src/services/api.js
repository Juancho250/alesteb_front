// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://alesteb-back.onrender.com/api'
});

// ESTO ES VITAL: Agrega el token a CADA petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // O como guardes tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;