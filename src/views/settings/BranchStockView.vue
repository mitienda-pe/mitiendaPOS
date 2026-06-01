<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Stock por sucursal</h1>
      <p class="text-sm text-gray-500 mt-1">
        Gestiona el inventario de cada sucursal de forma independiente. El stock total se calcula como la suma de las sucursales.
      </p>
    </div>

    <div v-if="message" :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : messageType === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700']">
      {{ message }}
    </div>

    <!-- Cargando estado -->
    <div v-if="activationLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- No activado -->
    <div v-else-if="!isActive" class="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Activar gestión de stock por sucursal</h2>
      <p class="text-sm text-gray-600 mb-4">
        Al activarla, el stock total de cada producto pasará a calcularse como la suma de sus sucursales.
        Solo disponible para tiendas sin integración con ERP/NetSuite.
      </p>
      <button class="btn-primary" :disabled="activating" @click="activate">
        {{ activating ? 'Activando...' : 'Activar' }}
      </button>
    </div>

    <!-- Gestión -->
    <div v-else>
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label class="form-label">Sucursal</label>
          <select v-model="branchId" class="input-field" @change="onBranchChange">
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="form-label">Buscar producto</label>
          <input v-model="search" type="text" placeholder="Nombre o SKU" class="input-field" @input="onSearchInput" />
        </div>
        <div class="flex items-center gap-2">
          <label class="btn-secondary cursor-pointer mb-0">
            <input type="file" accept=".csv,text/csv" class="hidden" @change="onFileChange" />
            {{ importing ? 'Importando...' : 'Importar CSV' }}
          </label>
          <button class="btn-primary" :disabled="!hasChanges || saving" @click="save">
            {{ saving ? 'Guardando...' : `Guardar${hasChanges ? ' (' + changedItems.length + ')' : ''}` }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="loadingRows" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <table v-else class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Producto</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Stock en sucursal</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Stock total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in rows" :key="row.producto_id">
              <td class="px-4 py-2 text-sm text-gray-600">{{ row.sku || '—' }}</td>
              <td class="px-4 py-2 text-sm">
                {{ row.nombre }}
                <span v-if="row.tiene_variantes" class="ml-2 text-[10px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">variantes</span>
                <span v-if="row.stock_ilimitado" class="ml-2 text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">ilimitado</span>
              </td>
              <td class="px-4 py-2">
                <input
                  v-if="!row.tiene_variantes && !row.stock_ilimitado"
                  v-model.number="row.stock_sucursal"
                  type="number"
                  min="0"
                  class="input-field w-28"
                  :class="{ 'font-semibold border-primary-400': row.stock_sucursal !== row._original }"
                />
                <span v-else class="text-sm text-gray-400">{{ row.tiene_variantes ? 'por variante' : '∞' }}</span>
              </td>
              <td class="px-4 py-2 text-sm text-gray-600">{{ row.stock_ilimitado ? '∞' : row.stock_agregado }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="4" class="px-4 py-8 text-center text-gray-500 text-sm">No hay productos para esta sucursal.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
        <button class="btn-secondary" :disabled="page <= 1" @click="goToPage(page - 1)">Anterior</button>
        <span class="text-sm text-gray-600">Página {{ page }} de {{ totalPages }}</span>
        <button class="btn-secondary" :disabled="page >= totalPages" @click="goToPage(page + 1)">Siguiente</button>
      </div>

      <p class="text-xs text-gray-400 mt-3">
        Productos con variantes: usa el import CSV con la columna <code>variante_sku</code> para fijar su stock por sucursal.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { branchStockApi } from '../../services/branchStockApi';
import { branchesApi } from '../../services/branchesApi';
import { useAuthStore } from '../../stores/auth';
import { useShiftStore } from '../../stores/shift';

const authStore = useAuthStore();
const shiftStore = useShiftStore();

const activationLoading = ref(true);
const activating = ref(false);
const isActive = ref(false);

const branches = ref([]);
const branchId = ref(null);

const rows = ref([]);
const loadingRows = ref(false);
const saving = ref(false);
const importing = ref(false);
const search = ref('');
const page = ref(1);
const totalItems = ref(0);
const perPage = ref(50);

const message = ref('');
const messageType = ref('success');

let searchTimer = null;

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage.value)));

const changedItems = computed(() =>
  rows.value
    .filter((r) => !r.tiene_variantes && !r.stock_ilimitado && r.stock_sucursal !== r._original)
    .map((r) => ({ producto_id: r.producto_id, stock: Number(r.stock_sucursal) || 0 }))
);
const hasChanges = computed(() => changedItems.value.length > 0);

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const loadBranches = async () => {
  const tiendaId = authStore.selectedStore?.id;
  const res = await branchesApi.getAll(tiendaId);
  branches.value = (res?.data ?? []).map((b) => ({
    id: b.tiendadireccion_id ?? b.id,
    name: b.tiendadireccion_nombresucursal ?? b.nombre,
  }));
  // Pre-seleccionar la sucursal del turno activo si existe.
  const shiftBranch = shiftStore.activeShift?.tiendadireccion_id;
  if (shiftBranch && branches.value.some((b) => b.id === Number(shiftBranch))) {
    branchId.value = Number(shiftBranch);
  } else if (branches.value.length) {
    branchId.value = branches.value[0].id;
  }
};

const loadRows = async () => {
  if (!branchId.value) return;
  loadingRows.value = true;
  try {
    const res = await branchStockApi.list({
      tiendadireccionId: branchId.value,
      search: search.value || undefined,
      page: page.value,
    });
    rows.value = (res.items ?? []).map((it) => ({ ...it, _original: it.stock_sucursal }));
    totalItems.value = res.pagination?.total_items ?? 0;
    perPage.value = res.pagination?.per_page ?? 50;
  } catch (e) {
    showMessage(errMsg(e, 'No se pudo cargar el stock'), 'error');
  } finally {
    loadingRows.value = false;
  }
};

const onBranchChange = () => { page.value = 1; loadRows(); };

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { page.value = 1; loadRows(); }, 350);
};

const goToPage = (p) => { page.value = p; loadRows(); };

const activate = async () => {
  activating.value = true;
  try {
    const res = await branchStockApi.setActivation(true);
    isActive.value = res.enabled;
    if (isActive.value) {
      showMessage('Gestión de stock por sucursal activada');
      await loadBranches();
      await loadRows();
    }
  } catch (e) {
    showMessage(errMsg(e, 'No disponible para esta tienda'), 'error');
  } finally {
    activating.value = false;
  }
};

const save = async () => {
  if (!branchId.value || !hasChanges.value) return;
  saving.value = true;
  try {
    const res = await branchStockApi.save({ tiendadireccionId: branchId.value, items: changedItems.value });
    showMessage(`${res?.updated ?? 0} producto(s) actualizado(s)`);
    await loadRows();
  } catch (e) {
    showMessage(errMsg(e, 'No se pudo guardar'), 'error');
  } finally {
    saving.value = false;
  }
};

const onFileChange = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file || !branchId.value) return;
  importing.value = true;
  try {
    const res = await branchStockApi.importCsv(file, { tiendadireccionId: branchId.value });
    const errors = res?.errors?.length ?? 0;
    showMessage(`${res?.updated ?? 0} actualizado(s)${errors ? ', ' + errors + ' error(es)' : ''}`, errors ? 'warn' : 'success');
    await loadRows();
  } catch (err) {
    showMessage(errMsg(err, 'No se pudo importar el CSV'), 'error');
  } finally {
    importing.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await branchStockApi.getActivation();
    isActive.value = res.enabled;
  } catch {
    isActive.value = false;
  } finally {
    activationLoading.value = false;
  }
  if (isActive.value) {
    await loadBranches();
    await loadRows();
  }
});
</script>
