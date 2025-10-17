import apiClient from './axios';

export const ordersApi = {
  // Crear una nueva orden/venta desde el POS
  async createOrder(orderData) {
    const response = await apiClient.post('/api/v1/orders/pos', orderData);
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

    const response = await apiClient.get(`/api/v1/orders?${params.toString()}`);
    return response.data;
  },

  // Obtener detalle de una orden específica
  async getOrder(orderId) {
    const response = await apiClient.get(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  // Obtener resumen de ventas del día
  async getDailySummary(date = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await apiClient.get(`/api/v1/orders/summary/daily?${params.toString()}`);
    return response.data;
  }
};
