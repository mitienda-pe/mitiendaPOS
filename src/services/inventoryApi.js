import apiClient from './axios';

/**
 * API service para gestión de inventario
 * Reutiliza las funciones de productsApi pero con foco en gestión de inventario
 */
export const inventoryApi = {
  /**
   * Listar productos con filtros para inventario
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} Respuesta con productos y metadata
   */
  async getProducts(filters = {}) {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.brand_id) params.append('brand_id', filters.brand_id.toString());
    if (filters.published !== null && filters.published !== undefined) {
      params.append('published', filters.published ? '1' : '0');
    }
    if (filters.stock_status && filters.stock_status !== 'all') {
      params.append('stock_status', filters.stock_status);
    }

    const response = await apiClient.get(`/products?${params.toString()}`);
    console.log('🔍 [inventoryApi] Raw response:', response.data);

    const apiResponse = response.data;
    // Manejar ambos formatos: nuevo (con pagination) y legacy (array directo)
    const rawData = apiResponse.data || apiResponse;
    const paginationData = apiResponse.pagination;

    console.log('🔍 [inventoryApi] Raw data:', rawData);
    console.log('🔍 [inventoryApi] Pagination data:', paginationData);

    if (Array.isArray(rawData)) {
      return {
        success: true,
        data: rawData.map((product) => ({
          id: product.id,
          sku: product.sku || 'N/A',
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price || '0'),
          stock: parseInt(product.stock || '0'),
          min_stock: parseInt(product.min_stock || '5'), // Stock mínimo por defecto
          unlimited_stock: Boolean(product.unlimited_stock || product.unlimited_stock === 1),
          published: product.published || false,
          featured: product.featured || false,
          images: product.images || [],
          category: product.category || { name: 'Sin categoría' },
          brand: product.brand || null,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString()
        })),
        meta: paginationData ? {
          page: paginationData.page,
          limit: paginationData.perPage || paginationData.limit || 20,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
          hasMore: paginationData.hasMore
        } : {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: rawData.length,
          totalPages: Math.ceil(rawData.length / (filters.limit || 20)),
          hasMore: rawData.length >= (filters.limit || 20)
        }
      };
    }

    return {
      success: false,
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    };
  },

  /**
   * Obtener detalle de un producto
   * @param {number} id - ID del producto
   * @returns {Promise} Respuesta con detalle del producto
   */
  async getProduct(id) {
    const response = await apiClient.get(`/products/${id}`);
    const rawData = response.data?.data || response.data;

    if (rawData) {
      return {
        success: true,
        data: {
          id: rawData.id,
          sku: rawData.sku || 'N/A',
          name: rawData.name,
          description: rawData.description || '',
          price: parseFloat(rawData.price || '0'),
          stock: parseInt(rawData.stock || '0'),
          min_stock: parseInt(rawData.min_stock || '5'),
          unlimited_stock: Boolean(rawData.unlimited_stock || rawData.unlimited_stock === 1),
          published: rawData.published || false,
          featured: rawData.featured || false,
          images: rawData.images || [],
          category: rawData.category || { name: 'Sin categoría' },
          brand: rawData.brand || null,
          created_at: rawData.created_at || new Date().toISOString(),
          updated_at: rawData.updated_at || new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      data: null,
      message: 'Producto no encontrado'
    };
  },

  /**
   * Actualizar stock de un producto
   * @param {number} id - ID del producto
   * @param {number} stock - Nuevo stock
   * @returns {Promise} Respuesta de actualización
   */
  async updateStock(id, stock) {
    const response = await apiClient.put(`/products/${id}`, {
      stock: parseInt(stock)
    });
    return {
      success: true,
      data: response.data
    };
  },

  /**
   * Actualizar precio de un producto
   * @param {number} id - ID del producto
   * @param {number} price - Nuevo precio
   * @returns {Promise} Respuesta de actualización
   */
  async updatePrice(id, price) {
    const response = await apiClient.put(`/products/${id}`, {
      price: parseFloat(price)
    });
    return {
      success: true,
      data: response.data
    };
  },

  /**
   * Actualizar precio y stock simultáneamente (edición rápida)
   * @param {number} id - ID del producto
   * @param {Object} data - Datos a actualizar { price, stock }
   * @returns {Promise} Respuesta de actualización
   */
  async quickUpdate(id, data) {
    const payload = {};
    if (data.price !== undefined && data.price !== null) {
      payload.price = parseFloat(data.price);
    }
    if (data.stock !== undefined && data.stock !== null) {
      payload.stock = parseInt(data.stock);
    }

    const response = await apiClient.put(`/products/${id}`, payload);
    return {
      success: true,
      data: response.data,
      message: 'Producto actualizado correctamente'
    };
  },

  /**
   * Obtener estadísticas del inventario
   * @returns {Promise} Estadísticas del inventario
   */
  async getStats() {
    // Por ahora calculamos las estadísticas en el frontend
    // TODO: En el futuro, crear un endpoint en el backend para esto
    const response = await this.getProducts({ limit: 10000 });

    if (!response.success) {
      return {
        success: false,
        data: null
      };
    }

    const products = response.data;
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => !p.unlimited_stock && p.stock > 0 && p.stock <= p.min_stock).length;
    const outOfStock = products.filter(p => !p.unlimited_stock && p.stock === 0).length;
    const inStock = products.filter(p => p.unlimited_stock || p.stock > 0).length;

    return {
      success: true,
      data: {
        total_products: totalProducts,
        total_inventory_value: totalValue,
        low_stock_count: lowStock,
        out_of_stock_count: outOfStock,
        in_stock_count: inStock
      }
    };
  }
};
