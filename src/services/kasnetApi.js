import apiClient from './axios';

/**
 * Kasnet (Globokas) — QR y pago en agente corresponsal.
 *
 * Los endpoints POS requieren JWT de seller (filter 'auth' en backend).
 * En modo dummy el backend genera un código aleatorio y el payload del QR
 * firmado con HMAC. El QR se renderiza en el cliente con la lib `qrcode`.
 */
export const kasnetApi = {
  /**
   * Inicia un nuevo pago Kasnet.
   * @param {Object} params
   * @param {'qr'|'agente'} params.metodo
   * @param {number} params.monto
   * @param {string} [params.venta_codigoreferencia] - opcional
   * @param {string} [params.moneda='PEN']
   */
  async initiate({ metodo, monto, venta_codigoreferencia, moneda = 'PEN' }) {
    try {
      const body = { metodo, monto, moneda };
      if (venta_codigoreferencia) body.venta_codigoreferencia = venta_codigoreferencia;

      const response = await apiClient.post('/pos/payments/kasnet/initiate', body);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[kasnetApi.initiate]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error iniciando pago Kasnet',
      };
    }
  },

  /**
   * Consulta el estado actual del pago.
   */
  async status(codigo) {
    try {
      const response = await apiClient.get(`/pos/payments/kasnet/status/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
      };
    } catch (error) {
      console.error('[kasnetApi.status]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error consultando estado',
      };
    }
  },

  /**
   * Cancela un pago pendiente (ej. el cajero cierra el modal).
   */
  async cancel(codigo) {
    try {
      const response = await apiClient.post(`/pos/payments/kasnet/cancel/${codigo}`);
      return { success: response.data.success };
    } catch (error) {
      console.error('[kasnetApi.cancel]', error);
      return { success: false };
    }
  },

  /**
   * Simula la confirmación del pago. Solo funciona si el backend está en
   * KASNET_MODE=dummy (o no-producción). Úsalo durante el desarrollo
   * mientras no haya webhook real de Kasnet.
   */
  async simulateConfirm(codigo) {
    try {
      const response = await apiClient.post(`/superadmin/kasnet/simulate-confirm/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[kasnetApi.simulateConfirm]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error simulando confirmación',
      };
    }
  },
};

export default kasnetApi;
