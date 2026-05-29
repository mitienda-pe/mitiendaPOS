import apiClient from './axios';

// Servicio de reportes para el POS. Reusa los endpoints /reports/* del backoffice
// (protegidos por auth + moduleaccess mod_reportes_ventas).
//
// Nota: el interceptor del POS (services/axios.js) normaliza {error:0,data} a
// {success,data} pero NO preserva total_count/has_more, así que aquí solo se
// usan las filas (response.data.data). Las exportaciones usan responseType blob,
// que el interceptor deja pasar sin tocar.

const buildParams = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.payment_status !== undefined && filters.payment_status !== '') {
    params.append('payment_status', String(filters.payment_status));
  }
  if (filters.payment_gateway_id) params.append('payment_gateway_id', String(filters.payment_gateway_id));
  return params;
};

const reportsApi = {
  // ─── Ventas (órdenes) ───

  async getOrdersPreview(filters = {}) {
    const response = await apiClient.get(`/reports/orders/preview?${buildParams(filters).toString()}`);
    return response.data?.data ?? [];
  },

  async exportOrders(filters = {}, format = 'CSV') {
    const params = buildParams(filters);
    params.append('format', format);
    const response = await apiClient.get(`/reports/orders/export?${params.toString()}`, { responseType: 'blob' });
    return response.data;
  },

  // ─── Productos vendidos ───

  async getProductSalesPreview(filters = {}) {
    const response = await apiClient.get(`/reports/product-sales/preview?${buildParams(filters).toString()}`);
    return response.data?.data ?? [];
  },

  async exportProductSales(filters = {}, format = 'CSV') {
    const params = buildParams(filters);
    params.append('format', format);
    const response = await apiClient.get(`/reports/product-sales/export?${params.toString()}`, { responseType: 'blob' });
    return response.data;
  },

  // Descarga un Blob como archivo.
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportsApi;
