import apiClient from './axios';

export const authApi = {
  // Login con email y password
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Renovar token
  async refresh(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  // Cerrar sesión
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Test de conectividad
  async test() {
    const response = await apiClient.get('/auth/test');
    return response.data;
  },

  // Obtener perfil del usuario
  async getProfile() {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Obtener tiendas del usuario
  async getStores() {
    const response = await apiClient.get('/user/stores');

    // La API devuelve { error: 0, data: { stores: [...] } }
    // Necesitamos mapear el formato
    if (response.data.success && response.data.data?.stores) {
      const stores = response.data.data.stores.map((store) => ({
        id: parseInt(store.tienda_id),
        name: store.tienda_nombre_display || store.tienda_nombre_comercial,
        slug: store.tienda_nombreurl,
        logo: null,
        url: store.tienda_url,
        plan: store.plan_titulo,
        status: store.tienda_plan_status_text === 'Activo' ? 'active' : 'inactive'
      }));

      return {
        success: true,
        data: stores
      };
    }

    return response.data;
  },

  // Seleccionar tienda activa - devuelve un nuevo token con permisos de tienda
  async selectStore(storeId) {
    const response = await apiClient.post('/user/store/select', { store_id: storeId });
    return response.data;
  }
};
