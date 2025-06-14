import axios from 'axios';
import config from '../config/api';

export const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '' : config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});
