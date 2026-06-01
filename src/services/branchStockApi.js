import apiClient from './axios';
import { useShiftStore } from '../stores/shift';

/**
 * API de gestión NATIVA de stock por sucursal (solo planes Large/PDV sin ERP).
 * Endpoints backend: GET/PUT /branch-stock, POST /branch-stock/import.
 * La activación vive en el flag tiendageneral_sw_stock_nativo_sucursal de /store-config.
 */

const getActiveTiendadireccionId = () => {
  try {
    const shiftStore = useShiftStore();
    const id = shiftStore.activeShift?.tiendadireccion_id;
    return id ? Number(id) : null;
  } catch {
    return null;
  }
};

export const branchStockApi = {
  /** GET /branch-stock?tiendadireccion_id=&search=&page= */
  async list({ tiendadireccionId = null, search = '', page = 1 } = {}) {
    const branchId = tiendadireccionId ?? getActiveTiendadireccionId();
    const params = new URLSearchParams();
    if (branchId) params.append('tiendadireccion_id', String(branchId));
    if (search) params.append('search', search);
    if (page) params.append('page', String(page));

    const response = await apiClient.get(`/branch-stock?${params.toString()}`);
    const payload = response.data?.data ?? response.data ?? {};
    return {
      success: response.data?.success ?? true,
      items: payload.items ?? [],
      pagination: payload.pagination ?? { page: 1, per_page: 50, total_items: 0, total_pages: 0 },
    };
  },

  /** PUT /branch-stock — fija stock absoluto por sucursal de uno o varios productos */
  async save({ tiendadireccionId = null, items = [] } = {}) {
    const branchId = tiendadireccionId ?? getActiveTiendadireccionId();
    const response = await apiClient.put('/branch-stock', {
      tiendadireccion_id: branchId,
      items,
    });
    return response.data?.data ?? response.data;
  },

  /** POST /branch-stock/import — CSV (sku|producto_id, stock, variante_sku) */
  async importCsv(file, { tiendadireccionId = null } = {}) {
    const branchId = tiendadireccionId ?? getActiveTiendadireccionId();
    const formData = new FormData();
    formData.append('file', file);
    if (branchId) formData.append('tiendadireccion_id', String(branchId));
    const response = await apiClient.post('/branch-stock/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  /** GET /store-config — lee el flag de activación */
  async getActivation() {
    const response = await apiClient.get('/store-config');
    const cfg = response.data?.data ?? response.data ?? {};
    return { enabled: Number(cfg.tiendageneral_sw_stock_nativo_sucursal) === 1 };
  },

  /** PUT /store-config — activa/desactiva (el backend valida plan + no-NetSuite) */
  async setActivation(enabled) {
    const response = await apiClient.put('/store-config', {
      tiendageneral_sw_stock_nativo_sucursal: enabled ? 1 : 0,
    });
    const cfg = response.data?.data ?? response.data ?? {};
    return { enabled: Number(cfg.tiendageneral_sw_stock_nativo_sucursal) === 1 };
  },
};

export default branchStockApi;
