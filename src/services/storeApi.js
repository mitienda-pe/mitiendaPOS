import apiClient from './axios';

// Servicio para datos de tienda (información, configuración/preferencias y logo).
// Reusa los mismos endpoints del backoffice (protegidos por auth + moduleaccess).
//
// Notas sobre normalización de respuestas (ver services/axios.js):
// - /store-info devuelve el objeto PLANO (sin envoltura {error,data}); el
//   interceptor NO lo toca → se lee directo de response.data.
// - /store-config y /appearance/* devuelven {error:0, data} → el interceptor
//   normaliza a {success, data} → se lee de response.data.data.
export const storeApi = {
  // ─── Información de la tienda ───

  // GET /store-info → objeto plano con los datos de la tienda.
  async getInfo() {
    const response = await apiClient.get('/store-info');
    return response.data;
  },

  // PUT /store-info → { message, data }. Devuelve los datos actualizados.
  async updateInfo(data) {
    const response = await apiClient.put('/store-info', data);
    return response.data?.data ?? response.data;
  },

  // GET /store-info/rubros → array de rubros.
  async getRubros() {
    const response = await apiClient.get('/store-info/rubros');
    return Array.isArray(response.data) ? response.data : [];
  },

  // ─── Configuración / preferencias ───

  // GET /store-config → objeto de configuración.
  async getConfig() {
    const response = await apiClient.get('/store-config');
    return response.data?.data ?? response.data;
  },

  // PUT /store-config → objeto de configuración actualizado.
  async updateConfig(data) {
    const response = await apiClient.put('/store-config', data);
    return response.data?.data ?? response.data;
  },

  // GET /store-config/currencies → array de monedas activas.
  async getCurrencies() {
    const response = await apiClient.get('/store-config/currencies');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // ─── Logo (apariencia) ───

  // GET /appearance/config → { logo_url, logo_email_url, favicon_url }.
  async getAppearance() {
    const response = await apiClient.get('/appearance/config');
    return response.data?.data ?? response.data;
  },

  // POST /appearance/config/logo (multipart) → URLs actualizadas.
  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/appearance/config/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  // DELETE /appearance/config/logo → URLs actualizadas.
  async deleteLogo() {
    const response = await apiClient.delete('/appearance/config/logo');
    return response.data?.data ?? response.data;
  },
};
