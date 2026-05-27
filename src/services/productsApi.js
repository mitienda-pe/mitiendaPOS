import apiClient from './axios';
import { useShiftStore } from '../stores/shift';

// Sucursal del turno activo: se envía al backend como tiendadireccion_id
// para que el catálogo POS filtre por stock de esa sucursal y use
// producto_publicado_pos en lugar del flag de storefront.
const getActiveTiendadireccionId = () => {
  try {
    const shiftStore = useShiftStore();
    const id = shiftStore.activeShift?.tiendadireccion_id;
    return id ? Number(id) : null;
  } catch (e) {
    return null;
  }
};

// Feature flag: cuando es 'true' las búsquedas pasan al endpoint
// /products/search (Meilisearch). Rollout gradual: arrancar en una tienda
// piloto antes de habilitarlo global. Apagado por default.
const useMeiliSearch = () =>
  String(import.meta.env.VITE_USE_MEILI_SEARCH || '').toLowerCase() === 'true';

// Adapta la respuesta del endpoint /products/search al shape que ya
// consumen los componentes POS (camelCase del endpoint nuevo → snake_case del legacy).
const adaptMeiliHit = (hit) => ({
  id: hit.id,
  sku: hit.sku || '',
  name: hit.title || hit.name || '',
  description: '',
  price: parseFloat(hit.price || 0),
  original_price: hit.originalPrice != null ? parseFloat(hit.originalPrice) : null,
  promotion: null,
  stock: hit.stock || 0,
  unlimited_stock: hit.unlimitedStock === true,
  published: hit.published === true,
  featured: false,
  images: hit.image
    ? [{ id: 0, url: hit.image, thumbnail: hit.image, position: 0, is_main: true }]
    : [],
  category: hit.category || null,
  brand: hit.brand || null,
  barcode: hit.barcode || null,
  variants: Array.isArray(hit.variants) ? hit.variants : [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Construye los query params de /products/search a partir de filtros del POS.
const buildMeiliSearchParams = (filters, tiendadireccionId) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('q', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.page) {
    const offset = (Number(filters.page) - 1) * Number(filters.limit || 20);
    if (offset > 0) params.append('offset', String(offset));
  }
  if (filters.category_id) params.append('category_id', String(filters.category_id));
  if (filters.brand_id) params.append('brand_id', String(filters.brand_id));
  if (tiendadireccionId) params.append('tiendadireccion_id', String(tiendadireccionId));

  // El POS muestra todo el catálogo (con badges visuales).
  // Solo si el caller explícitamente pidió `published=1` o filtró stock,
  // restringimos.
  if (filters.published === true || filters.published === 1 || filters.published === '1') {
    params.append('include_unpublished', 'false');
  }
  if (filters.stock_status === 'in_stock') {
    params.append('include_out_of_stock', 'false');
  }

  return params;
};

export const productsApi = {
  // Listar productos con filtros y paginación
  async getProducts(filters = {}) {
    // Multi-sucursal: si hay turno activo, el backend filtra por stock de la sucursal
    const tiendadireccionId = filters.tiendadireccion_id ?? getActiveTiendadireccionId();

    // Cuando el feature flag está prendido y hay un texto de búsqueda activo,
    // pegamos al endpoint Meilisearch. Para listados sin texto seguimos usando
    // /products (que sigue siendo más eficiente para catálogos paginados sin q).
    if (useMeiliSearch() && filters.search) {
      const meiliParams = buildMeiliSearchParams(filters, tiendadireccionId);
      const meiliResponse = await apiClient.get(`/products/search?${meiliParams.toString()}`);
      const meiliBody = meiliResponse.data || {};
      const meiliHits = Array.isArray(meiliBody.data) ? meiliBody.data : [];
      const meiliPagination = meiliBody.pagination || {};

      return {
        success: true,
        data: meiliHits.map(adaptMeiliHit),
        meta: {
          page: meiliPagination.page || filters.page || 1,
          limit: meiliPagination.perPage || filters.limit || 20,
          total: meiliPagination.total || meiliHits.length,
          totalPages: meiliPagination.totalPages || 1,
          hasMore: meiliPagination.hasMore || false,
          source: meiliBody.meta?.source || 'meilisearch',
        },
      };
    }

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

    if (tiendadireccionId) {
      params.append('tiendadireccion_id', String(tiendadireccionId));
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
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            promotion: product.promotion || null,
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
        original_price: rawData.original_price ? parseFloat(rawData.original_price) : null,
        promotion: rawData.promotion || null,
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
    // Con Meilisearch usamos /products/search. El controller detecta automáticamente
    // si `code` es un barcode (8-14 dígitos) y rutea al filter exacto.
    if (useMeiliSearch()) {
      const tiendadireccionId = getActiveTiendadireccionId();
      const params = new URLSearchParams({ q: code, limit: '1' });
      if (tiendadireccionId) params.append('tiendadireccion_id', String(tiendadireccionId));

      const meiliResponse = await apiClient.get(`/products/search?${params.toString()}`);
      const meiliHits = meiliResponse.data?.data || [];

      if (meiliHits.length > 0) {
        return { success: true, data: adaptMeiliHit(meiliHits[0]) };
      }
      return { success: false, data: null, message: 'Producto no encontrado' };
    }

    const response = await apiClient.get(`/products?search=${encodeURIComponent(code)}`);
    const rawData = response.data;

    if (Array.isArray(rawData) && rawData.length > 0) {
      const product = rawData[0];

      // Normalizar el producto igual que en getProducts y getProduct
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
        success: true,
        data: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price || '0'),
          original_price: product.original_price ? parseFloat(product.original_price) : null,
          promotion: product.promotion || null,
          stock: product.stock || 0,
          unlimited_stock: product.unlimited_stock === true || product.unlimited_stock === 1,
          published: product.published || false,
          featured: product.featured || false,
          images,
          category: product.category || null,
          brand: product.brand || null,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      data: null,
      message: 'Producto no encontrado'
    };
  }
};
