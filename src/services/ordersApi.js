import apiClient from './axios';

export const ordersApi = {
  // Crear una nueva orden/venta desde el POS
  // NOTA: Actualmente usa el API legacy a través de un proxy
  // El endpoint /orders/pos está en desarrollo
  async createOrder(orderData) {
    try {
      console.log('🚀 [ordersApi] Calling apiClient.post(/orders/legacy)');
      console.log('🚀 [ordersApi] Data:', orderData);
      const response = await apiClient.post('/orders/legacy', orderData);
      console.log('✅ [ordersApi] Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [ordersApi] Error creating order:', error);
      console.error('❌ [ordersApi] Error message:', error.message);
      console.error('❌ [ordersApi] Error response:', error.response);
      console.error('❌ [ordersApi] Error response status:', error.response?.status);
      console.error('❌ [ordersApi] Error response data:', error.response?.data);

      // Re-throw with better error info
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  // Validar stock antes de procesar el pago
  async validateStock(data) {
    try {
      console.log('🔍 [ordersApi] Validating stock:', data);
      const response = await apiClient.post('/orders/validate-stock', data);
      console.log('✅ [ordersApi] Stock validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ordersApi] Error validating stock:', error);
      console.error('❌ [ordersApi] Error response:', error.response?.data);
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

    const apiResponse = response.data;
    // Manejar ambos formatos: nuevo (con pagination) y legacy ({ orders: [...] })
    const rawData = apiResponse.data || apiResponse.orders || apiResponse;
    const paginationData = apiResponse.pagination;

    if (Array.isArray(rawData)) {
      return {
        success: true,
        data: rawData, // Ya están normalizados del backend
        meta: paginationData ? {
          page: paginationData.page,
          limit: paginationData.perPage || paginationData.limit || 20,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
          hasMore: paginationData.hasMore
        } : {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: rawData.length,
          totalPages: 1,
          hasMore: rawData.length >= (filters.limit || 20)
        }
      };
    }

    return {
      success: false,
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    };
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
  },

  // Reenviar email de factura al cliente
  async resendInvoiceEmail(orderId, customEmail = null) {
    try {
      const payload = customEmail ? { email: customEmail } : {};
      const response = await apiClient.post(`/orders/${orderId}/resend-invoice-email`, payload);
      return response.data;
    } catch (error) {
      // Re-throw with better error info
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  // Anular una venta POS (requiere PIN supervisor o contraseña admin)
  async voidOrder(orderId, { authType, authValue, motivo }) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/void`, {
        auth_type: authType,
        auth_value: authValue,
        motivo
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.messages?.error || error.response.data.message || 'Error al anular la venta');
      }
      throw error;
    }
  },

  // Calcular total de la orden usando el método de NetSuite
  // Este endpoint garantiza que los totales coincidan exactamente con lo que NetSuite espera
  async calculateTotal(items) {
    try {
      console.log('🧮 [ordersApi] Calculating total with NetSuite method:', items);
      const response = await apiClient.post('/orders/calculate-total', { items });
      console.log('✅ [ordersApi] Total calculated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ordersApi] Error calculating total:', error);
      console.error('❌ [ordersApi] Error response:', error.response?.data);
      // Re-throw with better error info
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  }
};
