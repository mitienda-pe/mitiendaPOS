<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Transferencias entre almacenes</h1>
        <p class="text-sm text-gray-500 mt-1">
          Mueve mercadería de un almacén a otro. El stock total de la tienda no cambia: solo se
          redistribuye.
        </p>
      </div>
      <button
        v-if="!cargandoAlmacenes && warehouses.length > 1"
        type="button"
        class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
        @click="abrirDialogo"
      >
        Nueva transferencia
      </button>
    </div>

    <div
      v-if="message"
      :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : messageType === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700']"
    >
      {{ message }}
    </div>

    <div v-if="cargandoAlmacenes" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="warehouses.length < 2" class="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Necesitas al menos dos direcciones</h2>
      <p class="text-sm text-gray-600">
        Cada dirección de tu tienda es un almacén. Registra al menos dos en Configuración →
        Sucursales para poder transferir mercadería entre ellas.
      </p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-x-auto">
      <div v-if="loading" class="py-12 text-center text-gray-400">Cargando transferencias…</div>

      <div v-else-if="!transfers.length" class="py-12 text-center">
        <p class="text-gray-700 font-medium">Sin transferencias</p>
        <p class="text-sm text-gray-500 mt-1">
          Cuando muevas mercadería entre almacenes, el historial aparece acá.
        </p>
      </div>

      <table v-else class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-2 font-medium">#</th>
            <th class="text-left px-4 py-2 font-medium">Fecha</th>
            <th class="text-left px-4 py-2 font-medium">Ruta</th>
            <th class="text-left px-4 py-2 font-medium">Contenido</th>
            <th class="text-left px-4 py-2 font-medium">Estado</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in transfers" :key="t.id">
            <td class="px-4 py-2 text-gray-600">#{{ t.id }}</td>
            <td class="px-4 py-2 text-gray-600 whitespace-nowrap">{{ formatFecha(t.fecha) }}</td>
            <td class="px-4 py-2 text-gray-800">{{ t.origen || t.origen_id }} → {{ t.destino || t.destino_id }}</td>
            <td class="px-4 py-2 text-gray-700">{{ t.items_count }} producto(s) · {{ t.unidades_total }} unidad(es)</td>
            <td class="px-4 py-2">
              <span
                :class="['inline-block px-2 py-0.5 rounded text-xs', t.estado === 'confirmada' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600']"
              >
                {{ t.estado === 'confirmada' ? 'Confirmada' : 'Anulada' }}
              </span>
            </td>
            <td class="px-4 py-2 text-right">
              <button type="button" class="text-sm text-primary-600 hover:text-primary-700" @click="verDetalle(t.id)">
                Ver
              </button>
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

    <!-- Nueva transferencia -->
    <div v-if="dialogVisible" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-800">Nueva transferencia</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="dialogVisible = false">✕</button>
        </div>

        <div class="p-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <select
                v-model.number="origenId"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                @change="onOrigenChange"
              >
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hacia</label>
              <select v-model.number="destinoId" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option :value="null">Almacén de destino</option>
                <option v-for="w in destinosDisponibles" :key="w.id" :value="w.id">{{ w.nombre }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
            <input
              v-model="nota"
              type="text"
              maxlength="191"
              placeholder="Ej: reposición semanal"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Productos</label>
            <InventoryLineItems v-model="lineas" :almacen-id="origenId" />
          </div>

          <div v-if="faltantes.length" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm font-medium text-red-700 mb-1">Sin stock suficiente en el origen</p>
            <ul class="text-sm text-red-600 space-y-0.5">
              <li v-for="f in faltantes" :key="`${f.producto_id}:${f.productoatributo_id}`">
                {{ nombreProducto(f.producto_id, f.productoatributo_id) }}:
                pediste {{ f.solicitado }}, hay {{ f.disponible }}
              </li>
            </ul>
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
            @click="guardar"
          >
            {{ guardando ? 'Transfiriendo…' : 'Transferir' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detalle -->
    <div v-if="detalleVisible" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-800">
            Transferencia #{{ detalle?.transferencia?.id ?? '' }}
          </h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="detalleVisible = false">✕</button>
        </div>

        <div class="p-5">
          <div v-if="cargandoDetalle" class="py-8 text-center text-gray-400">Cargando…</div>

          <div v-else-if="detalle" class="space-y-4">
            <div class="text-sm text-gray-700">
              <p>
                <strong>{{ detalle.transferencia.origen }}</strong> →
                <strong>{{ detalle.transferencia.destino }}</strong>
              </p>
              <p class="text-gray-500">{{ formatFecha(detalle.transferencia.fecha) }}</p>
              <p v-if="detalle.transferencia.nota" class="mt-1">{{ detalle.transferencia.nota }}</p>
            </div>

            <div class="border border-gray-200 rounded-lg divide-y">
              <div v-for="mov in detalle.movimientos" :key="mov.id" class="flex items-center justify-between p-3">
                <div class="min-w-0">
                  <p class="text-sm text-gray-800 truncate">{{ mov.producto || `#${mov.producto_id}` }}</p>
                  <p class="text-xs text-gray-500">
                    {{ mov.tipo === 'transferencia_salida' ? 'Salida' : 'Entrada' }} ·
                    saldo {{ mov.stock_anterior }} → {{ mov.stock_resultante }}
                  </p>
                </div>
                <span class="text-sm font-semibold" :class="mov.cantidad >= 0 ? 'text-primary-600' : 'text-red-600'">
                  {{ mov.cantidad > 0 ? '+' : '' }}{{ mov.cantidad }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t text-right">
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="detalleVisible = false">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Transferencias entre almacenes desde el POS.
 *
 * El origen arranca en la sucursal del turno activo: desde la caja lo normal es
 * mandar mercadería a otro local, no traerla.
 */
import { ref, computed, onMounted } from 'vue';
import InventoryLineItems from '../../components/inventory/InventoryLineItems.vue';
import { useShiftStore } from '../../stores/shift';
import { stockMovementsApi } from '../../services/stockMovementsApi';

const shiftStore = useShiftStore();

const loading = ref(false);
const cargandoAlmacenes = ref(true);
const transfers = ref([]);
const warehouses = ref([]);
const page = ref(1);
const perPage = ref(50);
const totalRecords = ref(0);

const message = ref('');
const messageType = ref('success');

const dialogVisible = ref(false);
const guardando = ref(false);
const origenId = ref(null);
const destinoId = ref(null);
const nota = ref('');
const lineas = ref([]);
const faltantes = ref([]);

const detalleVisible = ref(false);
const detalle = ref(null);
const cargandoDetalle = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / perPage.value)));
const destinosDisponibles = computed(() => warehouses.value.filter((w) => w.id !== origenId.value));
const puedeGuardar = computed(
  () => !!origenId.value && !!destinoId.value && origenId.value !== destinoId.value && lineas.value.length > 0
);

function notify(text, type = 'success') {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 5000);
}

function formatFecha(fecha) {
  return (fecha || '').slice(0, 16).replace('T', ' ');
}

function shiftWarehouseId() {
  const id = Number(shiftStore.activeShift?.tiendadireccion_id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function loadWarehouses() {
  cargandoAlmacenes.value = true;
  try {
    const data = await stockMovementsApi.warehouses();
    warehouses.value = data?.items ?? [];
  } catch {
    warehouses.value = [];
  } finally {
    cargandoAlmacenes.value = false;
  }
}

async function loadTransfers() {
  loading.value = true;
  try {
    const data = await stockMovementsApi.transfers(page.value);
    transfers.value = data?.items ?? [];
    totalRecords.value = data?.pagination?.total_items ?? 0;
    perPage.value = data?.pagination?.per_page ?? 50;
  } catch (e) {
    notify(e?.response?.data?.messages?.error || 'No se pudieron cargar las transferencias', 'error');
  } finally {
    loading.value = false;
  }
}

function irA(p) {
  page.value = p;
  loadTransfers();
}

function abrirDialogo() {
  const preferido = shiftWarehouseId();
  origenId.value = warehouses.value.some((w) => w.id === preferido) ? preferido : warehouses.value[0]?.id ?? null;
  destinoId.value = null;
  nota.value = '';
  lineas.value = [];
  faltantes.value = [];
  dialogVisible.value = true;
}

/** Cambiar el origen invalida los saldos de las líneas ya cargadas. */
function onOrigenChange() {
  lineas.value = [];
  faltantes.value = [];
  if (destinoId.value === origenId.value) destinoId.value = null;
}

async function guardar() {
  if (!puedeGuardar.value) return;
  guardando.value = true;
  faltantes.value = [];
  try {
    const data = await stockMovementsApi.createTransfer({
      origenId: origenId.value,
      destinoId: destinoId.value,
      nota: nota.value.trim(),
      items: lineas.value.map((l) => ({
        producto_id: l.producto_id,
        productoatributo_id: l.productoatributo_id || undefined,
        cantidad: l.cantidad,
      })),
    });
    notify(`${data?.unidades_total ?? 0} unidad(es) movida(s)`);
    dialogVisible.value = false;
    page.value = 1;
    await loadTransfers();
  } catch (e) {
    const shortages = e?.response?.status === 422 ? (e?.response?.data?.data?.faltantes ?? []) : [];
    if (shortages.length) {
      faltantes.value = shortages;
      notify('Stock insuficiente: revisa las cantidades marcadas.', 'warn');
    } else {
      notify(e?.response?.data?.messages?.error || 'No se pudo registrar la transferencia', 'error');
    }
  } finally {
    guardando.value = false;
  }
}

async function verDetalle(id) {
  detalleVisible.value = true;
  cargandoDetalle.value = true;
  detalle.value = null;
  try {
    detalle.value = await stockMovementsApi.transfer(id);
  } catch (e) {
    notify(e?.response?.data?.messages?.error || 'No se pudo cargar la transferencia', 'error');
    detalleVisible.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

function nombreProducto(productoId, varianteId) {
  const line = lineas.value.find((l) => l.producto_id === productoId && l.productoatributo_id === varianteId);
  if (!line) return `#${productoId}`;
  return line.variante ? `${line.nombre} · ${line.variante}` : line.nombre;
}

onMounted(async () => {
  await loadWarehouses();
  await loadTransfers();
});
</script>
