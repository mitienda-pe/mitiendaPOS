import { defineStore } from 'pinia';
import router from '../router';
import { authApi } from '../services/authApi';
import billingApi from '../services/billingApi';

// Helper function to parse stored user data
const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
};

// Decode the payload of a JWT without verifying its signature.
// Returns null on any malformed input.
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch (e) {
    return null;
  }
};

// Normaliza el `data` de /pos/access a un objeto de flags booleanos.
// Centraliza el set de módulos para que los getters can* y el sidebar de
// Settings lean una sola estructura. Default a false si el backend no lo envía.
const normalizeAccessFlags = (access) => {
  const a = access || {};
  return {
    plan: a.plan ?? null,
    netsuite: !!a.netsuite_enabled,
    billing: !!a.billing_enabled,
    storeInfo: !!a.store_info_enabled,
    preferences: !!a.preferences_enabled,
    reports: !!a.reports_enabled,
    brands: !!a.brands_enabled,
    categories: !!a.categories_enabled,
    paymentMethods: !!a.payment_methods_enabled,
    branchStock: !!a.branch_stock_enabled,
  };
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser(),
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    selectedStore: JSON.parse(localStorage.getItem('selected_store') || 'null'),
    stores: [],
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    userRole: (state) => state.user?.role || null,
    isCashier: (state) => state.user?.user_type === 'cashier',
    isAdmin: (state) => state.user?.user_type !== 'cashier',
    hasSelectedStore: (state) => !!state.selectedStore,
    hasMultipleStores: (state) => state.stores.length > 1,
    // tienda_id real al que apunta el JWT (lo que el backend va a usar).
    tokenTiendaId: (state) => {
      const payload = decodeJwtPayload(state.accessToken);
      const id = payload?.tienda_id ?? payload?.store_id;
      return id != null ? Number(id) : null;
    },
    // true si el JWT activo apunta a una tienda distinta a la seleccionada en UI.
    // Esto detecta sesiones cruzadas (token viejo de otra tienda en localStorage).
    tokenStoreMismatch() {
      if (!this.selectedStore?.id || this.tokenTiendaId == null) return false;
      return Number(this.selectedStore.id) !== this.tokenTiendaId;
    },
    // true si el JWT corresponde a un cajero POS (login por PIN).
    // El backend distingue: tokens de admin solo traen user_id; los de cajero traen empleado_id.
    isCashierToken: (state) => {
      const payload = decodeJwtPayload(state.accessToken);
      return !!payload?.empleado_id;
    },
    // true si el JWT es de administrador (email+password, sin empleado_id).
    isAdminToken() {
      return !!this.accessToken && !this.isCashierToken;
    },

    // Flags de acceso por módulo (de /pos/access), usados por el sidebar de
    // Settings y los guards de ruta para mostrar/ocultar secciones de admin.
    // La seguridad real la aplica el backend (CheckModuleAccess); esto es UI.
    accessFlags: (state) => state.selectedStore?.access || {},
    canBilling() { return !!this.accessFlags.billing; },
    canStoreInfo() { return !!this.accessFlags.storeInfo; },
    canPreferences() { return !!this.accessFlags.preferences; },
    canReports() { return !!this.accessFlags.reports; },
    canBrands() { return !!this.accessFlags.brands; },
    canCategories() { return !!this.accessFlags.categories; },
    canPaymentMethods() { return !!this.accessFlags.paymentMethods; },
    canBranchStock() { return !!this.accessFlags.branchStock; },
    canNetsuite() {
      return !!this.accessFlags.netsuite || !!this.selectedStore?.netsuite_enabled;
    },

    // Estado de facturación electrónica (de /billing/status), usado para
    // decidir el botón "Emitir comprobante" en TicketModal y SaleDetail.
    billingStatus: (state) => state.selectedStore?.billing || {},
    // Hay proveedor (Nubefact/Bizlinks/Datil) configurado.
    hasBillingProvider() { return !!this.billingStatus.provider_configured; },
    // La facturación está delegada al ERP (NetSuite emite por su sync).
    isBillingDelegated() { return !!this.billingStatus.delegated; },
    // Emisión automática al confirmar el pago (sw_bloqueado=0).
    isBillingAutomatic() { return !!this.billingStatus.auto_emission; },
    // Emisión manual: hay proveedor, no es automática y no está delegada.
    // Solo en este caso el cajero debe emitir el comprobante con el botón.
    isBillingManual() {
      return this.hasBillingProvider && !this.isBillingAutomatic && !this.isBillingDelegated;
    },
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.login({ email, password });

        if (response.success) {
          const { access_token, refresh_token, user } = response.data;

          this.accessToken = access_token;
          this.refreshToken = refresh_token;

          // TEMPORAL: Forzar rol de administrador para todos los usuarios en el POS
          // Los roles del API/backoffice aún no están sincronizados con el POS
          this.user = {
            ...user,
            role: 'administrador'
          };

          // Persist session data
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(this.user));

          // Obtener las tiendas del usuario
          await this.fetchStores();

          // Si solo tiene una tienda, seleccionarla automáticamente
          if (this.stores.length === 1) {
            await this.selectStore(this.stores[0].id);
            // Redirigir al menú principal
            router.push('/menu');
          }
          // Si tiene múltiples tiendas, el selector se mostrará desde Login.vue
        } else {
          this.error = response.message || 'Error de autenticación';
          throw new Error(this.error);
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error de autenticación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStores() {
      try {
        const response = await authApi.getStores();
        if (response.success) {
          this.stores = response.data;
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    },

    async selectStore(storeId) {
      try {
        const response = await authApi.selectStore(storeId);
        if (response.success) {
          const { access_token } = response.data;

          // Actualizar el token con permisos de tienda
          this.accessToken = access_token;
          localStorage.setItem('access_token', access_token);

          // Validar que la tienda tenga mod_pos habilitado.
          // Si no, abortar el login con error claro y limpiar sesión.
          // La respuesta trae además los flags por módulo (facturación, marcas,
          // reportes, etc.) que el POS usa para mostrar/ocultar secciones de admin.
          const access = await this.assertPosAccess();

          // Guardar la tienda seleccionada, fusionando los flags de acceso del
          // backend bajo `access` (consumidos por los getters can*).
          const store = {
            ...this.stores.find(s => s.id === storeId),
            netsuite_enabled: !!access?.netsuite_enabled,
            access: normalizeAccessFlags(access),
          };
          this.selectedStore = store;
          localStorage.setItem('selected_store', JSON.stringify(store));

          // Resolver el modo de facturación (auto/manual/delegada) en background.
          await this.fetchBillingStatus();

          // Limpiar turno de caja al cambiar de tienda para evitar
          // contaminación cross-tenant de movimientos de caja
          const { useShiftStore } = await import('./shift');
          const shiftStore = useShiftStore();
          shiftStore.clearActiveShift();

          // Limpiar cache de formas de pago (es por tienda).
          const { usePaymentMethodsStore } = await import('./paymentMethods');
          usePaymentMethodsStore().reset();
        }
      } catch (error) {
        console.error('Error selecting store:', error);
        throw error;
      }
    },

    // Auto-login tras el registro self-service. Recibe el token ya scopeado a
    // la tienda nueva (store_id en el JWT), así que NO pasa por el selector de
    // tienda. Persiste sesión, resuelve flags de acceso y entra al POS.
    async loginWithRegistration({ access_token, user, store }) {
      this.accessToken = access_token;
      localStorage.setItem('access_token', access_token);

      this.user = { ...(user || {}), role: 'administrador' };
      localStorage.setItem('user', JSON.stringify(this.user));

      // Resolver flags de /pos/access (usa el token recién emitido).
      let access = {};
      try {
        access = await this.assertPosAccess();
      } catch (e) {
        // Una tienda recién creada en plan PDV siempre tiene mod_pos; si falla
        // por red, seguimos con flags vacíos (fail-open en la UI).
        console.warn('⚠️ [AUTH] No se pudieron resolver flags tras registro:', e?.message);
      }

      const selected = {
        id: Number(store?.id),
        name: store?.name,
        slug: store?.slug,
        netsuite_enabled: !!access?.netsuite_enabled,
        access: normalizeAccessFlags(access),
      };
      this.selectedStore = selected;
      this.stores = [selected];
      localStorage.setItem('selected_store', JSON.stringify(selected));

      await this.fetchBillingStatus();

      router.push('/menu');
    },

    // Resuelve el modo de facturación electrónica (/billing/status) y lo
    // persiste en selectedStore.billing. Non-blocking: si falla (red/500) se
    // deja sin estado y los getters caen a manual=false (botón oculto), sin
    // romper la sesión. Lo consumen TicketModal y SaleDetail.
    async fetchBillingStatus() {
      if (!this.accessToken || !this.selectedStore) return;
      try {
        const response = await billingApi.getStatus();
        const billing = response?.data ?? response ?? {};
        const store = { ...this.selectedStore, billing };
        this.selectedStore = store;
        localStorage.setItem('selected_store', JSON.stringify(store));
      } catch (error) {
        console.warn('⚠️ [AUTH] No se pudo resolver el estado de facturación:', error?.message);
      }
    },

    // Lanza un error si la tienda autenticada no tiene mod_pos habilitado.
    // El llamador debe hacer logout o redirigir al login.
    // Devuelve el `data` de la respuesta (incluye pos_enabled, plan, netsuite_enabled).
    async assertPosAccess() {
      try {
        const response = await authApi.checkPosAccess();
        return response?.data ?? {};
      } catch (error) {
        if (error.response?.status === 403) {
          const message = error.response?.data?.message
            || 'Esta tienda no tiene el Punto de Venta habilitado. Contacta a soporte para activarlo.';
          // Limpiar token de tienda antes de propagar; el caller decide la UX.
          this.accessToken = null;
          localStorage.removeItem('access_token');
          const err = new Error(message);
          err.posAccessDenied = true;
          throw err;
        }
        // Otros errores (red, 500, etc.) los propagamos tal cual.
        throw error;
      }
    },

    // Refresca los flags de acceso por módulo desde /pos/access y los
    // persiste en selectedStore.access. Si la tienda perdió mod_pos (403),
    // assertPosAccess lanza posAccessDenied y hacemos logout. Otros errores
    // (red/500) se ignoran para no romper una sesión válida al recargar.
    async refreshAccessFlags() {
      if (!this.accessToken || !this.selectedStore) return;
      try {
        const access = await this.assertPosAccess();
        const store = {
          ...this.selectedStore,
          netsuite_enabled: !!access?.netsuite_enabled,
          access: normalizeAccessFlags(access),
        };
        this.selectedStore = store;
        localStorage.setItem('selected_store', JSON.stringify(store));

        // Refrescar también el modo de facturación al restaurar la sesión.
        await this.fetchBillingStatus();
      } catch (error) {
        if (error?.posAccessDenied) {
          await this.logout();
          throw error;
        }
        console.warn('⚠️ [AUTH] No se pudieron refrescar los flags de acceso:', error?.message);
      }
    },

    async fetchUserProfile() {
      if (!this.accessToken) return;

      try {
        const response = await authApi.getProfile();
        if (response.success) {
          // Preservar campos importantes del user actual si existen
          const currentName = this.user?.name;
          const currentEmail = this.user?.email;

          // TEMPORAL: Forzar rol de administrador
          this.user = {
            ...response.data,
            // Preservar name y email si el API no los retorna
            name: response.data.name || currentName || response.data.user?.name || 'Usuario',
            email: response.data.email || currentEmail || response.data.user?.email,
            role: 'administrador'
          };

          console.log('👤 [AUTH] User profile updated:', {
            name: this.user.name,
            email: this.user.email,
            role: this.user.role
          });

          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // No hacer logout si solo falla el perfil, mantener sesión
        console.warn('⚠️ [AUTH] Keeping session despite profile fetch error');
      }
    },

    async logout() {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Limpiar sesión de usuario administrador
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.selectedStore = null;
        this.stores = [];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('selected_store');

        // Limpiar sesión de cajero
        const { useCashierStore } = await import('./cashier');
        const cashierStore = useCashierStore();
        cashierStore.logout();

        // Limpiar sesión de turno de caja
        const { useShiftStore } = await import('./shift');
        const shiftStore = useShiftStore();
        shiftStore.clearActiveShift();

        // Limpiar carrito de compras
        const { useCartStore } = await import('./cart');
        const cartStore = useCartStore();
        cartStore.reset();

        // Limpiar ventas guardadas
        const { useSavedSalesStore } = await import('./savedSales');
        const savedSalesStore = useSavedSalesStore();
        savedSalesStore.clearAll();

        // Limpiar cache de formas de pago
        const { usePaymentMethodsStore } = await import('./paymentMethods');
        usePaymentMethodsStore().reset();

        console.log('✅ [AUTH] Logout completo - todas las sesiones limpiadas');
        router.push('/cashier-login');
      }
    },

    // Verificar y restaurar sesión
    async checkSession() {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUser = getStoredUser();
      const storedStore = JSON.parse(localStorage.getItem('selected_store') || 'null');

      console.log('🔍 [AUTH] checkSession - stored data:', {
        hasToken: !!accessToken,
        storedUser,
        storedStore
      });

      if (!accessToken || !refreshToken) {
        // Sin sesión: limpiar estado SIN redirigir. Antes llamaba a logout(),
        // que hace router.push('/cashier-login') y expulsaba al visitante de las
        // páginas públicas (/register, /forgot-password, /login). El guard del
        // router ya redirige las rutas protegidas a /cashier-login si hace falta.
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.selectedStore = null;
        this.stores = [];
        return false;
      }

      // Restaurar sesión desde localStorage
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = storedUser;
      this.selectedStore = storedStore;

      console.log('🔄 [AUTH] Session restored from localStorage:', {
        userName: this.user?.name,
        userEmail: this.user?.email,
        storeName: this.selectedStore?.name
      });

      try {
        // Actualizar datos del servidor (en background)
        console.log('📡 [AUTH] Fetching fresh data from server...');
        await this.fetchUserProfile();
        await this.fetchStores();
        await this.refreshAccessFlags();

        console.log('✅ [AUTH] Session check complete:', {
          userName: this.user?.name,
          storeName: this.selectedStore?.name
        });

        return true;
      } catch (error) {
        console.error('❌ [AUTH] Error checking session:', error);
        // No hacer logout, mantener sesión con datos de localStorage
        return true;
      }
    }
  },
});
