import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_BASE_URL || 'https://api2.mitienda.pe'}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true, // Enviar cookies y headers de autenticación
  timeout: 30000
});

// Request interceptor - Agregar token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejo de errores y renovación de tokens
apiClient.interceptors.response.use(
  (response) => {
    // Normalizar respuesta de la API
    // La API usa { error: 0, message: "...", data: {...} }
    // Nosotros necesitamos { success: true, message: "...", data: {...} }
    if (response.data && typeof response.data.error !== 'undefined') {
      response.data = {
        success: response.data.error === 0,
        message: response.data.message,
        data: response.data.data
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no es la petición de login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        try {
          // Intentar renovar el token
          const baseURL = import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_BASE_URL || 'https://api2.mitienda.pe'}/api/v1`;
          const response = await axios.post(
            `${baseURL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token, refresh_token: newRefreshToken } = response.data.data;

          // Guardar nuevos tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Reintentar la petición original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Si falla la renovación, limpiar tokens y redirigir a login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('selected_store');

          // Redirigir a login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, limpiar y redirigir
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
