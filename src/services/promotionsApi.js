import apiClient from './axios';

/**
 * API para gestionar promociones (enfocado en Bonificaciones)
 */
export const promotionsApi = {
  /**
   * Obtener lista de promociones con filtros
   */
  async getPromotions(params = {}) {
    try {
      const response = await apiClient.get('/promotions', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error fetching promotions:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una promoción específica
   */
  async getPromotion(id) {
    try {
      const response = await apiClient.get(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error fetching promotion:', error);
      throw error;
    }
  },

  /**
   * Crear nueva promoción
   */
  async createPromotion(data) {
    try {
      const response = await apiClient.post('/promotions', data);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error creating promotion:', error);
      throw error;
    }
  },

  /**
   * Actualizar promoción
   */
  async updatePromotion(id, data) {
    try {
      const response = await apiClient.put(`/promotions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error updating promotion:', error);
      throw error;
    }
  },

  /**
   * Eliminar promoción
   */
  async deletePromotion(id) {
    try {
      const response = await apiClient.delete(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error deleting promotion:', error);
      throw error;
    }
  },

  /**
   * Obtener tipos de promociones
   */
  async getPromotionTypes() {
    try {
      const response = await apiClient.get('/promotions/types');
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error fetching promotion types:', error);
      throw error;
    }
  },

  /**
   * Obtener productos vinculados a una promoción
   */
  async getPromotionProducts(promotionId) {
    try {
      const response = await apiClient.get(`/promotions/${promotionId}/products`);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error fetching promotion products:', error);
      throw error;
    }
  },

  /**
   * Vincular productos a una promoción
   */
  async linkProducts(promotionId, data) {
    try {
      const response = await apiClient.post(`/promotions/${promotionId}/products`, data);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error linking products:', error);
      throw error;
    }
  },

  /**
   * Desvincular producto de una promoción
   */
  async unlinkProduct(promotionId, productId) {
    try {
      const response = await apiClient.delete(`/promotions/${promotionId}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error unlinking product:', error);
      throw error;
    }
  },

  /**
   * Obtener productos de bonificación vinculados a una promoción
   */
  async getPromotionBonifications(promotionId) {
    try {
      const response = await apiClient.get(`/promotions/${promotionId}/bonifications`);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error fetching bonification products:', error);
      throw error;
    }
  },

  /**
   * Vincular productos de bonificación a una promoción
   */
  async linkBonifications(promotionId, data) {
    try {
      const response = await apiClient.post(`/promotions/${promotionId}/bonifications`, data);
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error linking bonifications:', error);
      throw error;
    }
  },

  /**
   * Actualizar cantidad de un producto base
   */
  async updateProductQuantity(promotionId, productId, quantity) {
    try {
      const response = await apiClient.put(
        `/promotions/${promotionId}/products/${productId}`,
        { cantidad: quantity }
      );
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error updating product quantity:', error);
      throw error;
    }
  },

  /**
   * Actualizar cantidad de un producto de bonificación
   */
  async updateBonificationQuantity(promotionId, productId, attributeId, quantity) {
    try {
      const response = await apiClient.put(
        `/promotions/${promotionId}/bonifications/${productId}`,
        {
          atributo_id: attributeId,
          cantidad: quantity
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error updating bonification quantity:', error);
      throw error;
    }
  },

  /**
   * Desvincular producto de bonificación
   */
  async unlinkBonification(promotionId, productId, attributeId) {
    try {
      const response = await apiClient.delete(
        `/promotions/${promotionId}/bonifications/${productId}`,
        { data: { atributo_id: attributeId } }
      );
      return response.data;
    } catch (error) {
      console.error('❌ [promotionsApi] Error unlinking bonification:', error);
      throw error;
    }
  }
};
