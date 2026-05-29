import { defineStore } from 'pinia';
import { paymentMethodsApi } from '../services/paymentMethodsApi';

// Métodos de pago activos del POS, cacheados por sesión. El PaymentModal los
// consume para mostrar/ocultar y renombrar los botones de pago. Si la carga
// falla, `loaded` queda false y el modal cae a su set por defecto (fail-open).
export const usePaymentMethodsStore = defineStore('paymentMethods', {
  state: () => ({
    active: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    // Mapa metodo_codigo → config, para lookups O(1) en el modal.
    byCode: (state) => {
      const map = {};
      for (const m of state.active) map[m.metodo_codigo] = m;
      return map;
    },
  },

  actions: {
    async fetchActive(force = false) {
      if (this.loaded && !force) return this.active;
      this.loading = true;
      try {
        this.active = await paymentMethodsApi.getActive();
        this.loaded = true;
      } catch (e) {
        console.warn('⚠️ [paymentMethods] No se pudieron cargar las formas de pago:', e?.message);
        this.loaded = false;
      } finally {
        this.loading = false;
      }
      return this.active;
    },

    reset() {
      this.active = [];
      this.loaded = false;
    },
  },
});
