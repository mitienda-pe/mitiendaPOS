import apiClient from './axios';

// Configuración de billeteras QR (Yape/Plin) reutilizando los mismos endpoints
// del backoffice (/payment-gateways/qr-wallets*). Esos endpoints están bajo
// filter [auth, moduleaccess], pero 'payment-gateways' no está mapeado en
// ModuleRoutes → moduleaccess es fail-open, así que el token del POS (scoped a
// la tienda) los puede llamar.
//
// El QR vive en tiendaspasarelas (valor1=teléfono, valor2=imagen) y es la MISMA
// config que usa el storefront. Respuestas {error:0,data} → el interceptor
// normaliza → se lee response.data.data.
export const paymentGatewaysApi = {
  // GET /payment-gateways/qr-wallets →
  //   { gateway: { configured, enabled, ... }, credentials: { yape_*, plin_*, instructions } }
  async getQrWallets() {
    const response = await apiClient.get('/payment-gateways/qr-wallets');
    return response.data?.data ?? response.data;
  },

  // POST /payment-gateways/qr-wallets/upload-qr (multipart) →
  //   { qr_url, wallet, message }. Sube la imagen a R2 y guarda valor2.
  async uploadQrImage(wallet, file) {
    const formData = new FormData();
    formData.append('wallet', wallet);
    formData.append('qr_image', file);
    const response = await apiClient.post('/payment-gateways/qr-wallets/upload-qr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  // POST /payment-gateways/qr-wallets → crea la config (primera vez).
  async saveQrWallets(payload) {
    const response = await apiClient.post('/payment-gateways/qr-wallets', payload);
    return response.data?.data ?? response.data;
  },

  // PUT /payment-gateways/qr-wallets → actualiza la config existente.
  async updateQrWallets(payload) {
    const response = await apiClient.put('/payment-gateways/qr-wallets', payload);
    return response.data?.data ?? response.data;
  },
};
