import { defineStore } from 'pinia';
import { posEmpleadosApi } from '../services/posEmpleadosApi';
import { useAuthStore } from './auth';

/**
 * Store para gestionar la sesión del cajero en el POS
 * El cajero es el empleado que opera el punto de venta
 */
export const useCashierStore = defineStore('cashier', {
  state: () => ({
    cashier: null, // Cajero autenticado
    sucursal: null, // Sucursal seleccionada
    cajaNumero: null, // Número de caja
    authenticated: false,
    locked: false, // Estado de bloqueo
    lockReason: null, // Razón del bloqueo (manual, inactividad, etc)
    loading: false,
    error: null,
  }),

  getters: {
    isCashierAuthenticated: (state) => state.authenticated && !!state.cashier,
    cashierName: (state) => state.cashier ? `${state.cashier.empleado_nombres} ${state.cashier.empleado_apellidos}` : null,
    cashierRole: (state) => state.cashier?.empleado_rol || null,
    workLocation: (state) => {
      if (!state.sucursal || !state.cajaNumero) return null;
      // Soportar ambos formatos: nombre directo o tiendadireccion_nombresucursal
      const sucursalNombre = state.sucursal.nombre || state.sucursal.tiendadireccion_nombresucursal || 'Sucursal';
      return `${sucursalNombre} - Caja ${state.cajaNumero}`;
    },
  },

  actions: {
    /**
     * Autenticar cajero con PIN
     */
    async authenticateCashier(empleadoId, pin, sucursalId, cajaNumero, ignoreSchedule = false) {
      this.loading = true;
      this.error = null;

      try {
        // Obtener tienda_id del authStore
        const authStore = useAuthStore();
        const storeId = authStore.selectedStore?.id;

        if (!storeId) {
          throw new Error('No hay tienda seleccionada');
        }

        console.log('🔐 [CASHIER] Validando PIN:', {
          empleadoId,
          storeId,
          pin: '****',
          sucursalId,
          cajaNumero,
          ignoreSchedule
        });

        // Validar PIN
        const response = await posEmpleadosApi.validatePin(storeId, pin, ignoreSchedule);
        console.log('📡 [CASHIER] Respuesta del servidor:', response);

        if (!response.success) {
          throw new Error(response.message || 'PIN inválido');
        }

        // Verificar que el empleado es el correcto
        if (response.data.empleado_id != empleadoId) {
          throw new Error('El PIN no corresponde al empleado seleccionado');
        }

        // Guardar en estado
        this.cashier = response.data;
        this.sucursal = { id: sucursalId };
        this.cajaNumero = cajaNumero;
        this.authenticated = true;

        // Persistir en localStorage
        localStorage.setItem('cashier_session', JSON.stringify({
          cashier: this.cashier,
          sucursal: this.sucursal,
          cajaNumero: this.cajaNumero,
          authenticatedAt: new Date().toISOString()
        }));

        console.log('✅ [CASHIER] Cajero autenticado:', this.cashierName);
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al autenticar cajero';
        console.error('❌ [CASHIER] Error autenticando cajero:', error);
        console.error('📋 [CASHIER] Detalle del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Crear un error con el mensaje del servidor para que se muestre en el modal
        const errorToThrow = new Error(this.error);
        errorToThrow.response = error.response;
        throw errorToThrow;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Bloquear caja (requiere PIN para desbloquear)
     */
    lock(reason = 'Manual') {
      this.locked = true;
      this.lockReason = reason;
      console.log(`🔒 [CASHIER] Caja bloqueada - Razón: ${reason}`);
    },

    /**
     * Desbloquear caja
     */
    unlock() {
      this.locked = false;
      this.lockReason = null;
      console.log('🔓 [CASHIER] Caja desbloqueada');
    },

    /**
     * Refrescar la marca de tiempo de la sesión (ventana deslizante).
     *
     * `authenticatedAt` solo se setea en el login con PIN, y `restoreSession()`
     * desloguea al pasar 12h desde ese momento. En jornadas largas (p. ej.
     * panaderías que abren de madrugada) eso deslogueaba al cajero a media
     * tarde dejando ventas con cajero_id null. Llamar a esto al desbloquear
     * (re-validado con PIN) y al restaurar la sesión convierte el límite en una
     * ventana deslizante: un cajero activo no expira a mitad del turno.
     */
    refreshSession() {
      if (!this.cashier) return;
      try {
        localStorage.setItem('cashier_session', JSON.stringify({
          cashier: this.cashier,
          sucursal: this.sucursal,
          cajaNumero: this.cajaNumero,
          authenticatedAt: new Date().toISOString(),
        }));
        console.log('🔄 [CASHIER] Sesión refrescada (ventana deslizante)');
      } catch (error) {
        console.error('❌ [CASHIER] Error refrescando sesión:', error);
      }
    },

    /**
     * Cerrar sesión de cajero
     */
    logout() {
      this.cashier = null;
      this.sucursal = null;
      this.cajaNumero = null;
      this.authenticated = false;
      this.locked = false;
      this.lockReason = null;
      this.error = null;
      localStorage.removeItem('cashier_session');
      console.log('🚪 [CASHIER] Sesión de cajero cerrada');
    },

    /**
     * Restaurar sesión de cajero desde localStorage
     */
    restoreSession() {
      try {
        const session = localStorage.getItem('cashier_session');
        if (!session) return false;

        const data = JSON.parse(session);

        // Verificar que la sesión no sea muy antigua (ej: más de 12 horas)
        const authenticatedAt = new Date(data.authenticatedAt);
        const now = new Date();
        const hoursSinceAuth = (now - authenticatedAt) / (1000 * 60 * 60);

        if (hoursSinceAuth > 12) {
          console.warn('⚠️ [CASHIER] Sesión expirada');
          this.logout();
          return false;
        }

        this.cashier = data.cashier;
        this.sucursal = data.sucursal;
        this.cajaNumero = data.cajaNumero;
        this.authenticated = true;

        // Ventana deslizante: un reload/relanzamiento dentro de las 12h extiende
        // otras 12h, evitando que un cajero activo expire a mitad del turno.
        this.refreshSession();

        console.log('🔄 [CASHIER] Sesión restaurada:', this.cashierName);
        return true;
      } catch (error) {
        console.error('❌ [CASHIER] Error restaurando sesión:', error);
        this.logout();
        return false;
      }
    },

    /**
     * Actualizar datos de sucursal
     */
    setSucursal(sucursalData) {
      this.sucursal = sucursalData;

      // Actualizar en localStorage
      const session = JSON.parse(localStorage.getItem('cashier_session') || '{}');
      session.sucursal = sucursalData;
      localStorage.setItem('cashier_session', JSON.stringify(session));
    },

    /**
     * Actualizar número de caja
     */
    setCajaNumero(cajaNumero) {
      this.cajaNumero = cajaNumero;

      // Actualizar en localStorage
      const session = JSON.parse(localStorage.getItem('cashier_session') || '{}');
      session.cajaNumero = cajaNumero;
      localStorage.setItem('cashier_session', JSON.stringify(session));
    }
  },
});
