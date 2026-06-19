import apiClient from './axios';
import { useShiftStore } from '../stores/shift';

// Sucursal del turno activo: se envía al backend como tiendadireccion_id para
// que /products devuelva el stock de la sucursal (productos_stock_sucursal) en
// lugar del agregado. Sin esto el inventario muestra el total cadena pero la
// validación POS consulta NetSuite por sucursal y bloquea ventas.
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
    if (filters.sort_by) {
      params.append('sort_by', filters.sort_by);
      params.append('sort_dir', filters.sort_dir || 'asc');
    }
    const tiendadireccionId = filters.tiendadireccion_id ?? getActiveTiendadireccionId();
    if (tiendadireccionId) {
      params.append('tiendadireccion_id', String(tiendadireccionId));
    }

    const response = await apiClient.get(`/products?${params.toString()}`);

    // Después del axios interceptor, response.data tiene estructura: { success, data, pagination }
    const normalizedResponse = response.data;

    // El array de productos está en normalizedResponse.data
    const productsArray = normalizedResponse.data;
    const paginationData = normalizedResponse.pagination;

    if (Array.isArray(productsArray)) {
      return {
        success: true,
        data: productsArray.map((product) => ({
          id: product.id,
          sku: product.sku || 'N/A',
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price || '0'),
          stock: parseInt(product.stock || '0'),
          min_stock: parseInt(product.min_stock || '5'), // Stock mínimo por defecto
          unlimited_stock: product.unlimited_stock === true || product.unlimited_stock === 1,
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
          total: productsArray.length,
          totalPages: Math.ceil(productsArray.length / (filters.limit || 20)),
          hasMore: productsArray.length >= (filters.limit || 20)
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
          unlimited_stock: rawData.unlimited_stock === true || rawData.unlimited_stock === 1,
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
  },

  /**
   * Crear un producto (formulario mínimo POS)
   * @param {Object} data - { name, sku, barcode, price, stock, unlimited_stock, categories, published }
   * @returns {Promise} { success, data: { id, ... }, message }
   */
  async createProduct(data) {
    const payload = {
      name: data.name,
      price: data.price !== undefined && data.price !== null ? parseFloat(data.price) : 0,
      published: data.published ? true : false
    };
    if (data.sku) payload.sku = data.sku;
    if (data.barcode) payload.barcode = data.barcode;
    if (data.cost !== undefined && data.cost !== null && data.cost !== '') {
      payload.cost = parseFloat(data.cost);
    }
    if (data.unlimited_stock) {
      payload.unlimited_stock = true;
    } else if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
      payload.stock = parseInt(data.stock);
    }
    if (Array.isArray(data.categories) && data.categories.length) {
      payload.categories = data.categories.map((id) => parseInt(id));
    }

    const response = await apiClient.post('/products', payload);
    // El interceptor normaliza { error:0, data:{...} } -> { success, data:{...} }
    const created = response.data?.data ?? response.data;
    return {
      success: true,
      data: created,
      message: 'Producto creado correctamente'
    };
  },

  /**
   * Autocompletado del catálogo maestro de productos peruanos.
   * Sugiere productos del catálogo global que la tienda aún no tiene, para
   * acelerar el alta. El backend ya excluye los que la tienda posee.
   * @param {string} q - texto parcial del nombre (min 2 chars)
   * @param {number} limit - máximo de sugerencias (default 8)
   * @returns {Promise} { success, data: [{ catalogo_id, nombre, marca, categoria, precio_referencial, barcode }] }
   */
  async suggestFromCatalog(q, limit = 8) {
    const query = (q || '').trim();
    if (query.length < 2) {
      return { success: true, data: [] };
    }
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const response = await apiClient.get(`/products/catalog-suggest?${params.toString()}`);
    const data = response.data?.data ?? [];
    return { success: true, data: Array.isArray(data) ? data : [] };
  },

  /**
   * Subir imagen de un producto recién creado (multipart)
   * @param {number} id - ID del producto
   * @param {File} file - Archivo de imagen (jpg/png/webp, min 600x600, max 10MB)
   * @returns {Promise} { success, data }
   */
  async uploadProductImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/products/${id}/images`, formData, {
      // Dejar que el navegador fije el boundary del multipart; no forzar JSON.
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return {
      success: true,
      data: response.data?.data ?? response.data
    };
  },

  /**
   * Listar categorías de la tienda (árbol) y aplanarlas para un dropdown.
   * @returns {Promise} { success, data: [{ id, name }] }
   */
  async getCategories() {
    const response = await apiClient.get('/categories');
    // /categories responde un árbol (array directo, sin envoltura { error, data }).
    const tree = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);

    const flatten = (nodes, depth = 0) => {
      const out = [];
      for (const node of nodes || []) {
        out.push({
          id: node.tiendacategoria_id,
          name: `${'  '.repeat(depth)}${node.tiendacategoria_nombre}`
        });
        if (Array.isArray(node.sub) && node.sub.length) {
          out.push(...flatten(node.sub, depth + 1));
        }
      }
      return out;
    };

    return {
      success: true,
      data: flatten(tree)
    };
  },

  /**
   * Carga masiva de productos por CSV (alta/actualización por SKU).
   * @param {File} file - archivo CSV
   * @param {Object} opts - { tiendadireccionId, confirm }
   *   confirm=false → previsualización (no escribe); confirm=true → aplica.
   * @returns {Promise<{resumen, filas}>}
   */
  async importCatalog(file, { tiendadireccionId = null, confirm = false } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (tiendadireccionId) formData.append('tiendadireccion_id', String(tiendadireccionId));
    const url = `/products/import-catalog${confirm ? '?confirm=1' : ''}`;
    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  // ─── Lotes con vencimiento (perecibles) ────────────────────────

  /** Lista los lotes de un producto. */
  async getProductLots(productId, variantId = null) {
    const qs = variantId ? `?productoatributo_id=${variantId}` : '';
    const response = await apiClient.get(`/products/${productId}/lots${qs}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Registra un ingreso de lote.
   * @param {Object} lot - { productoatributo_id?, cantidad, fecha_vencimiento?, fecha_produccion?, codigo?, costo? }
   */
  async createLot(productId, lot) {
    const response = await apiClient.post(`/products/${productId}/lots`, lot);
    return response.data?.data ?? response.data;
  },

  /** Da de baja un lote por merma. */
  async bajaLot(loteId, motivo = null) {
    const response = await apiClient.post(`/lots/${loteId}/baja`, motivo ? { motivo } : {});
    return response.data?.data ?? response.data;
  },

  /** Kardex (movimientos) por lote de un producto. */
  async getProductKardex(productId, { loteId = null, page = 1 } = {}) {
    const qs = new URLSearchParams();
    if (loteId) qs.append('lote_id', String(loteId));
    if (page) qs.append('page', String(page));
    const response = await apiClient.get(`/products/${productId}/lots/kardex?${qs.toString()}`);
    return response.data?.data ?? response.data;
  }
};
