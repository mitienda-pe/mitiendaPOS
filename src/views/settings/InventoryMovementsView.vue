<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Inventario</h1>
        <p class="text-sm text-gray-500 mt-1">
          Kardex de movimientos: qué entró, qué salió y por qué. Las ventas del POS y sus
          anulaciones se registran solas.
        </p>
      </div>
      <button
        v-if="isActive"
        type="button"
        class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
        @click="abrirDialogo"
      >
        Registrar movimiento
      </button>
    </div>

    <div
      v-if="message"
      :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : messageType === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700']"
    >
      {{ message }}
    </div>

    <div v-if="activationLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Disponible pero sin activar -->
    <div v-else-if="!isActive" class="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Activar el inventario</h2>
      <p class="text-sm text-gray-600 mb-4">
        Al activarlo, cada venta deja su salida en el kardex y vas a poder registrar ingresos,
        salidas y transferencias entre tus almacenes. Nada cambia en el stock que ya tienes cargado.
      </p>
      <button
        type="button"
        class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        :disabled="activating"
        @click="activar"
      >
        {{ activating ? 'Activando…' : 'Activar inventario' }}
      </button>
    </div>

    <template v-else>
      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Almacén</label>
          <select
            v-model.number="filtroAlmacen"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm w-56"
            @change="aplicarFiltros"
          >
            <option :value="0">Todos</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="filtroTipo"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm w-56"
            @change="aplicarFiltros"
          >
            <option value="">Todos</option>
            <option v-for="(label, value) in MOVEMENT_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input v-model="filtroDesde" type="date" class="border border-gray-300 rounded-md px-3 py-2 text-sm" @change="aplicarFiltros" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input v-model="filtroHasta" type="date" class="border border-gray-300 rounded-md px-3 py-2 text-sm" @change="aplicarFiltros" />
        </div>
        <button type="button" class="text-sm text-gray-600 hover:text-gray-800 py-2" @click="limpiarFiltros">
          Limpiar
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <div v-if="loading" class="py-12 text-center text-gray-400">Cargando movimientos…</div>

        <div v-else-if="!movements.length" class="py-12 text-center">
          <p class="text-gray-700 font-medium">Sin movimientos</p>
          <p class="text-sm text-gray-500 mt-1">
            Cuando registres un ingreso o se haga una venta, el movimiento aparece acá.
          </p>
        </div>

        <table v-else class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left px-4 py-2 font-medium">Fecha</th>
              <th class="text-left px-4 py-2 font-medium">Tipo</th>
              <th class="text-left px-4 py-2 font-medium">Producto</th>
              <th class="text-left px-4 py-2 font-medium">Almacén</th>
              <th class="text-right px-4 py-2 font-medium">Cantidad</th>
              <th class="text-left px-4 py-2 font-medium">Saldo</th>
              <th class="text-left px-4 py-2 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="m in movements" :key="m.id">
              <td class="px-4 py-2 text-gray-600 whitespace-nowrap">{{ formatFecha(m.fecha) }}</td>
              <td class="px-4 py-2">
                <span :class="['inline-block px-2 py-0.5 rounded text-xs', toneClass(m.tipo)]">
                  {{ MOVEMENT_LABELS[m.tipo] || m.tipo }}
                </span>
              </td>
              <td class="px-4 py-2">
                <p class="text-gray-800">{{ m.producto || `#${m.producto_id}` }}</p>
                <p class="text-xs text-gray-500">{{ m.sku || 'sin SKU' }}</p>
              </td>
              <td class="px-4 py-2 text-gray-700">
                {{ m.almacen || '—' }}
                <span v-if="m.contraparte" class="block text-xs text-gray-500">→ {{ m.contraparte }}</span>
              </td>
              <td class="px-4 py-2 text-right font-semibold" :class="m.cantidad >= 0 ? 'text-primary-600' : 'text-red-600'">
                {{ m.cantidad > 0 ? '+' : '' }}{{ m.cantidad }}
              </td>
              <td class="px-4 py-2 text-gray-600 whitespace-nowrap">
                {{ m.stock_anterior }} → <strong class="text-gray-800">{{ m.stock_resultante }}</strong>
              </td>
              <td class="px-4 py-2 text-gray-600">
                <span v-if="m.motivo">{{ m.motivo }}</span>
                <span v-if="m.venta_codigo" class="block text-xs text-gray-500">Venta {{ m.venta_codigo }}</span>
                <span v-else-if="m.transferencia_id" class="block text-xs text-gray-500">
                  Transferencia #{{ m.transferencia_id }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t text-sm">
          <span class="text-gray-500">Página {{ page }} de {{ totalPages }}</span>
          <div class="flex gap-2">
            <button type="button" class="px-3 py-1 border rounded disabled:opacity-40" :disabled="page <= 1" @click="irA(page - 1)">
              Anterior
            </button>
            <button type="button" class="px-3 py-1 border rounded disabled:opacity-40" :disabled="page >= totalPages" @click="irA(page + 1)">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Diálogo de movimiento manual -->
    <div v-if="dialogVisible" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-800">Registrar movimiento</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="dialogVisible = false">✕</button>
        </div>

        <div class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
            <select v-model="nuevoTipo" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option v-for="t in MANUAL_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ hintTipo }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Almacén</label>
            <select v-model.number="nuevoAlmacen" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input
              v-model="nuevoMotivo"
              type="text"
              maxlength="191"
              placeholder="Ej: llegó pedido del proveedor, rotura en almacén…"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Productos</label>
            <InventoryLineItems v-model="nuevasLineas" :almacen-id="nuevoAlmacen" />
          </div>
        </div>

        <div class="px-5 py-4 border-t flex justify-end gap-3">
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800 px-3 py-2" @click="dialogVisible = false">
            Cancelar
          </button>
          <button
            type="button"
            class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
            :disabled="!puedeGuardar || guardando"
            @click="guardarMovimiento"
          >
            {{ guardando ? 'Registrando…' : 'Registrar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Kardex del POS: consultar movimientos y registrar ingresos, salidas y mermas
 * sin salir de la caja.
 *
 * El almacén por defecto es el de la sucursal del turno activo: es el único que
 * el cajero tiene delante, y elegirlo a mano cada vez sería una fuente de error.
 */
import { ref, computed, onMounted } from 'vue';
import InventoryLineItems from '../../components/inventory/InventoryLineItems.vue';
import { useShiftStore } from '../../stores/shift';
import {
  stockMovementsApi,
  MANUAL_TYPES,
  MOVEMENT_LABELS,
  movementTone,
} from '../../services/stockMovementsApi';

const shiftStore = useShiftStore();

const activationLoading = ref(true);
const activating = ref(false);
const isActive = ref(false);

const warehouses = ref([]);
const movements = ref([]);
const loading = ref(false);
const page = ref(1);
const perPage = ref(50);
const totalRecords = ref(0);

const filtroAlmacen = ref(0);
const filtroTipo = ref('');
const filtroDesde = ref('');
const filtroHasta = ref('');

const message = ref('');
const messageType = ref('success');

const dialogVisible = ref(false);
const guardando = ref(false);
const nuevoTipo = ref('entrada');
const nuevoAlmacen = ref(null);
const nuevoMotivo = ref('');
const nuevasLineas = ref([]);

const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / perPage.value)));
const hintTipo = computed(() => MANUAL_TYPES.find((t) => t.value === nuevoTipo.value)?.hint ?? '');
const puedeGuardar = computed(() => nuevasLineas.value.length > 0 && !!nuevoAlmacen.value);

function notify(text, type = 'success') {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 5000);
}

function formatFecha(fecha) {
  return (fecha || '').slice(0, 16).replace('T', ' ');
}

function toneClass(tipo) {
  const tone = movementTone(tipo);
  if (tone === 'red') return 'bg-red-50 text-red-700';
  if (tone === 'green') return 'bg-green-50 text-green-700';
  if (tone === 'blue') return 'bg-blue-50 text-blue-700';
  return 'bg-gray-100 text-gray-600';
}

/** Sucursal del turno activo: el almacén que el cajero tiene delante. */
function shiftWarehouseId() {
  const id = Number(shiftStore.activeShift?.tiendadireccion_id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function loadActivation() {
  activationLoading.value = true;
  try {
    const res = await stockMovementsApi.getActivation();
    isActive.value = res.enabled;
  } catch {
    isActive.value = false;
  } finally {
    activationLoading.value = false;
  }
}

async function loadWarehouses() {
  try {
    const data = await stockMovementsApi.warehouses();
    warehouses.value = data?.items ?? [];
    const preferida = shiftWarehouseId();
    nuevoAlmacen.value = warehouses.value.some((w) => w.id === preferida)
      ? preferida
      : (data?.default_id || warehouses.value[0]?.id || null);
  } catch {
    warehouses.value = [];
  }
}

async function loadMovements() {
  loading.value = true;
  try {
    const data = await stockMovementsApi.kardex({
      almacen_id: filtroAlmacen.value || '',
      tipo: filtroTipo.value,
      desde: filtroDesde.value,
      hasta: filtroHasta.value,
      page: page.value,
    });
    movements.value = data?.items ?? [];
    totalRecords.value = data?.pagination?.total_items ?? 0;
    perPage.value = data?.pagination?.per_page ?? 50;
  } catch (e) {
    notify(e?.response?.data?.messages?.error || 'No se pudieron cargar los movimientos', 'error');
  } finally {
    loading.value = false;
  }
}

function aplicarFiltros() {
  page.value = 1;
  loadMovements();
}

function limpiarFiltros() {
  filtroAlmacen.value = 0;
  filtroTipo.value = '';
  filtroDesde.value = '';
  filtroHasta.value = '';
  aplicarFiltros();
}

function irA(p) {
  page.value = p;
  loadMovements();
}

function abrirDialogo() {
  nuevoTipo.value = 'entrada';
  nuevoMotivo.value = '';
  nuevasLineas.value = [];
  nuevoAlmacen.value = shiftWarehouseId() ?? nuevoAlmacen.value ?? warehouses.value[0]?.id ?? null;
  dialogVisible.value = true;
}

async function guardarMovimiento() {
  if (!puedeGuardar.value) return;
  guardando.value = true;
  try {
    const data = await stockMovementsApi.createMovement({
      tipo: nuevoTipo.value,
      almacenId: nuevoAlmacen.value,
      motivo: nuevoMotivo.value.trim(),
      items: nuevasLineas.value.map((l) => ({
        producto_id: l.producto_id,
        productoatributo_id: l.productoatributo_id || undefined,
        cantidad: l.cantidad,
      })),
    });
    const errores = data?.errores?.length ?? 0;
    notify(
      `${data?.aplicados ?? 0} producto(s) actualizado(s)` + (errores ? `, ${errores} con error` : ''),
      errores ? 'warn' : 'success'
    );
    dialogVisible.value = false;
    page.value = 1;
    await loadMovements();
  } catch (e) {
    notify(e?.response?.data?.messages?.error || 'No se pudo registrar el movimiento', 'error');
  } finally {
    guardando.value = false;
  }
}

async function activar() {
  activating.value = true;
  try {
    const res = await stockMovementsApi.setActivation(true);
    isActive.value = res.enabled;
    if (isActive.value) {
      notify('Inventario activado. Desde ahora las ventas se registran en el kardex.');
      await loadWarehouses();
      await loadMovements();
    }
  } catch (e) {
    notify(e?.response?.data?.messages?.error || 'No disponible para esta tienda', 'error');
  } finally {
    activating.value = false;
  }
}

onMounted(async () => {
  await loadActivation();
  if (isActive.value) {
    await loadWarehouses();
    await loadMovements();
  }
});
</script>
