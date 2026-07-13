import apiClient from './axios';

/**
 * Ligo QR Interoperable (Ligo Payments / BCRP-CCE).
 *
 * Los endpoints POS requieren JWT de seller (filter 'auth' en backend).
 * El QR (cadena EMV) se renderiza en el cliente con la lib `qrcode`. El pago
 * se confirma vía webhook de Ligo (o simulate-confirm en sandbox).
 */
export const ligoQrApi = {
  /**
   * Inicia un nuevo pago Ligo QR.
   * @param {Object} params
   * @param {number} params.monto
   * @param {string} [params.venta_codigoreferencia] - opcional
   * @param {string} [params.moneda='PEN']
   */
  async initiate({ monto, venta_codigoreferencia, moneda = 'PEN' }) {
    try {
      const body = { monto, moneda };
      if (venta_codigoreferencia) body.venta_codigoreferencia = venta_codigoreferencia;

      const response = await apiClient.post('/pos/payments/ligo-qr/initiate', body);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[ligoQrApi.initiate]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error iniciando pago Ligo QR',
      };
    }
  },

  /**
   * Consulta el estado actual del pago.
   */
  async status(codigo) {
    try {
      const response = await apiClient.get(`/pos/payments/ligo-qr/status/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
      };
    } catch (error) {
      console.error('[ligoQrApi.status]', error);
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
      const response = await apiClient.post(`/pos/payments/ligo-qr/cancel/${codigo}`);
      return { success: response.data.success };
    } catch (error) {
      console.error('[ligoQrApi.cancel]', error);
      return { success: false };
    }
  },

  /**
   * Simula la confirmación del pago. Solo funciona si la tienda está en
   * ambiente 'prueba' del lado del backend. Úsalo durante el desarrollo
   * mientras no haya webhook real de Ligo.
   */
  async simulateConfirm(codigo) {
    try {
      const response = await apiClient.post(`/superadmin/ligo-qr/simulate-confirm/${codigo}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[ligoQrApi.simulateConfirm]', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error simulando confirmación',
      };
    }
  },
};

export default ligoQrApi;
