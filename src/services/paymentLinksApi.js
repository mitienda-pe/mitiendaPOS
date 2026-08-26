import apiClient from './axios';

/**
 * Links de pago desde el POS — el vendedor toma el pedido y cobra por WhatsApp.
 *
 * El link NO crea la venta ni descuenta stock: solo describe qué se cobra. La
 * venta la crea el checkout cuando el cliente paga, con su comprobante, su
 * kardex y su aviso al ERP. Por eso este flujo no toca la caja del turno: si el
 * cliente paga, la venta entra como cualquier otra venta web.
 *
 * OJO (para quien continúe esto): una orden de link creada desde el POS NO debe
 * usar `pasarela_id = 98`. `Order::findRecentOrphanPosOrder` adopta como venta
 * huérfana cualquier venta con esa pasarela y origen distinto de 'pos'.
 */
export const paymentLinksApi = {
  /**
   * Crea un link desde el carrito. `items` es el mismo `buildItemsPayload()`
   * que usan cotizaciones y ventas: el backend solo mira `product_id` y
   * `quantity`, y reprecia contra el catálogo.
   */
  async create(payload) {
    try {
      const response = await apiClient.post('/payment-links', payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const d = error.response.data;
        throw new Error(d.mensaje || d.messages?.mensaje || d.message || 'No se pudo crear el link');
      }
      throw error;
    }
  },

  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.estado) params.append('estado', filters.estado);
    const response = await apiClient.get(`/payment-links?${params.toString()}`);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/payment-links/${id}`);
    return response.data;
  },
};
