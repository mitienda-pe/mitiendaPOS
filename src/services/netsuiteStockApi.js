import apiClient from './axios';
import { useShiftStore } from '../stores/shift';

// Sucursal del turno activo. Se envía al backend como tiendadireccion_id para
// que NetSuite consulte stock de la ubicación correcta en tiendas multi-sucursal.
const getActiveTiendadireccionId = () => {
  try {
    const shiftStore = useShiftStore();
    const id = shiftStore.activeShift?.tiendadireccion_id;
    return id ? Number(id) : null;
  } catch (e) {
    return null;
  }
};

/**
 * NetSuite Stock API Service
 *
 * Endpoints para consultar y sincronizar stock de productos con NetSuite.
 * Estos endpoints son utilizados por el POS para validar stock antes de
 * completar una venta cuando la tienda tiene habilitada la validación de stock.
 */
export const netsuiteStockApi = {
  /**
   * Consultar stock de un producto específico en NetSuite
   *
   * @param {number} productId - ID del producto en mitienda
   * @returns {Promise<Object>} Respuesta con stock disponible en NetSuite
   *
   * Response format:
   * {
   *   success: true,
   *   data: {
   *     product_id: 123,
   *     sku: "PROD-001",
   *     netsuite_stock: 45,
   *     local_stock: 42,
   *     inventory_number_id: "98765"
   *   }
   * }
   */
  async getProductStock(productId) {
    try {
      const tiendadireccionId = getActiveTiendadireccionId();
      console.log(`🔍 [netsuiteStockApi] Querying NetSuite stock for product ${productId} (sucursal: ${tiendadireccionId ?? 'default'})`);
      const params = tiendadireccionId ? { params: { tiendadireccion_id: tiendadireccionId } } : {};
      const response = await apiClient.get(`/products/${productId}/netsuite-stock`, params);
      console.log('✅ [netsuiteStockApi] Stock received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error getting NetSuite stock:', error);
      console.error('❌ [netsuiteStockApi] Error response:', error.response?.data);

      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  /**
   * Sincronizar stock de un producto desde NetSuite a la base de datos local
   *
   * @param {number} productId - ID del producto a sincronizar
   * @returns {Promise<Object>} Resultado de la sincronización
   *
   * Response format:
   * {
   *   success: true,
   *   message: "Stock sincronizado correctamente",
   *   data: {
   *     product_id: 123,
   *     sku: "PROD-001",
   *     previous_stock: 42,
   *     current_stock: 45,
   *     difference: 3
   *   }
   * }
   */
  async syncProductStock(productId) {
    try {
      const tiendadireccionId = getActiveTiendadireccionId();
      console.log(`🔄 [netsuiteStockApi] Syncing stock for product ${productId} (sucursal: ${tiendadireccionId ?? 'default'})`);
      const url = tiendadireccionId
        ? `/products/${productId}/sync-stock?tiendadireccion_id=${tiendadireccionId}`
        : `/products/${productId}/sync-stock`;
      const response = await apiClient.post(url);
      console.log('✅ [netsuiteStockApi] Stock synced:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error syncing stock:', error);
      console.error('❌ [netsuiteStockApi] Error response:', error.response?.data);

      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  /**
   * Sincronizar stock de múltiples productos en lote
   *
   * @param {Array<number>} productIds - Array de IDs de productos (máximo 50)
   * @returns {Promise<Object>} Resultado de la sincronización en lote
   *
   * Response format:
   * {
   *   success: true,
   *   message: "Stock sincronizado para 3 productos",
   *   data: {
   *     synced_count: 3,
   *     stock_levels: {
   *       123: 45,
   *       124: 30,
   *       125: 0
   *     }
   *   }
   * }
   */
  async syncStockBatch(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('productIds debe ser un array con al menos un ID');
      }

      if (productIds.length > 50) {
        throw new Error('Máximo 50 productos por lote');
      }

      const tiendadireccionId = getActiveTiendadireccionId();
      console.log(`🔄 [netsuiteStockApi] Syncing stock for ${productIds.length} products (sucursal: ${tiendadireccionId ?? 'default'})`);
      const payload = { product_ids: productIds };
      if (tiendadireccionId) payload.tiendadireccion_id = tiendadireccionId;
      const response = await apiClient.post('/products/sync-stock-batch', payload);
      console.log('✅ [netsuiteStockApi] Batch sync completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error in batch sync:', error);
      console.error('❌ [netsuiteStockApi] Error response:', error.response?.data);

      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  /**
   * Sincronizar stock de TODA la tienda desde NetSuite (equivale a `php spark sync:stock`).
   * Long-running: ~30-90s. El backend extiende el timeout PHP a 10 min.
   *
   * @param {boolean} dryRun
   * @returns {Promise<Object>}
   */
  async syncTiendaStock(dryRun = false) {
    try {
      const url = `/tienda/sync-stock${dryRun ? '?dry_run=1' : ''}`;
      const response = await apiClient.post(url, {}, { timeout: 600000 });
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error syncTiendaStock:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  /**
   * Sincronizar precios de TODA la tienda desde NetSuite (equivale a `php spark sync:prices`).
   * Long-running: ~60-120s. Backend extiende timeout PHP a 15 min.
   *
   * @param {boolean} dryRun
   * @returns {Promise<Object>}
   */
  async syncTiendaPrices(dryRun = false) {
    try {
      const url = `/tienda/sync-prices${dryRun ? '?dry_run=1' : ''}`;
      const response = await apiClient.post(url, {}, { timeout: 900000 });
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error syncTiendaPrices:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  },

  /**
   * Importar productos NUEVOS desde NetSuite (equivale a `php spark netsuite:import-products`).
   * Aplica filtros multi-capa (itemtype + class + location + stock + precio).
   *
   * @param {boolean} dryRun  default true (devuelve preview, no escribe)
   * @param {number|null} limit opcional, tope al número de items a procesar
   * @returns {Promise<Object>}
   */
  async syncTiendaProducts(dryRun = true, limit = null) {
    try {
      const params = new URLSearchParams();
      params.append('dry_run', dryRun ? '1' : '0');
      if (limit && Number(limit) > 0) params.append('limit', String(limit));
      const url = `/tienda/sync-products?${params.toString()}`;
      const response = await apiClient.post(url, {}, { timeout: 600000 });
      return response.data;
    } catch (error) {
      console.error('❌ [netsuiteStockApi] Error syncTiendaProducts:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      }
      throw error;
    }
  }
};
