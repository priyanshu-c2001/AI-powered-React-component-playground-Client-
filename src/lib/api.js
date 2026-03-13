import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ai-powered-react-component-playground.onrender.com',
    withCredentials: true, 
});

export default api;