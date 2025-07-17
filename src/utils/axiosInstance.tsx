// src/utils/axiosInstance.tsx
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Change this to your actual backend URL when integrating
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
