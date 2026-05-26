import { defineStore } from 'pinia';
import { dashboardApi } from '../services/dashboardApi';

const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const presetRange = (preset) => {
  const today = new Date();
  const to = toISODate(today);
  if (preset === 'today') return { dateFrom: to, dateTo: to };
  if (preset === '7d') {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { dateFrom: toISODate(from), dateTo: to };
  }
  if (preset === '30d') {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    return { dateFrom: toISODate(from), dateTo: to };
  }
  return { dateFrom: to, dateTo: to };
};

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    analytics: null,
    filters: {
      preset: '7d',
      ...presetRange('7d'),
      compare: 1
    },
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchAnalytics() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await dashboardApi.getAnalytics({
          dateFrom: this.filters.dateFrom,
          dateTo: this.filters.dateTo,
          compare: this.filters.compare
        });
        if (res?.success) {
          this.analytics = res.data;
        } else {
          this.error = res?.message || 'No se pudieron cargar las analíticas';
        }
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Error de red';
      } finally {
        this.isLoading = false;
      }
    },

    async setPreset(preset) {
      this.filters.preset = preset;
      const range = presetRange(preset);
      this.filters.dateFrom = range.dateFrom;
      this.filters.dateTo = range.dateTo;
      await this.fetchAnalytics();
    },

    async setCustomRange(dateFrom, dateTo) {
      this.filters.preset = 'custom';
      this.filters.dateFrom = dateFrom;
      this.filters.dateTo = dateTo;
      await this.fetchAnalytics();
    },

    async toggleCompare() {
      this.filters.compare = this.filters.compare ? 0 : 1;
      await this.fetchAnalytics();
    }
  }
});
