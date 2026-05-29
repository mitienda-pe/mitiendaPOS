import apiClient from './axios';

// Formas de pago configurables del POS (tabla pos_payment_methods, por tienda).
// Endpoints bajo /pos/payment-methods (filtro auth). Devuelven {error:0,data} →
// el interceptor normaliza a {success,data} → se lee response.data.data.
export const paymentMethodsApi = {
  // Lista completa (config). Siembra el catálogo por defecto si la tienda no tiene.
  async getAll() {
    const response = await apiClient.get('/pos/payment-methods');
    return response.data?.data ?? [];
  },

  // Solo habilitados, ordenados. Consumido por el PaymentModal.
  async getActive() {
    const response = await apiClient.get('/pos/payment-methods/active');
    return response.data?.data ?? [];
  },

  // Edita un método (nombre, habilitado, orden, requiere_referencia, label_referencia).
  async update(id, payload) {
    const response = await apiClient.put(`/pos/payment-methods/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  // Restaura el catálogo por defecto.
  async reset() {
    const response = await apiClient.post('/pos/payment-methods/reset');
    return response.data?.data ?? [];
  },
};
