import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { deleteCookie } from 'cookies-next';

interface User {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  avatarUrl?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        setAuth: (user, accessToken, refreshToken) => 
          set({ user, isAuthenticated: true, accessToken, refreshToken }),
        setAccessToken: (accessToken) => set({ accessToken }),
        logout: () => {
          deleteCookie('auth-token', { path: '/' });
          set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
        },
      }),
      {
        name: 'auth-storage', // Tên key trong localStorage
      }
    )
  )
);
