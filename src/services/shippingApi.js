import apiClient from './axios';

/**
 * Envío a domicilio desde el POS.
 *
 * La tienda sale del JWT del cajero, no del payload: por eso son los endpoints
 * `pos/shipping/*` y no los públicos de `checkout/*` que usa la tienda virtual.
 *
 * La tarifa que devuelve `quote` es REFERENCIAL. El servidor la vuelve a resolver
 * al registrar la venta (PosShippingResolver), porque entre la cotización y el
 * cobro puede cambiar el tarifario o pasar la hora de corte del servicio.
 */
export const shippingApi = {
  /**
   * Departamentos con cobertura de reparto.
   * @param {number} paisId
   */
  async getDepartamentos(paisId = 1) {
    const response = await apiClient.get('/pos/shipping/departamentos', {
      params: { pais_id: paisId }
    });
    return response.data?.departamentos || [];
  },

  /**
   * Provincias con cobertura.
   * @param {string|number} codDpto
   */
  async getProvincias(codDpto) {
    const response = await apiClient.get(`/pos/shipping/provincias/${codDpto}`);
    return response.data?.provincias || [];
  },

  /**
   * Distritos con cobertura.
   * @param {string} provinciaCodigo Formato "codDpto-codProv" (ej. "15-1")
   */
  async getDistritos(provinciaCodigo) {
    const response = await apiClient.get(`/pos/shipping/distritos/${provinciaCodigo}`);
    return response.data?.distritos || [];
  },

  /**
   * Cotiza el envío al destino.
   *
   * Respuesta en dos formas, según la tienda:
   *  - tarifa única:    { success, service_types_enabled: false, costo_envio, envio_gratis, monto_envio_gratis }
   *  - tipos de servicio: { success, service_types_enabled: true, opciones: [...], monto_envio_gratis }
   *  - sin cobertura / bloqueada: { success: false, mensaje }
   *
   * @param {number} ubigeoId
   * @param {number} montoCarrito Total de productos, sin envío
   */
  async quote(ubigeoId, montoCarrito = 0) {
    const response = await apiClient.post('/pos/shipping/quote', {
      ubigeo_id: ubigeoId,
      monto_carrito: montoCarrito
    });
    return response.data;
  },

  /**
   * Fechas y horarios disponibles para entrega programada.
   * Devuelve { success, mostrar_fecha: false } si la tienda no programa entregas.
   *
   * @param {number} ubigeoId
   * @param {string|null} serviceTypeCode
   */
  async getFechas(ubigeoId, serviceTypeCode = null) {
    const response = await apiClient.post('/pos/shipping/fechas', {
      ubigeo_id: ubigeoId,
      service_type_code: serviceTypeCode
    });
    return response.data;
  },

  /**
   * Direcciones guardadas del cliente (libreta de direcciones de la plataforma).
   * @param {number} customerId
   */
  async getCustomerAddresses(customerId) {
    const response = await apiClient.get(`/customers/${customerId}/addresses`);
    return response.data?.data || [];
  },

  /**
   * Guarda una dirección nueva en la libreta del cliente, para que la próxima
   * venta no obligue a volver a escribirla.
   * @param {number} customerId
   * @param {object} address
   */
  async createCustomerAddress(customerId, address) {
    const response = await apiClient.post(`/customers/${customerId}/addresses`, address);
    return response.data?.data || null;
  },

  /**
   * Cobra una venta contra-entrega ya registrada.
   * @param {number} orderId
   * @param {Array} payments
   * @param {number|null} cajeroId
   */
  async collectPendingOrder(orderId, payments, cajeroId = null) {
    const response = await apiClient.post(`/pos/orders/${orderId}/collect`, {
      payments,
      cajero_id: cajeroId
    });
    return response.data;
  }
};

export default shippingApi;
