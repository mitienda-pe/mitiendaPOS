<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all" @click.stop>
            <!-- Header -->
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Ingreso de mercadería · Lotes</h3>
                <button @click="close" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ product?.name }}</p>
            </div>

            <div class="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
              <!-- Lotes existentes -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Lotes registrados</h4>
                <div v-if="loadingLots" class="text-sm text-gray-400 py-2">Cargando…</div>
                <div v-else-if="lots.length === 0" class="text-sm text-gray-400 py-2">Aún no hay lotes. Registra el primero abajo.</div>
                <ul v-else class="divide-y divide-gray-100 border border-gray-100 rounded-md">
                  <li v-for="lot in lots" :key="lot.lote_id" class="flex items-center justify-between px-3 py-2 text-sm">
                    <div>
                      <span
                        class="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2"
                        :class="badgeClass(lot)"
                      >{{ estadoLabel(lot) }}</span>
                      <span class="text-gray-700">{{ lot.codigo || 'Sin código' }}</span>
                      <span class="text-gray-400 ml-2">
                        Vence: {{ lot.fecha_vencimiento || 'Sin caducidad' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-700">{{ lot.cantidad }}</span>
                      <button
                        v-if="lot.estado !== 2"
                        @click="doBaja(lot)"
                        :disabled="bajaLoadingId === lot.lote_id"
                        class="text-red-500 hover:text-red-600 disabled:opacity-50"
                        title="Dar de baja (merma)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Form de ingreso -->
              <form @submit.prevent="submit" class="space-y-4 border-t border-gray-100 pt-4">
                <h4 class="text-sm font-semibold text-gray-700">Registrar nuevo lote</h4>

                <div v-if="hasVariants">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Variante</label>
                  <select v-model.number="form.productoatributo_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                    <option :value="0">Selecciona una variante</option>
                    <option v-for="v in variants" :key="v.id" :value="v.id">{{ v.names }}</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                    <input v-model.number="form.cantidad" type="number" min="0" step="1" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500" placeholder="0" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Código de lote</label>
                    <input v-model="form.codigo" type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500" placeholder="Opcional" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                    <input v-model="form.fecha_vencimiento" type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de producción</label>
                    <input v-model="form.fecha_produccion" type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>

                <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>

                <div class="flex gap-3 pt-1">
                  <button type="button" @click="close" :disabled="saving"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cerrar
                  </button>
                  <button type="submit" :disabled="saving"
                    class="flex-1 px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                    <span v-if="!saving">Registrar lote</span>
                    <span v-else>Guardando…</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { inventoryApi } from '../services/inventoryApi';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  product: { type: Object, default: null }
});

const emit = defineEmits(['close', 'changed']);

const lots = ref([]);
const loadingLots = ref(false);
const saving = ref(false);
const bajaLoadingId = ref(null);
const error = ref(null);
const variants = ref([]);

const hasVariants = computed(() => !!(props.product?.has_variants || props.product?.has_variation_attributes));

const form = reactive({
  productoatributo_id: 0,
  cantidad: null,
  codigo: '',
  fecha_vencimiento: '',
  fecha_produccion: ''
});

function resetForm() {
  form.productoatributo_id = 0;
  form.cantidad = null;
  form.codigo = '';
  form.fecha_vencimiento = '';
  form.fecha_produccion = '';
  error.value = null;
}

async function loadLots() {
  if (!props.product?.id) return;
  loadingLots.value = true;
  try {
    const data = await inventoryApi.getProductLots(props.product.id);
    lots.value = data?.items ?? [];
  } catch {
    lots.value = [];
  } finally {
    loadingLots.value = false;
  }
}

function estadoLabel(lot) {
  if (lot.estado === 2) return 'Baja';
  if (lot.estado === 0) return 'Agotado';
  if (lot.vencido) return 'Vencido';
  return 'Activo';
}

function badgeClass(lot) {
  if (lot.estado === 2 || lot.estado === 0) return 'bg-gray-100 text-gray-600';
  if (lot.vencido) return 'bg-red-100 text-red-700';
  return 'bg-green-100 text-green-700';
}

async function submit() {
  error.value = null;
  if (!form.cantidad || form.cantidad <= 0) {
    error.value = 'Indica una cantidad mayor a 0';
    return;
  }
  if (hasVariants.value && !form.productoatributo_id) {
    error.value = 'Selecciona la variante del lote';
    return;
  }
  saving.value = true;
  try {
    await inventoryApi.createLot(props.product.id, {
      productoatributo_id: hasVariants.value ? form.productoatributo_id : 0,
      cantidad: form.cantidad,
      codigo: form.codigo || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      fecha_produccion: form.fecha_produccion || null
    });
    resetForm();
    await loadLots();
    emit('changed');
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo registrar el lote';
  } finally {
    saving.value = false;
  }
}

async function doBaja(lot) {
  bajaLoadingId.value = lot.lote_id;
  try {
    await inventoryApi.bajaLot(lot.lote_id);
    await loadLots();
    emit('changed');
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo dar de baja el lote';
  } finally {
    bajaLoadingId.value = null;
  }
}

function close() {
  if (!saving.value) emit('close');
}

watch(() => props.isOpen, async (open) => {
  if (open) {
    resetForm();
    await loadLots();
  }
});

// Variantes: el listado del POS no siempre las trae; si el producto ya las expone, úsalas.
watch(() => props.product, (p) => {
  variants.value = Array.isArray(p?.variants)
    ? p.variants.map(v => ({ id: v.id ?? v.productoatributo_id, names: v.names ?? v.name ?? `Variante ${v.id}` }))
    : [];
}, { immediate: true });
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
