import apiClient from './axios';

// Servicio de catálogo: marcas y categorías. Reusa los endpoints del backoffice
// (/brands, /categories), protegidos por auth + moduleaccess (mod_marcas /
// mod_categorias). Estos endpoints devuelven datos sin envoltura {error,data},
// así que se leen directo de response.data.
export const catalogApi = {
  // ─── Marcas ───

  // GET /brands → array de marcas (cada una con product_count).
  async getBrands() {
    const response = await apiClient.get('/brands');
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  // POST /brands → { name, slug? }.
  async createBrand(payload) {
    const response = await apiClient.post('/brands', payload);
    return response.data;
  },

  // PUT /brands/:id → { name, slug? }.
  async updateBrand(id, payload) {
    const response = await apiClient.put(`/brands/${id}`, payload);
    return response.data;
  },

  // DELETE /brands/:id
  async deleteBrand(id) {
    const response = await apiClient.delete(`/brands/${id}`);
    return response.data;
  },

  // ─── Categorías ───

  // GET /categories → árbol (nodos con `sub`).
  async getCategories() {
    const response = await apiClient.get('/categories');
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  // POST /categories → { name, parent_id?, order? }.
  async createCategory(payload) {
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },

  // PUT /categories/:id → { name, parent_id?, order? }.
  async updateCategory(id, payload) {
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data;
  },

  // DELETE /categories/:id
  async deleteCategory(id) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
