import apiClient from './axios';

export const productsApi = {
  // Listar productos con filtros y paginación
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

    const apiResponse = response.data;
    // Manejar ambos formatos: nuevo (con pagination) y legacy (array directo)
    const rawData = apiResponse.data || apiResponse;
    const paginationData = apiResponse.pagination;

    if (Array.isArray(rawData)) {
      return {
        success: true,
        data: rawData.map((product) => {
          // Normalizar imágenes: API devuelve array de strings (URLs completas)
          const images = (product.images || [])
            .filter((img) => {
              const url = typeof img === 'string' ? img : (img.url || img);
              return url && !url.includes('placeholder.com');
            })
            .map((img, index) => {
              if (typeof img === 'string') {
                return {
                  id: index,
                  url: img,
                  thumbnail: img,
                  position: index,
                  is_main: index === 0
                };
              }
              return {
                id: img.id || index,
                url: img.url || img,
                thumbnail: img.thumbnail || img.url || img,
                position: img.position || index,
                is_main: img.is_main || index === 0
              };
            });

          return {
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price || '0'),
            stock: product.stock || 0,
            unlimited_stock: product.unlimited_stock === true || product.unlimited_stock === 1,
            published: product.published || false,
            featured: product.featured || false,
            images,
            category: product.category || null,
            brand: product.brand || null,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString()
          };
        }),
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
          totalPages: 1,
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

  // Obtener detalle de un producto
  async getProduct(id) {
    const response = await apiClient.get(`/products/${id}`);
    const rawData = response.data?.data || response.data;

    if (rawData) {
      const images = (rawData.images || [])
        .filter((img) => {
          const url = typeof img === 'string' ? img : (img.url || img);
          return url && !url.includes('placeholder.com');
        })
        .map((img, index) => {
          if (typeof img === 'string') {
            return {
              id: index,
              url: img,
              thumbnail: img,
              position: index,
              is_main: index === 0
            };
          }
          return {
            id: img.id || index,
            url: img.url || img,
            thumbnail: img.thumbnail || img.url || img,
            position: img.position || index,
            is_main: img.is_main || index === 0
          };
        });

      const product = {
        id: rawData.id,
        sku: rawData.sku,
        name: rawData.name,
        description: rawData.description || '',
        price: parseFloat(rawData.price || '0'),
        stock: rawData.stock || 0,
        unlimited_stock: rawData.unlimited_stock === true || rawData.unlimited_stock === 1,
        published: rawData.published || false,
        featured: rawData.featured || false,
        images,
        category: rawData.category || null,
        brand: rawData.brand || null,
        created_at: rawData.created_at || new Date().toISOString(),
        updated_at: rawData.updated_at || new Date().toISOString()
      };

      return {
        success: true,
        data: product
      };
    }

    return {
      success: false,
      data: undefined
    };
  },

  // Actualizar stock de un producto (para el POS)
  async updateStock(id, newStock) {
    const response = await apiClient.put(`/products/${id}`, { stock: newStock });
    return response.data;
  },

  // Buscar productos por código de barras o SKU
  async searchByCode(code) {
    const response = await apiClient.get(`/products?search=${encodeURIComponent(code)}`);
    const rawData = response.data;

    if (Array.isArray(rawData) && rawData.length > 0) {
      return {
        success: true,
        data: rawData[0]
      };
    }

    return {
      success: false,
      data: null,
      message: 'Producto no encontrado'
    };
  }
};
