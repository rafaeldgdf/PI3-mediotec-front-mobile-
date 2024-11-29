// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.0.108:8080', // Substitua pelo URL do backend
  timeout: 1000,
});

export default api;
