import axios from 'axios';

// Decodifica el payload de un JWT sin verificar la firma. Devuelve null ante
// cualquier entrada malformada. (Espejo del helper del auth store; aquí no
// importamos el store para evitar dependencias circulares en el interceptor.)
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch (e) {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api2.mitienda.pe/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true, // Enviar cookies y headers de autenticación
  timeout: 60000 // Aumentado de 30s a 60s para órdenes grandes
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
    // La API usa { error: 0, message: "...", data: {...}, pagination: {...} }
    // Nosotros necesitamos { success: true, message: "...", data: {...}, pagination: {...} }
    if (response.data && typeof response.data.error !== 'undefined') {
      const originalData = response.data;
      response.data = {
        success: originalData.error === 0,
        message: originalData.message,
        // Si data es undefined pero hay un array directo, usar el array
        data: originalData.data !== undefined ? originalData.data : originalData,
        // Preservar pagination si existe
        ...(originalData.pagination && { pagination: originalData.pagination })
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no es la petición de login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // No hacer logout automático para ciertos endpoints que pueden fallar por permisos
      const nonCriticalEndpoints = [
        '/cash-register-shifts/movements',
        '/cash-register-shifts/active'
      ];
      const isNonCritical = nonCriticalEndpoints.some(endpoint =>
        originalRequest.url?.includes(endpoint)
      );

      if (isNonCritical) {
        console.warn('⚠️ [AXIOS] 401 on non-critical endpoint, not logging out:', originalRequest.url);
        return Promise.reject(error);
      }

      // Impersonación: el token activo es de un superadmin operando como otra
      // tienda. NO refrescar — el refresh_token guardado es del superadmin y
      // /auth/refresh devolvería un token scopeado a SU tienda, rompiendo la
      // impersonación de forma silenciosa (aparecería el banner "Sesión
      // cruzada"). En su lugar, restaurar el token original del superadmin
      // (embebido en el propio JWT) y volver al selector de tiendas.
      const currentToken = localStorage.getItem('access_token');
      const payload = decodeJwtPayload(currentToken);
      if (payload?.is_impersonating) {
        const originalToken = payload?.impersonation_context?.original_token;
        if (originalToken) {
          localStorage.setItem('access_token', originalToken);
          localStorage.removeItem('selected_store');
        } else {
          // Sin token original recuperable: cerrar sesión de forma segura.
          localStorage.clear();
        }
        if (window.location.pathname !== '/superadmin/stores') {
          window.location.href = '/superadmin/stores';
        }
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        try {
          // Intentar renovar el token
          const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api2.mitienda.pe/api/v1';
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
        // Verificar si es un cajero para redirigir a cashier-login
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isCashier = user?.user_type === 'cashier';

        localStorage.clear();

        const loginPath = isCashier ? '/cashier-login' : '/login';
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
