import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSavedSalesStore = defineStore('savedSales', () => {
  const savedSales = ref([]);

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

  return {
    savedSales,
    saveSale,
    getSavedSales,
    getSaleById,
    deleteSavedSale
  };
});
