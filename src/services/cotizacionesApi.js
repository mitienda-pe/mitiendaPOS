import apiClient from './axios';

/**
 * Cotizaciones / proformas del POS.
 *
 * Una cotización es un snapshot del carrito que NO descuenta inventario ni
 * confirma la venta. Se puede compartir (link público + PDF), retomar, editar y
 * convertir en venta. La conversión se hace por el flujo normal del POS (cobrar
 * la venta) y luego se sella el vínculo con `convert(id, tiendaventaId)`.
 */
export const cotizacionesApi = {
  // Crear un borrador desde el carrito. `payload` mismo shape que createOrder
  // (items[] + customer{} + document_type), pero sin pagos.
  async create(payload) {
    try {
      const response = await apiClient.post('/cotizaciones', payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  // Editar un borrador (reprocesa items/cliente/totales).
  async update(id, payload) {
    try {
      const response = await apiClient.put(`/cotizaciones/${id}`, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  // Detalle de una cotización (incluye items para retomar el carrito y pdf_status).
  async get(id) {
    const response = await apiClient.get(`/cotizaciones/${id}`);
    return response.data;
  },

  // Historial paginado de la tienda.
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    const response = await apiClient.get(`/cotizaciones?${params.toString()}`);
    return response.data;
  },

  // Anular (soft) una cotización.
  async remove(id) {
    const response = await apiClient.delete(`/cotizaciones/${id}`);
    return response.data;
  },

  // Encolar la generación del PDF A4. Luego se hace polling con get(id).
  async generatePdf(id) {
    const response = await apiClient.post(`/cotizaciones/${id}/pdf`);
    return response.data;
  },

  // Sellar la cotización como convertida, vinculándola a la venta ya creada.
  async convert(id, tiendaventaId) {
    try {
      const response = await apiClient.post(`/cotizaciones/${id}/convert`, {
        tiendaventa_id: tiendaventaId
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.mensaje || error.response.data.message || 'Error al convertir la cotización');
      }
      throw error;
    }
  },

  // URL pública de la vista compartible (link para el cliente).
  publicUrl(token) {
    const base = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
    return `${base}/cotizacion/${token}`;
  }
};
