import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useSavedSalesStore = defineStore('savedSales', () => {
  // Inicializar desde localStorage si hay datos
  const savedSales = ref(JSON.parse(localStorage.getItem('savedSales')) || []);
  
  // Guardar en localStorage cada vez que cambia savedSales
  watch(savedSales, (newValue) => {
    localStorage.setItem('savedSales', JSON.stringify(newValue));
  }, { deep: true });

  // Guardar una venta inconclusa
  function saveSale(sale) {
    // Generar un ID único y timestamp para la venta
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // Guardar la venta con metadatos
    savedSales.value.push({
      id,
      timestamp,
      ...sale
    });
    
    return id;
  }

  // Obtener todas las ventas guardadas
  function getSavedSales() {
    return savedSales.value;
  }

  // Obtener una venta específica por ID
  function getSaleById(id) {
    return savedSales.value.find(sale => sale.id === id);
  }

  // Eliminar una venta guardada
  function deleteSavedSale(id) {
    savedSales.value = savedSales.value.filter(sale => sale.id !== id);
  }

  // Actualizar una venta existente
  function updateSale(id, saleData) {
    const index = savedSales.value.findIndex(sale => sale.id === id);
    if (index !== -1) {
      // Mantener el ID y timestamp originales
      const originalId = savedSales.value[index].id;
      const originalTimestamp = savedSales.value[index].timestamp;

      savedSales.value[index] = {
        id: originalId,
        timestamp: originalTimestamp,
        ...saleData
      };
    }
  }

  // Buscar ventas guardadas del mismo cliente (por documento)
  function findSalesByCustomer(customerDocument) {
    if (!customerDocument) return [];

    return savedSales.value.filter(sale =>
      sale.customer &&
      sale.customer.documento === customerDocument
    );
  }

  return {
    savedSales,
    saveSale,
    getSavedSales,
    getSaleById,
    deleteSavedSale,
    updateSale,
    findSalesByCustomer
  };
});
