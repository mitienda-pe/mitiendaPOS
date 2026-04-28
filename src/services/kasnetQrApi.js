import apiClient from './axios';

/**
 * Kasnet QR Interoperable (Globokas).
 *
 * Los endpoints POS requieren JWT de seller (filter 'auth' en backend).
 * En modo dummy el backend genera un código aleatorio y el payload del QR
 * firmado con HMAC. El QR se renderiza en el cliente con la lib `qrcode`.
 */
export const kasnetQrApi = {
  /**
   * Inicia un nuevo pago Kasnet QR.
   * @param {Object} params
   * @param {number} params.monto
   * @param {string} [params.venta_codigoreferencia] - opcional
   * @param {string} [params.moneda='PEN']
   */
  async initiate({ monto, venta_codigoreferencia, moneda = 'PEN' }) {
    try {
      const body = { monto, moneda };
      if (venta_codigoreferencia) body.venta_codigoreferencia = venta_codigoreferencia;

      const response = await apiClient.post('/pos/payments/kasnet-qr/initiate', body);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[kasnetQrApi.initiate]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error iniciando pago Kasnet QR',
      };
    }
  },

  /**
   * Consulta el estado actual del pago.
   */
  async status(codigo) {
    try {
      const response = await apiClient.get(`/pos/payments/kasnet-qr/status/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
      };
    } catch (error) {
      console.error('[kasnetQrApi.status]', error);
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
      const response = await apiClient.post(`/pos/payments/kasnet-qr/cancel/${codigo}`);
      return { success: response.data.success };
    } catch (error) {
      console.error('[kasnetQrApi.cancel]', error);
      return { success: false };
    }
  },

  /**
   * Simula la confirmación del pago. Solo funciona si el backend está en
   * KASNET_QR_MODE=dummy (o no-producción). Úsalo durante el desarrollo
   * mientras no haya webhook real de Kasnet.
   */
  async simulateConfirm(codigo) {
    try {
      const response = await apiClient.post(`/superadmin/kasnet-qr/simulate-confirm/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[kasnetQrApi.simulateConfirm]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error simulando confirmación',
      };
    }
  },
};

export default kasnetQrApi;
