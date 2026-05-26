import apiClient from './axios';

export const dashboardApi = {
  async getAnalytics({ dateFrom, dateTo, compare = 1 }) {
    const response = await apiClient.get('/pos/dashboard/analytics', {
      params: { date_from: dateFrom, date_to: dateTo, compare }
    });
    return response.data;
  }
};
