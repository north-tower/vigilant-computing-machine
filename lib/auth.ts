import { create } from 'zustand' 
import { persist } from 'zustand/middleware' 
import { AuthUser } from '@/types' 
import api from './api' 

interface AuthStore { 
  user: AuthUser | null 
  token: string | null 
  isBooting: boolean 
  login: (email: string, password: string) => Promise<void> 
  register: (data: any) => Promise<void> 
  logout: () => void 
  setBooting: (v: boolean) => void 
} 

export const useAuthStore = create<AuthStore>()( 
  persist( 
    (set) => ({ 
      user: null, 
      token: null, 
      isBooting: false, 

      login: async (email, password) => { 
        const { data } = await api.post('/auth/login', { email, password }) 
        set({ user: data.user, token: data.access_token, isBooting: true }) 
      }, 

      register: async (registerData) => { 
        const { data } = await api.post('/auth/register', registerData) 
        set({ user: data.user, token: data.access_token, isBooting: true }) 
      }, 

      logout: () => { 
        set({ user: null, token: null, isBooting: false }) 
      }, 

      setBooting: (v) => set({ isBooting: v }), 
    }), 
    { 
      name: 'sychar-auth', 
      partialize: (state) => ({ user: state.user, token: state.token }), 
    } 
  ) 
)
