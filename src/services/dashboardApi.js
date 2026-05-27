import apiClient from './axios';

export const dashboardApi = {
  async getAnalytics({ dateFrom, dateTo, compare = 1, empleadoId = null }) {
    const params = { date_from: dateFrom, date_to: dateTo, compare };
    if (empleadoId) params.empleado_id = empleadoId;
    const response = await apiClient.get('/pos/dashboard/analytics', { params });
    return response.data;
  }
};
