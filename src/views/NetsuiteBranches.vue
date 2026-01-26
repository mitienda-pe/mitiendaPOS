<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Sucursales - NetSuite</h1>
      <p class="mt-2 text-gray-600">
        Configure el Location ID de NetSuite para cada sucursal. Esta información se utiliza para el control de inventario y facturación en NetSuite.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Branches Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sucursal
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dirección
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              N° Cajas
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
              NetSuite Location ID
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="branch in branches" :key="branch.tiendadireccion_id" class="hover:bg-gray-50">
            <!-- Branch Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ branch.tiendadireccion_nombresucursal }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Address -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ branch.tiendadireccion_direccion }}</div>
              <div class="text-sm text-gray-500" v-if="branch.tiendadireccion_interior">
                {{ branch.tiendadireccion_interior }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatLocation(branch) }}
              </div>
            </td>

            <!-- Number of Cashiers -->
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ branch.tiendadireccion_numero_cajas }}
              </span>
            </td>

            <!-- NetSuite Location ID - Inline Editable -->
            <td class="px-6 py-4">
              <InlineEditField
                :model-value="branch.tiendadireccion_netsuite_location_id"
                placeholder="Sin configurar"
                :maxlength="50"
                :on-save="(value) => updateNetsuiteLocationId(branch.tiendadireccion_id, value)"
              />
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span v-if="branch.tiendadireccion_netsuite_location_id" class="inline-flex items-center text-green-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </span>
              <span v-else class="inline-flex items-center text-gray-400">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="branches.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay sucursales</h3>
        <p class="mt-1 text-sm text-gray-500">
          No se encontraron sucursales para configurar.
        </p>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { branchesApi } from '../services/branchesApi';
import InlineEditField from '../components/InlineEditField.vue';

const authStore = useAuthStore();
const loading = ref(true);
const branches = ref([]);
const successMessage = ref('');

const currentStoreId = computed(() => authStore.selectedStore?.id || null);

// Fetch branches
const fetchBranches = async () => {
  try {
    loading.value = true;
    const response = await branchesApi.getAll(currentStoreId.value);
    branches.value = response.data || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    alert('Error al cargar las sucursales');
  } finally {
    loading.value = false;
  }
};

// Update NetSuite Location ID
const updateNetsuiteLocationId = async (branchId, netsuiteLocationId) => {
  try {
    await branchesApi.update(branchId, {
      tiendadireccion_netsuite_location_id: netsuiteLocationId || null
    });

    // Update local data
    const branchIndex = branches.value.findIndex(b => b.tiendadireccion_id === branchId);
    if (branchIndex !== -1) {
      branches.value[branchIndex].tiendadireccion_netsuite_location_id = netsuiteLocationId;
    }

    // Show success message
    showSuccessMessage('NetSuite Location ID actualizado correctamente');
  } catch (error) {
    console.error('Error updating NetSuite Location ID:', error);
    throw new Error('Error al actualizar el NetSuite Location ID');
  }
};

// Helper: Format location string
const formatLocation = (branch) => {
  const parts = [];
  if (branch.tiendadireccion_dist) parts.push(branch.tiendadireccion_dist);
  if (branch.tiendadireccion_prov) parts.push(branch.tiendadireccion_prov);
  if (branch.tiendadireccion_dpto) parts.push(branch.tiendadireccion_dpto);
  return parts.join(', ') || '-';
};

// Helper: Show success message
const showSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

onMounted(() => {
  fetchBranches();
});
</script>
