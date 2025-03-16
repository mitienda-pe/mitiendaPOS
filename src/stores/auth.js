import { defineStore } from 'pinia';
import api from '../api/axios';
import router from '../router';
import { mockApi } from '../api/mockApi';

// Use mock API in development
const apiService = import.meta.env.DEV ? mockApi : api;

// Helper function to parse stored user data
const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser(),
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null,
  },
  
  actions: {
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.login(username, password);
        this.token = response.data.token;
        this.user = response.data.user;
        
        // Persist session data
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        // Redirigir a todos los usuarios al menú principal
        router.push('/menu');
        
        /* Comentamos la redirección basada en roles para usar el menú principal para todos
        // Redirect based on user role
        switch (this.user.role) {
          case 'cajero':
            router.push('/pos');
            break;
          case 'supervisor':
            router.push('/dashboard');
            break;
          case 'administrador':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
        */
      } catch (error) {
        this.error = error.response?.data?.message || 'Error de autenticación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserProfile() {
      if (!this.token) return;
      
      try {
        if (import.meta.env.DEV) {
          // En desarrollo, verificamos si tenemos datos almacenados
          const storedUser = getStoredUser();
          if (storedUser) {
            this.user = storedUser;
            return;
          }
        }

        const response = await apiService.getProfile();
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.logout();
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastLoginTime');
      router.push('/login');
    },

    // Verificar y restaurar sesión
    async checkSession() {
      const token = localStorage.getItem('token');
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      
      if (!token || !lastLoginTime) {
        this.logout();
        return false;
      }

      // Verificar si la sesión ha expirado (24 horas)
      const lastLogin = new Date(lastLoginTime);
      const now = new Date();
      const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        this.logout();
        return false;
      }

      // Restaurar sesión
      this.token = token;
      await this.fetchUserProfile();
      return true;
    }
  },
});
