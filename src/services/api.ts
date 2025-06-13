import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5290',
    headers: {
        'Content-Type': 'application/json'
    }
});
