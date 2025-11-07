<template>
  <div class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="handleClose"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Vincular Productos Base</h3>
                <button
                  @click="handleClose"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  :disabled="loading"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <!-- Search -->
                <div class="flex gap-2">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar productos por nombre, SKU o código de barras..."
                    class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    @keyup.enter="searchProducts"
                  />
                  <button
                    @click="searchProducts"
                    :disabled="loading"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ loading ? 'Buscando...' : 'Buscar' }}
                  </button>
                </div>

                <!-- Results -->
                <div v-if="products.length > 0" class="border rounded-lg overflow-hidden">
                  <div class="overflow-x-auto max-h-96">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                            <input
                              type="checkbox"
                              @change="toggleSelectAll"
                              :checked="allSelected"
                              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
                          <td class="px-4 py-4">
                            <input
                              type="checkbox"
                              :value="product.id"
                              v-model="selectedProductIds"
                              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td class="px-4 py-4">
                            <div class="flex items-center gap-3">
                              <img
                                v-if="product.images && product.images.length > 0"
                                :src="product.images[0].url"
                                :alt="product.name"
                                class="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                                <div class="text-xs text-gray-500">SKU: {{ product.sku }}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="searchQuery && !loading" class="text-center py-8 text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No se encontraron productos</p>
                  <p class="text-sm">Intenta con otro término de búsqueda</p>
                </div>

                <!-- Initial state -->
                <div v-else-if="!searchQuery" class="text-center py-8 text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p>Busca productos para vincular a esta bonificación</p>
                </div>

                <!-- Selected count -->
                <div v-if="selectedProductIds.length > 0" class="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {{ selectedProductIds.length }} producto(s) seleccionado(s)
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="handleLink"
            :disabled="selectedProductIds.length === 0 || linking"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ linking ? 'Vinculando...' : 'Vincular Productos' }}
          </button>
          <button
            @click="handleClose"
            :disabled="linking"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { productsApi } from '../services/productsApi';

const props = defineProps({
  promotionId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'linked']);

const loading = ref(false);
const linking = ref(false);
const searchQuery = ref('');
const products = ref([]);
const selectedProductIds = ref([]);

const allSelected = computed(() => {
  return products.value.length > 0 && selectedProductIds.value.length === products.value.length;
});

async function searchProducts() {
  if (!searchQuery.value.trim()) {
    products.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await productsApi.getProducts({
      search: searchQuery.value,
      limit: 50,
      page: 1,
      published: true, // Solo productos publicados
      stock_status: 'in_stock' // Solo productos con stock
    });

    if (response.success && response.data) {
      products.value = response.data;
    }
  } catch (error) {
    console.error('Error searching products:', error);
    alert('Error al buscar productos');
  } finally {
    loading.value = false;
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedProductIds.value = products.value.map(p => p.id);
  } else {
    selectedProductIds.value = [];
  }
}

async function handleLink() {
  if (selectedProductIds.value.length === 0) {
    return;
  }

  linking.value = true;
  const productData = selectedProductIds.value.map(id => ({ producto_id: id }));
  emit('linked', productData);
  handleClose();
  linking.value = false;
}

function handleClose() {
  if (!linking.value) {
    searchQuery.value = '';
    products.value = [];
    selectedProductIds.value = [];
    emit('close');
  }
}

// Not needed anymore - using direct image URLs from API
</script>
