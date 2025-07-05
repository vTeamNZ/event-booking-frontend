import axios from 'axios';
import config from '../config/api';

export const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});
