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
      console.log('🔍 [SHIFT STORE] fetchActiveShift() - Consultando API...');
      this.loading = true;
      this.error = null;

      try {
        const response = await shiftsApi.getActiveShift();
        console.log('📡 [SHIFT STORE] Respuesta del API:', response);

        if (response.success) {
          this.activeShift = response.active ? response.data : null;
          console.log('💾 [SHIFT STORE] Estado actualizado:', {
            active: response.active,
            shift: this.activeShift
          });
        } else {
          this.error = response.error;
          console.error('❌ [SHIFT STORE] Error en respuesta:', response.error);
        }
      } catch (error) {
        console.error('❌ [SHIFT STORE] Error fetching active shift:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async openShift(montoInicial, notasApertura = '', cajaNumero = null, empleadoId = null) {
      this.loading = true;
      this.error = null;

      try {
        const response = await shiftsApi.openShift(montoInicial, notasApertura, cajaNumero, empleadoId);

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

    async closeShift(montoReal, notasCierre = '', pin = null) {
      console.log('🔒 [SHIFT STORE] closeShift() llamado', {
        shiftId: this.activeShift?.id,
        montoReal,
        notasCierre,
        has_pin: !!pin
      });

      if (!this.activeShift) {
        console.error('❌ [SHIFT STORE] No hay turno activo para cerrar');
        return { success: false, error: 'No hay turno activo' };
      }

      this.loading = true;
      this.error = null;

      try {
        console.log('📡 [SHIFT STORE] Llamando API closeShift...');
        const response = await shiftsApi.closeShift(
          this.activeShift.id,
          {
            monto_real: montoReal,
            notas_cierre: notasCierre,
            pin: pin  // ✅ FIX: Pasar PIN para validación en backend
          }
        );

        console.log('📡 [SHIFT STORE] Respuesta del API:', response);

        if (response.success) {
          console.log('✅ [SHIFT STORE] Turno cerrado, limpiando estado...');
          this.activeShift = null; // Clear active shift
          return { success: true, data: response.data };
        } else {
          console.error('❌ [SHIFT STORE] Error al cerrar:', response.error);
          this.error = response.error;
          return { success: false, error: response.error };
        }
      } catch (error) {
        console.error('❌ [SHIFT STORE] Exception al cerrar shift:', error);
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
