import apiClient from './axios';

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
      console.log(`🔍 [netsuiteStockApi] Querying NetSuite stock for product ${productId}`);
      const response = await apiClient.get(`/products/${productId}/netsuite-stock`);
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
      console.log(`🔄 [netsuiteStockApi] Syncing stock for product ${productId}`);
      const response = await apiClient.post(`/products/${productId}/sync-stock`);
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

      console.log(`🔄 [netsuiteStockApi] Syncing stock for ${productIds.length} products`);
      const response = await apiClient.post('/products/sync-stock-batch', {
        product_ids: productIds
      });
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
  }
};
