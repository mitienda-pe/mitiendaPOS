import axios from 'axios';

const apisNetPeClient = axios.create({
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_APISNET_TOKEN}`,
    'Accept': 'application/json',
  }
});

export const apisNetPeApi = {
  // Consulta DNI
  async consultarDNI(dni) {
    try {
      const response = await apisNetPeClient.get(`/api-reniec/dni?numero=${dni}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error consultando DNI:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al consultar DNI'
      };
    }
  },

  // Consulta RUC
  async consultarRUC(ruc) {
    try {
      const response = await apisNetPeClient.get(`/api-sunat/ruc?numero=${ruc}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error consultando RUC:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al consultar RUC'
      };
    }
  }
};
