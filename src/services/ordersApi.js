import apiClient from './axios';

export const ordersApi = {
  // Crear una nueva orden/venta desde el POS
  // NOTA: Actualmente usa el API legacy a través de un proxy
  // El endpoint /orders/pos está en desarrollo
  async createOrder(orderData) {
    try {
      const response = await apiClient.post('/orders/legacy', orderData);
      return response.data;
    } catch (error) {
      console.error('❌ [ordersApi] Error creating order:', error);
      console.error('❌ [ordersApi] Error response:', error.response);
      console.error('❌ [ordersApi] Error response data:', error.response?.data);

      // Re-throw with better error info
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  // Crear orden usando el endpoint nativo (EN DESARROLLO - NO USAR AÚN)
  async createOrderNative(orderData) {
    const response = await apiClient.post('/orders/pos', orderData);
    return response.data;
  },

  // Obtener lista de órdenes con filtros
  async getOrders(filters = {}) {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.status) params.append('status', filters.status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.source) params.append('source', filters.source); // web, pos, api

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Obtener detalle de una orden específica
  async getOrder(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Obtener resumen de ventas del día
  async getDailySummary(date = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await apiClient.get(`/orders/summary/daily?${params.toString()}`);
    return response.data;
  }
};
