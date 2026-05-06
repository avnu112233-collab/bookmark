import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    checkAuth: () => api.get('/auth/check'),
};

// Students API
export const studentsAPI = {
    getAll: () => api.get('/students'),
    getByFingerId: (fingerId) => api.get(`/students/${fingerId}`),
    create: (student) => api.post('/students', student),
    update: (id, student) => api.put(`/students/${id}`, student),
    delete: (id) => api.delete(`/students/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getToday: () => api.get('/attendance/today'),
    getLogs: (params) => api.get('/attendance/logs', { params }),
    getStats: () => api.get('/attendance/stats'),
    recordAttendance: (data) => api.post('/attendance', data),
};

// Books API
export const booksAPI = {
    getAll: () => api.get('/books'),
    create: (book) => api.post('/books', book),
    update: (id, book) => api.put(`/books/${id}`, book),
    delete: (id) => api.delete(`/books/${id}`),
};

// Fingerprint API
export const fingerprintAPI = {
    getPending: () => api.get('/fingerprint/pending'),
    getStatus: () => api.get('/fingerprint/status'),
};

// System API
export const systemAPI = {
    getInfo: () => api.get('/system/info'),
    getHealth: () => api.get('/health'),
};

export default api;
