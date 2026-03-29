import { create } from 'zustand';
import axiosInstance from '../utils/axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('token', res.data.token);
            set({ user: res.data, token: res.data.token, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post('/auth/register', userData);
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('token', res.data.token);
            set({ user: res.data, token: res.data.token, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
