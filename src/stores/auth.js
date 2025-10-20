import { defineStore } from 'pinia';
import router from '../router';
import { authApi } from '../services/authApi';

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
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    selectedStore: JSON.parse(localStorage.getItem('selected_store') || 'null'),
    stores: [],
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    userRole: (state) => state.user?.role || null,
    hasSelectedStore: (state) => !!state.selectedStore,
    hasMultipleStores: (state) => state.stores.length > 1,
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.login({ email, password });

        if (response.success) {
          const { access_token, refresh_token, user } = response.data;

          this.accessToken = access_token;
          this.refreshToken = refresh_token;

          // TEMPORAL: Forzar rol de administrador para todos los usuarios en el POS
          // Los roles del API/backoffice aún no están sincronizados con el POS
          this.user = {
            ...user,
            role: 'administrador'
          };

          // Persist session data
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(this.user));

          // Obtener las tiendas del usuario
          await this.fetchStores();

          // Seleccionar tienda por defecto (configurable por .env)
          const defaultStoreId = import.meta.env.VITE_DEFAULT_STORE_ID
            ? parseInt(import.meta.env.VITE_DEFAULT_STORE_ID)
            : null;

          if (defaultStoreId) {
            // Si hay una tienda por defecto configurada, intentar seleccionarla
            const targetStore = this.stores.find(s => s.id === defaultStoreId);
            if (targetStore) {
              await this.selectStore(targetStore.id);
            } else {
              console.warn(`Store ${defaultStoreId} not found in user's stores`);
            }
          } else if (this.stores.length === 1) {
            // Si solo tiene una tienda, seleccionarla automáticamente
            await this.selectStore(this.stores[0].id);
          }

          // Redirigir al menú principal
          router.push('/menu');
        } else {
          this.error = response.message || 'Error de autenticación';
          throw new Error(this.error);
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error de autenticación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStores() {
      try {
        const response = await authApi.getStores();
        if (response.success) {
          this.stores = response.data;
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    },

    async selectStore(storeId) {
      try {
        const response = await authApi.selectStore(storeId);
        if (response.success) {
          const { access_token } = response.data;

          // Actualizar el token con permisos de tienda
          this.accessToken = access_token;
          localStorage.setItem('access_token', access_token);

          // Guardar la tienda seleccionada
          const store = this.stores.find(s => s.id === storeId);
          this.selectedStore = store;
          localStorage.setItem('selected_store', JSON.stringify(store));
        }
      } catch (error) {
        console.error('Error selecting store:', error);
        throw error;
      }
    },

    async fetchUserProfile() {
      if (!this.accessToken) return;

      try {
        const response = await authApi.getProfile();
        if (response.success) {
          // TEMPORAL: Forzar rol de administrador
          this.user = {
            ...response.data,
            role: 'administrador'
          };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.logout();
        throw error;
      }
    },

    async logout() {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.selectedStore = null;
        this.stores = [];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('selected_store');
        router.push('/login');
      }
    },

    // Verificar y restaurar sesión
    async checkSession() {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken || !refreshToken) {
        this.logout();
        return false;
      }

      // Restaurar sesión
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      try {
        await this.fetchUserProfile();
        await this.fetchStores();
        return true;
      } catch (error) {
        console.error('Error checking session:', error);
        this.logout();
        return false;
      }
    }
  },
});
