// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.0.108:8080', // Substitua pelo URL do backend
  timeout: 1000,
});

// Adiciona um interceptor para incluir o token JWT nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwtToken');  // Recupera o token JWT
    console.log('Token JWT:', token);  // Verifique o token no console
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;  // Adiciona o token no cabeçalho
    }
    return config;  // Retorna a configuração da requisição com o token
  },
  (error) => {
    return Promise.reject(error);  // Retorna o erro se houver
  }
);


export default api;
