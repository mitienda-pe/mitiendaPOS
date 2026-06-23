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
        logo: store.tienda_logo || null,
        url: store.tienda_url,
        plan: store.plan_titulo,
        status: store.tienda_plan_status_text === 'Activo' ? 'active' : 'inactive',
        // Store details for receipts/invoices
        ruc: store.tienda_ruc || '',
        razonSocial: store.tienda_razonsocial || store.tienda_nombre_comercial || '',
        email: store.tienda_email || '',
        telefono: store.tienda_telefono || store.tienda_telefonocelular1 || store.tienda_telefonofijo1 || '',
        direccion: store.tienda_direccion || '',
        distrito: store.tienda_distrito || '',
        provincia: store.tienda_provincia || '',
        departamento: store.tienda_departamento || '',
        // Full address for tickets
        direccionCompleta: [
          store.tienda_direccion,
          store.tienda_distrito,
          store.tienda_provincia,
          store.tienda_departamento
        ].filter(Boolean).join(', ')
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
  },

  // Login de cajero directo con store_id + PIN
  async cashierLogin(storeId, pin) {
    const response = await apiClient.post('/auth/cashier-login', {
      store_id: storeId,
      pin: pin
    });
    return response.data;
  },

  // Verifica que la tienda autenticada tenga mod_pos habilitado.
  // Si responde 403, la tienda no tiene PDV y no debe entrar a la app.
  async checkPosAccess() {
    const response = await apiClient.get('/pos/access');
    return response.data;
  },

  // --- Recuperación de contraseña (endpoints públicos) ---

  // Solicita el envío del enlace de restablecimiento al correo del administrador.
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Valida que el token del enlace de restablecimiento sea válido y no expirado.
  async validateResetToken(token) {
    const response = await apiClient.post('/auth/validate-reset-token', { token });
    return response.data;
  },

  // Cambia la contraseña usando el token del enlace.
  async resetPassword({ token, password, passwordConfirmation }) {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },

  // --- Registro self-service del POS ---

  // Envía el código OTP al correo. Requiere captcha_token (Cap.js). Devuelve
  // { error, session_id, masked_recipient, expires_in_seconds, has_account,
  //   account_notice }. Si el email ya tiene cuenta SIN prueba vigente, has_account
  //   es true y el OTP igual se envía (la tienda se adjuntará a esa cuenta). Si el
  //   email ya tiene una prueba gratis VIGENTE, responde 409 { blocked:true } (axios
  //   lanza) y no se envía código.
  async registerSendOtp({ email, name, captchaToken }) {
    const response = await apiClient.post('/pos/register/send-otp', {
      email,
      name,
      captcha_token: captchaToken,
    });
    return response.data?.data ?? response.data;
  },

  // Crea la tienda (trial PDV) y devuelve { access_token, user, store } scopeado.
  async register(payload) {
    const response = await apiClient.post('/pos/register', payload);
    return response.data?.data ?? response.data;
  }
};
