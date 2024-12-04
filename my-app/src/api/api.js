// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.0.103:8080', // Substitua pelo IP correto do seu backend
  timeout: 1000, // Tempo limite para a requisição (em milissegundos)
});

export default api;
