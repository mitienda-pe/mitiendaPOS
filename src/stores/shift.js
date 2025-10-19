import { defineStore } from 'pinia';
import { shiftsApi } from '../services/shiftsApi';

export const useShiftStore = defineStore('shift', {
  state: () => ({
    activeShift: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasActiveShift: (state) => !!state.activeShift,
    isShiftOpen: (state) => state.activeShift?.estado === 'abierto',
  },

  actions: {
    async fetchActiveShift() {
      this.loading = true;
      this.error = null;

      try {
        const response = await shiftsApi.getActiveShift();

        if (response.success) {
          this.activeShift = response.active ? response.data : null;
        } else {
          this.error = response.error;
        }
      } catch (error) {
        console.error('Error fetching active shift:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async openShift(montoInicial, notasApertura = '', cajaNumero = null) {
      this.loading = true;
      this.error = null;

      try {
        const response = await shiftsApi.openShift(montoInicial, notasApertura, cajaNumero);

        if (response.success) {
          this.activeShift = response.data;
          return { success: true, data: response.data };
        } else {
          this.error = response.error;
          return { success: false, error: response.error };
        }
      } catch (error) {
        console.error('Error opening shift:', error);
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async closeShift(montoReal, notasCierre = '') {
      if (!this.activeShift) {
        return { success: false, error: 'No hay turno activo' };
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await shiftsApi.closeShift(
          this.activeShift.id,
          montoReal,
          notasCierre
        );

        if (response.success) {
          this.activeShift = null; // Clear active shift
          return { success: true, data: response.data };
        } else {
          this.error = response.error;
          return { success: false, error: response.error };
        }
      } catch (error) {
        console.error('Error closing shift:', error);
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    clearActiveShift() {
      this.activeShift = null;
      this.error = null;
    },
  },
});
