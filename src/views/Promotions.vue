<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Bonificaciones</h1>
            <p class="mt-1 text-sm text-gray-500">Gestiona las bonificaciones de tu tienda</p>
          </div>
          <button
            @click="showCreateDialog = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Bonificación
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nombre de bonificación..."
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @input="debouncedSearch"
              >
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select
                v-model="statusFilter"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                @change="fetchPromotions"
              >
                <option :value="undefined">Todos</option>
                <option :value="1">Activos</option>
                <option :value="0">Inactivos</option>
              </select>
            </div>
          </div>

          <!-- Active Only Checkbox -->
          <div class="mt-4">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="activeOnlyFilter"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="fetchPromotions"
              />
              <span class="ml-2 text-sm text-gray-700">Mostrar solo bonificaciones vigentes</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Cargando bonificaciones...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="h-24 w-24 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">Error al cargar bonificaciones</h2>
          <p class="text-gray-600 text-center max-w-md mb-4">{{ error }}</p>
          <button
            @click="fetchPromotions"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="promotions.length === 0" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="h-24 w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="5" x2="5" y2="19"></line>
            <circle cx="6.5" cy="6.5" r="2.5"></circle>
            <circle cx="17.5" cy="17.5" r="2.5"></circle>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No hay bonificaciones</h2>
          <p class="text-gray-600 text-center max-w-md mb-4">
            Comienza creando tu primera bonificación.
          </p>
          <button
            @click="showCreateDialog = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Bonificación
          </button>
        </div>
      </div>

      <!-- Promotions Table -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vigencia
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="promotion in promotions" :key="promotion.tiendapromocion_id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ promotion.tiendapromocion_nombre }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ promotion.promocion_nombre }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ promotion.num_productos || 0 }}
                    <span v-if="promotion.num_productos_bonificacion" class="text-gray-500">
                      ({{ promotion.num_productos_bonificacion }} bonif.)
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500">
                    <div>{{ formatDate(promotion.tiendapromocion_fechainicio) }}</div>
                    <div>{{ formatDate(promotion.tiendapromocion_fechacaducidad) }}</div>
                    <div v-if="Number(promotion.is_active_period) === 1" class="mt-1 text-xs text-green-600">
                      Vigente ({{ promotion.days_until_expiry }} días)
                    </div>
                    <div v-else class="mt-1 text-xs text-red-600">Fuera de período</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="Number(promotion.tiendapromocion_estado) === 1"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Activo
                  </span>
                  <span
                    v-else
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    Inactivo
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                  <router-link
                    :to="`/promotions/${promotion.tiendapromocion_id}`"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Ver Detalle
                  </router-link>
                  <button
                    @click="confirmDelete(promotion)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page >= pagination.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                de
                <span class="font-medium">{{ pagination.total }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Página {{ pagination.page }} de {{ pagination.pages }}
                </span>
                <button
                  @click="nextPage"
                  :disabled="pagination.page >= pagination.pages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <CreatePromotionDialog
      v-if="showCreateDialog"
      @close="showCreateDialog = false"
      @created="handlePromotionCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { promotionsApi } from '../services/promotionsApi';
import CreatePromotionDialog from '../components/CreatePromotionDialog.vue';

const router = useRouter();

// State
const promotions = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref(undefined);
const activeOnlyFilter = ref(false);
const showCreateDialog = ref(false);

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
});

let searchTimeout = null;

// Fetch promotions
async function fetchPromotions() {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      promocion_id: 7, // Solo bonificaciones (tipo 7)
      search: searchQuery.value || undefined,
      estado: statusFilter.value,
      active_only: activeOnlyFilter.value
    };

    const response = await promotionsApi.getPromotions(params);

    if (response.status === 'success') {
      promotions.value = response.data;
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (err) {
    console.error('Error fetching promotions:', err);
    error.value = err.response?.data?.message || 'Error al cargar bonificaciones';
  } finally {
    loading.value = false;
  }
}

// Debounced search
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchPromotions();
  }, 500);
}

// Pagination
function nextPage() {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    fetchPromotions();
  }
}

function previousPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    fetchPromotions();
  }
}

// Delete confirmation
function confirmDelete(promotion) {
  if (confirm(`¿Estás seguro de que deseas eliminar la bonificación "${promotion.tiendapromocion_nombre}"?`)) {
    deletePromotion(promotion.tiendapromocion_id);
  }
}

async function deletePromotion(id) {
  try {
    await promotionsApi.deletePromotion(id);
    fetchPromotions();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    alert('Error al eliminar la bonificación');
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Handle promotion created
function handlePromotionCreated(promotion) {
  showCreateDialog.value = false;
  if (promotion && promotion.tiendapromocion_id) {
    // Redirigir a la página de detalle para configurar la bonificación
    router.push(`/promotions/${promotion.tiendapromocion_id}`);
  } else {
    // Refresh the list
    fetchPromotions();
  }
}

// Initialize
onMounted(() => {
  fetchPromotions();
});
</script>
