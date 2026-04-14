import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            set({ user: { ...session.user, ...profile }, token: session.access_token });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                set({ user: { ...session.user, ...profile }, token: session.access_token });
            } else {
                set({ user: null, token: null });
            }
        });
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            set({ user: { ...data.user, ...profile }, token: data.session.access_token, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role
                    }
                }
            });
            if (error) throw error;

            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            const errMsg = error.message || 'Registration failed';
            set({
                error: errMsg,
                isLoading: false
            });
            return { success: false, message: errMsg };
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null });
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
