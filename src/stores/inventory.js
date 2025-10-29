import { defineStore } from 'pinia';
import { inventoryApi } from '../services/inventoryApi';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: [],
    currentProduct: null,
    filters: {
      search: '',
      category_id: null,
      brand_id: null,
      stock_status: 'all', // 'all', 'in_stock', 'low_stock', 'out_of_stock'
      published: true, // Por defecto solo productos publicados en POS
      page: 1,
      limit: 20
    },
    meta: {
      total: 0,
      totalPages: 0,
      hasMore: false
    },
    stats: {
      total_products: 0,
      total_inventory_value: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      in_stock_count: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Productos con stock bajo
     */
    lowStockProducts: (state) => {
      return state.products.filter(p => !p.unlimited_stock && p.stock > 0 && p.stock <= p.min_stock);
    },

    /**
     * Productos sin stock
     */
    outOfStockProducts: (state) => {
      return state.products.filter(p => !p.unlimited_stock && p.stock === 0);
    },

    /**
     * Productos con stock normal
     */
    inStockProducts: (state) => {
      return state.products.filter(p => p.unlimited_stock || p.stock > p.min_stock);
    },

    /**
     * Total de páginas
     */
    totalPages: (state) => state.meta.totalPages,

    /**
     * Página actual
     */
    currentPage: (state) => state.filters.page,

    /**
     * ¿Hay más productos para cargar?
     */
    hasMoreProducts: (state) => state.meta.hasMore
  },

  actions: {
    /**
     * Cargar productos con filtros
     */
    async loadProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryApi.getProducts(this.filters);

        if (response.success) {
          this.products = response.data;
          this.meta = response.meta;
        } else {
          this.error = 'Error al cargar productos';
          this.products = [];
        }
      } catch (error) {
        console.error('Error loading products:', error);
        this.error = error.message || 'Error al cargar productos';
        this.products = [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar detalle de un producto
     */
    async loadProduct(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryApi.getProduct(id);

        if (response.success) {
          this.currentProduct = response.data;
          return response.data;
        } else {
          this.error = response.message || 'Producto no encontrado';
          this.currentProduct = null;
          return null;
        }
      } catch (error) {
        console.error('Error loading product:', error);
        this.error = error.message || 'Error al cargar producto';
        this.currentProduct = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar stock de un producto
     */
    async updateStock(productId, newStock) {
      try {
        const response = await inventoryApi.updateStock(productId, newStock);

        if (response.success) {
          // Actualizar en el estado local
          const productIndex = this.products.findIndex(p => p.id === productId);
          if (productIndex !== -1) {
            this.products[productIndex].stock = newStock;
          }

          if (this.currentProduct && this.currentProduct.id === productId) {
            this.currentProduct.stock = newStock;
          }

          return { success: true };
        }

        return { success: false, message: 'Error al actualizar stock' };
      } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, message: error.message || 'Error al actualizar stock' };
      }
    },

    /**
     * Actualizar precio de un producto
     */
    async updatePrice(productId, newPrice) {
      try {
        const response = await inventoryApi.updatePrice(productId, newPrice);

        if (response.success) {
          // Actualizar en el estado local
          const productIndex = this.products.findIndex(p => p.id === productId);
          if (productIndex !== -1) {
            this.products[productIndex].price = newPrice;
          }

          if (this.currentProduct && this.currentProduct.id === productId) {
            this.currentProduct.price = newPrice;
          }

          return { success: true };
        }

        return { success: false, message: 'Error al actualizar precio' };
      } catch (error) {
        console.error('Error updating price:', error);
        return { success: false, message: error.message || 'Error al actualizar precio' };
      }
    },

    /**
     * Actualización rápida de precio y stock
     */
    async quickUpdate(productId, data) {
      try {
        const response = await inventoryApi.quickUpdate(productId, data);

        if (response.success) {
          // Actualizar en el estado local
          const productIndex = this.products.findIndex(p => p.id === productId);
          if (productIndex !== -1) {
            if (data.price !== undefined) {
              this.products[productIndex].price = data.price;
            }
            if (data.stock !== undefined) {
              this.products[productIndex].stock = data.stock;
            }
          }

          if (this.currentProduct && this.currentProduct.id === productId) {
            if (data.price !== undefined) {
              this.currentProduct.price = data.price;
            }
            if (data.stock !== undefined) {
              this.currentProduct.stock = data.stock;
            }
          }

          return { success: true, message: response.message };
        }

        return { success: false, message: 'Error al actualizar producto' };
      } catch (error) {
        console.error('Error in quick update:', error);
        return { success: false, message: error.message || 'Error al actualizar producto' };
      }
    },

    /**
     * Cargar estadísticas del inventario
     */
    async loadStats() {
      try {
        const response = await inventoryApi.getStats();

        if (response.success) {
          this.stats = response.data;
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },

    /**
     * Actualizar filtros
     */
    setFilter(filterName, value) {
      this.filters[filterName] = value;
      // Resetear a página 1 cuando cambian los filtros (excepto la página misma)
      if (filterName !== 'page') {
        this.filters.page = 1;
      }
    },

    /**
     * Resetear filtros
     */
    resetFilters() {
      this.filters = {
        search: '',
        category_id: null,
        brand_id: null,
        stock_status: 'all',
        published: true, // Mantener solo productos publicados en POS
        page: 1,
        limit: 20
      };
    },

    /**
     * Cambiar página
     */
    setPage(page) {
      this.filters.page = page;
    },

    /**
     * Página siguiente
     */
    nextPage() {
      if (this.meta.hasMore) {
        this.filters.page++;
      }
    },

    /**
     * Página anterior
     */
    prevPage() {
      if (this.filters.page > 1) {
        this.filters.page--;
      }
    }
  }
});
