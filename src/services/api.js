// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://scanqr-jdez.onrender.com/api/register', // Your backend API base URL
});

export default api;
