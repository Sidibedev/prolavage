import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  register: (name: string, phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  checkAuth: () => {
    const isAuth = api.isAuthenticated();
    const user = api.getCurrentUser();
    set({
      isAuthenticated: isAuth,
      user: user,
      loading: false,
    });
  },

  login: async (phone: string, pin: string) => {
    try {
      const user = await api.login(phone, pin);
      set({ isAuthenticated: true, user });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (name: string, phone: string, pin: string) => {
    const rec = await api.register(name, phone, pin);
    set({ isAuthenticated: true, user: rec as any });
  },

  logout: async () => {
    await api.logout();
    set({ isAuthenticated: false, user: null });
  },
}));
