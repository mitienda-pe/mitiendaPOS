<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Sucursales - NetSuite</h1>
      <p class="mt-2 text-gray-600">
        Cada sucursal debe tener su Location ID. Series boleta/factura y Generic Customer
        son override por sucursal: si los dejas vacíos se usa el valor de la tienda
        configurado en
        <router-link to="/settings/netsuite/general" class="text-primary underline">
          Configuración general
        </router-link>.
      </p>

      <!-- Validation banner -->
      <div
        v-if="branchIssues.length"
        class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
      >
        <p class="font-medium">
          {{ branchIssues.length }} sucursal(es) sin Location ID — el sync NetSuite no
          puede operar hasta corregir.
        </p>
      </div>
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
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sucursal
            </th>
            <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cajas
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Location ID
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Serie Boleta
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Serie Factura
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Generic Customer
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="branch in branches" :key="branch.tiendadireccion_id" class="hover:bg-gray-50">
            <!-- Branch Name + Address compacta -->
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-gray-900">
                {{ branch.tiendadireccion_nombresucursal }}
              </div>
              <div class="text-xs text-gray-500">
                {{ branch.tiendadireccion_direccion }}
                <span v-if="branch.tiendadireccion_interior">— {{ branch.tiendadireccion_interior }}</span>
              </div>
              <div class="text-xs text-gray-400">{{ formatLocation(branch) }}</div>
            </td>

            <!-- Number of Cashiers -->
            <td class="px-4 py-3 whitespace-nowrap text-center">
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ branch.tiendadireccion_numero_cajas }}
              </span>
            </td>

            <!-- NetSuite Location ID - obligatorio si la sucursal tiene POS -->
            <td class="px-4 py-3">
              <InlineEditField
                :model-value="branch.tiendadireccion_netsuite_location_id"
                placeholder="Sin configurar"
                :maxlength="50"
                :on-save="(value) => updateNetsuiteLocationId(branch.tiendadireccion_id, value)"
              />
              <div
                v-if="branchHasMissingLocation(branch.tiendadireccion_id)"
                class="text-xs text-red-600 mt-1"
              >
                Falta Location ID — sync bloqueado.
              </div>
            </td>

            <!-- Serie Boleta override -->
            <td class="px-4 py-3">
              <InlineEditField
                :model-value="getOverrideValue(branch.tiendadireccion_id, 'serie_boleta')"
                placeholder="Override (opcional)"
                :maxlength="20"
                :on-save="(value) => updateNetsuiteConfig(branch.tiendadireccion_id, { serie_boleta_netsuite_id: value || null })"
              />
            </td>

            <!-- Serie Factura override -->
            <td class="px-4 py-3">
              <InlineEditField
                :model-value="getOverrideValue(branch.tiendadireccion_id, 'serie_factura')"
                placeholder="Override (opcional)"
                :maxlength="20"
                :on-save="(value) => updateNetsuiteConfig(branch.tiendadireccion_id, { serie_factura_netsuite_id: value || null })"
              />
            </td>

            <!-- Generic Customer override -->
            <td class="px-4 py-3">
              <InlineEditField
                :model-value="getOverrideValue(branch.tiendadireccion_id, 'generic_customer')"
                placeholder="Override (opcional)"
                :maxlength="20"
                :on-save="(value) => updateNetsuiteConfig(branch.tiendadireccion_id, { generic_customer_id: value || null })"
              />
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
import { netsuiteConfigApi } from '../services/netsuiteConfigApi';
import InlineEditField from '../components/InlineEditField.vue';

const authStore = useAuthStore();
const loading = ref(true);
const branches = ref([]);
const successMessage = ref('');

// NetSuite branch-level overrides (series + generic customer + location)
const branchesNetsuiteConfig = ref([]);
const validationIssues = ref([]);

const currentStoreId = computed(() => authStore.selectedStore?.id || null);

// Issues from /netsuite-config/validate that affect branches
const branchIssues = computed(() =>
  validationIssues.value.filter(i => i.category === 'branches')
);

const branchHasMissingLocation = (branchId) =>
  branchIssues.value.some(
    i => i.code === 'missing_branch_location' && Number(i.tiendadireccion_id) === Number(branchId)
  );

// Fetch branches y config NetSuite
const fetchBranches = async () => {
  try {
    loading.value = true;
    const [branchesResp, nsResp, validateResp] = await Promise.all([
      branchesApi.getAll(currentStoreId.value),
      branchesApi.getNetsuiteConfig(currentStoreId.value).catch(err => {
        console.error('Error fetching NetSuite branch config:', err);
        return { success: false, data: [] };
      }),
      netsuiteConfigApi.validate(currentStoreId.value).catch(() => null),
    ]);
    branches.value = branchesResp.data || [];
    branchesNetsuiteConfig.value = nsResp?.data || [];
    validationIssues.value = validateResp?.data?.issues || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    alert('Error al cargar las sucursales');
  } finally {
    loading.value = false;
  }
};

// Helpers para overrides
const getBranchConfig = (branchId) => {
  const id = Number(branchId);
  return branchesNetsuiteConfig.value.find(b => Number(b.tiendadireccion_id) === id);
};

const getOverrideValue = (branchId, field) => {
  const cfg = getBranchConfig(branchId);
  if (!cfg) return null;
  if (field === 'serie_boleta') return cfg.serie_boleta_is_override ? cfg.serie_boleta_netsuite_id : null;
  if (field === 'serie_factura') return cfg.serie_factura_is_override ? cfg.serie_factura_netsuite_id : null;
  if (field === 'generic_customer') return cfg.generic_customer_is_override ? cfg.generic_customer_id : null;
  return null;
};

// Guardar override (series o generic customer) por sucursal
const updateNetsuiteConfig = async (branchId, payload) => {
  try {
    await branchesApi.updateNetsuiteConfig(currentStoreId.value, branchId, payload);
    const nsResp = await branchesApi.getNetsuiteConfig(currentStoreId.value);
    branchesNetsuiteConfig.value = nsResp?.data || [];
    showSuccessMessage('Configuración NetSuite actualizada');
  } catch (error) {
    console.error('Error updating branch NetSuite config:', error);
    throw new Error('Error al actualizar la configuración NetSuite');
  }
};

// Update NetSuite Location ID + revalidate
const updateNetsuiteLocationId = async (branchId, netsuiteLocationId) => {
  try {
    await branchesApi.update(branchId, {
      tiendadireccion_netsuite_location_id: netsuiteLocationId || null
    });

    const branchIndex = branches.value.findIndex(b => b.tiendadireccion_id === branchId);
    if (branchIndex !== -1) {
      branches.value[branchIndex].tiendadireccion_netsuite_location_id = netsuiteLocationId;
    }

    const validateResp = await netsuiteConfigApi.validate(currentStoreId.value).catch(() => null);
    validationIssues.value = validateResp?.data?.issues || [];

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
