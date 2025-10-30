<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header con estadísticas -->
      <div class="mb-6">
        <!-- Banner de solo lectura para cajeros -->
        <div v-if="!canEdit" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-800">Modo solo lectura</p>
              <p class="text-sm text-blue-700">Puedes consultar el inventario pero no modificar precios ni stock</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Inventario</h1>
            <p class="mt-1 text-sm text-gray-500">
              Gestión de productos y stock
            </p>
          </div>
          <button
            @click="router.push('/menu')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Menú
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Productos
                    </dt>
                    <dd class="text-lg font-semibold text-gray-900">
                      {{ inventoryStore.stats.total_products }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      En Stock
                    </dt>
                    <dd class="text-lg font-semibold text-gray-900">
                      {{ inventoryStore.stats.in_stock_count }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Stock Bajo
                    </dt>
                    <dd class="text-lg font-semibold text-gray-900">
                      {{ inventoryStore.stats.low_stock_count }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Sin Stock
                    </dt>
                    <dd class="text-lg font-semibold text-gray-900">
                      {{ inventoryStore.stats.out_of_stock_count }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="p-4 sm:p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Búsqueda -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                v-model="searchInput"
                @input="debouncedSearch"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nombre o SKU..."
              />
            </div>

            <!-- Filtro de Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado de Stock</label>
              <select
                v-model="inventoryStore.filters.stock_status"
                @change="handleFilterChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Todos</option>
                <option value="in_stock">En Stock</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>

            <!-- Por página -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Por página</label>
              <select
                v-model="inventoryStore.filters.limit"
                @change="handleFilterChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- Botón resetear -->
            <div class="flex items-end">
              <button
                @click="resetFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Productos -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Loading State -->
        <div v-if="inventoryStore.loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500">Cargando productos...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="inventoryStore.products.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
          <p class="mt-1 text-sm text-gray-500">Los productos se gestionan desde el Admin Panel</p>
        </div>

        <!-- Tabla -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="product in inventoryStore.products"
                :key="product.id"
                :class="getRowClass(product)"
              >
                <!-- Imagen -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0].url || product.images[0]"
                    :alt="product.name"
                    class="h-10 w-10 rounded-md object-cover"
                  />
                  <div v-else class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </td>

                <!-- SKU -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ product.sku }}
                </td>

                <!-- Nombre -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  <div v-if="product.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ product.description }}
                  </div>
                </td>

                <!-- Categoría -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.category?.name || 'Sin categoría' }}
                </td>

                <!-- Precio -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatCurrency(product.price) }}
                </td>

                <!-- Stock con badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStockBadgeClass(product)">
                    <template v-if="product.unlimited_stock">
                      ∞ Ilimitado
                    </template>
                    <template v-else>
                      {{ product.stock }}
                      <span v-if="product.stock === 0"> (Agotado)</span>
                      <span v-else-if="product.stock <= product.min_stock"> (Bajo)</span>
                    </template>
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    v-if="canEdit"
                    @click="openQuickEdit(product)"
                    class="text-indigo-600 hover:text-indigo-900 transition-colors"
                  >
                    Editar Rápido
                  </button>
                  <span v-else class="text-gray-400 text-sm italic">Solo lectura</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="!inventoryStore.loading && inventoryStore.products.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="inventoryStore.prevPage(); loadData()"
                :disabled="inventoryStore.currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                @click="inventoryStore.nextPage(); loadData()"
                :disabled="!inventoryStore.hasMoreProducts"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando
                  <span class="font-medium">{{ ((inventoryStore.currentPage - 1) * inventoryStore.filters.limit) + 1 }}</span>
                  -
                  <span class="font-medium">{{ Math.min(inventoryStore.currentPage * inventoryStore.filters.limit, inventoryStore.meta.total) }}</span>
                  de
                  <span class="font-medium">{{ inventoryStore.meta.total }}</span>
                  productos
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="inventoryStore.prevPage(); loadData()"
                  :disabled="inventoryStore.currentPage === 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  @click="inventoryStore.nextPage(); loadData()"
                  :disabled="!inventoryStore.hasMoreProducts"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Edit Modal -->
    <QuickEditModal
      :is-open="showQuickEdit"
      :product="selectedProduct"
      :read-only="!canEdit"
      @close="closeQuickEdit"
      @save="handleQuickSave"
    />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg v-if="toast.type === 'success'" class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ toast.message }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';
import QuickEditModal from '../components/QuickEditModal.vue';

const router = useRouter();
const inventoryStore = useInventoryStore();
const authStore = useAuthStore();
const cashierStore = useCashierStore();

// Determinar si el usuario puede editar (NO es cajero)
const canEdit = computed(() => {
  // Si es usuario admin
  if (authStore.userRole && authStore.userRole !== 'cajero') {
    return true;
  }
  // Si es empleado cajero
  if (cashierStore.cashierRole && cashierStore.cashierRole !== 'cajero') {
    return true;
  }
  // Es cajero = solo lectura
  return false;
});

const searchInput = ref('');
const showQuickEdit = ref(false);
const selectedProduct = ref(null);
const toast = ref({
  show: false,
  type: 'success',
  message: ''
});

let searchTimeout = null;

// Cargar datos
const loadData = async () => {
  console.log('🔍 [INVENTORY] Loading data...');
  console.log('🔍 [INVENTORY] canEdit:', canEdit.value);
  console.log('🔍 [INVENTORY] authStore.userRole:', authStore.userRole);
  console.log('🔍 [INVENTORY] cashierStore.cashierRole:', cashierStore.cashierRole);
  console.log('🔍 [INVENTORY] access_token:', localStorage.getItem('access_token')?.substring(0, 50) + '...');

  await inventoryStore.loadProducts();
  await inventoryStore.loadStats();

  console.log('✅ [INVENTORY] Products loaded:', inventoryStore.products.length);
  console.log('✅ [INVENTORY] Stats:', inventoryStore.stats);

  if (inventoryStore.error) {
    console.error('❌ [INVENTORY] Error:', inventoryStore.error);
  }
};

// Búsqueda con debounce
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    inventoryStore.setFilter('search', searchInput.value);
    loadData();
  }, 500);
};

// Manejar cambios de filtros
const handleFilterChange = () => {
  loadData();
};

// Resetear filtros
const resetFilters = () => {
  searchInput.value = '';
  inventoryStore.resetFilters();
  loadData();
};

// Quick Edit
const openQuickEdit = (product) => {
  selectedProduct.value = product;
  showQuickEdit.value = true;
};

const closeQuickEdit = () => {
  showQuickEdit.value = false;
  selectedProduct.value = null;
};

const handleQuickSave = async (data) => {
  const result = await inventoryStore.quickUpdate(data.productId, {
    price: data.price,
    stock: data.stock
  });

  if (result.success) {
    showToast('success', result.message || 'Producto actualizado correctamente');
    closeQuickEdit();
    // Recargar para asegurar datos actualizados
    await loadData();
  } else {
    showToast('error', result.message || 'Error al actualizar el producto');
  }
};

// Toast notification
const showToast = (type, message) => {
  toast.value = {
    show: true,
    type,
    message
  };

  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Utilidades
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value);
};

const getStockBadgeClass = (product) => {
  if (product.unlimited_stock) {
    return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800';
  }
  if (product.stock === 0) {
    return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
  } else if (product.stock <= product.min_stock) {
    return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
  }
  return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
};

const getRowClass = (product) => {
  if (product.unlimited_stock) {
    return '';
  }
  if (product.stock === 0) {
    return 'bg-red-50';
  } else if (product.stock <= product.min_stock) {
    return 'bg-yellow-50';
  }
  return '';
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
