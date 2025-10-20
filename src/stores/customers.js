import { defineStore } from 'pinia';
import { customersApi } from '../services/customersApi';

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [],
    currentCustomer: null,
    filters: {
      search: '',
      verified: null,
      blocked: null,
      page: 1,
      limit: 20
    },
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
      totalPages: 0,
      hasMore: false
    },
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Total de clientes
     */
    totalCustomers: (state) => state.pagination.total,

    /**
     * Página actual
     */
    currentPage: (state) => state.pagination.page,

    /**
     * Total de páginas
     */
    totalPages: (state) => state.pagination.totalPages,

    /**
     * ¿Hay más clientes para cargar?
     */
    hasMoreCustomers: (state) => state.pagination.hasMore,

    /**
     * Clientes verificados
     */
    verifiedCustomers: (state) => {
      return state.customers.filter(c => c.verified === true);
    },

    /**
     * Clientes bloqueados
     */
    blockedCustomers: (state) => {
      return state.customers.filter(c => c.blocked === true);
    }
  },

  actions: {
    /**
     * Cargar clientes con filtros
     */
    async loadCustomers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await customersApi.getCustomers(this.filters);

        if (response.success) {
          this.customers = response.data;
          this.pagination = response.pagination || {
            page: this.filters.page,
            perPage: this.filters.limit,
            total: response.data.length,
            totalPages: Math.ceil(response.data.length / this.filters.limit),
            hasMore: false
          };
        } else {
          this.error = response.error || 'Error al cargar clientes';
          this.customers = [];
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        this.error = error.message || 'Error al cargar clientes';
        this.customers = [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar más clientes (infinite scroll)
     */
    async loadMoreCustomers() {
      if (!this.pagination.hasMore || this.loading) {
        return;
      }

      this.filters.page++;
      this.loading = true;

      try {
        const response = await customersApi.getCustomers(this.filters);

        if (response.success) {
          // Agregar nuevos clientes a la lista existente
          this.customers = [...this.customers, ...response.data];
          this.pagination = response.pagination || this.pagination;
        }
      } catch (error) {
        console.error('Error loading more customers:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar detalle de un cliente
     */
    async loadCustomer(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await customersApi.getCustomer(id);

        if (response.success) {
          this.currentCustomer = response.data;
          return response.data;
        } else {
          this.error = response.error || 'Cliente no encontrado';
          this.currentCustomer = null;
          return null;
        }
      } catch (error) {
        console.error('Error loading customer:', error);
        this.error = error.message || 'Error al cargar cliente';
        this.currentCustomer = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar cliente por documento
     */
    async searchByDocument(documentNumber, documentType = null) {
      try {
        const response = await customersApi.searchByDocument(documentNumber, documentType);
        return response;
      } catch (error) {
        console.error('Error searching customer by document:', error);
        return {
          success: false,
          found: false,
          error: error.message || 'Error al buscar cliente'
        };
      }
    },

    /**
     * Consultar documento en Decolecta (RENIEC/SUNAT)
     */
    async lookupDocument(documentNumber, type = 'dni') {
      try {
        const response = await customersApi.lookupDocument(documentNumber, type);
        return response;
      } catch (error) {
        console.error('Error looking up document:', error);
        return {
          success: false,
          error: error.message || 'Error al consultar documento'
        };
      }
    },

    /**
     * Crear nuevo cliente
     */
    async createCustomer(customerData) {
      try {
        const response = await customersApi.createCustomer(customerData);

        if (response.success) {
          // Agregar el nuevo cliente al inicio de la lista
          this.customers.unshift(response.data);
          this.pagination.total++;
          return { success: true, data: response.data };
        }

        return { success: false, error: response.error || 'Error al crear cliente' };
      } catch (error) {
        console.error('Error creating customer:', error);
        return { success: false, error: error.message || 'Error al crear cliente' };
      }
    },

    /**
     * Actualizar cliente
     */
    async updateCustomer(id, customerData) {
      try {
        const response = await customersApi.updateCustomer(id, customerData);

        if (response.success) {
          // Actualizar en el estado local
          const customerIndex = this.customers.findIndex(c => c.id === id);
          if (customerIndex !== -1) {
            this.customers[customerIndex] = { ...this.customers[customerIndex], ...response.data };
          }

          if (this.currentCustomer && this.currentCustomer.id === id) {
            this.currentCustomer = { ...this.currentCustomer, ...response.data };
          }

          return { success: true, data: response.data };
        }

        return { success: false, error: response.error || 'Error al actualizar cliente' };
      } catch (error) {
        console.error('Error updating customer:', error);
        return { success: false, error: error.message || 'Error al actualizar cliente' };
      }
    },

    /**
     * Eliminar cliente
     */
    async deleteCustomer(id) {
      try {
        const response = await customersApi.deleteCustomer(id);

        if (response.success) {
          // Eliminar del estado local
          this.customers = this.customers.filter(c => c.id !== id);
          this.pagination.total--;

          if (this.currentCustomer && this.currentCustomer.id === id) {
            this.currentCustomer = null;
          }

          return { success: true };
        }

        return { success: false, error: response.error || 'Error al eliminar cliente' };
      } catch (error) {
        console.error('Error deleting customer:', error);
        return { success: false, error: error.message || 'Error al eliminar cliente' };
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
        verified: null,
        blocked: null,
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
      if (this.pagination.hasMore) {
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
