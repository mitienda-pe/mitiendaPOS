<template>
  <div>
    <!-- Buscador -->
    <div class="relative">
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
        @input="onSearchInput"
        @focus="showResults = true"
      />
      <div v-if="searching" class="absolute right-3 top-2.5">
        <svg class="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <div
        v-if="showResults && results.length"
        class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto"
      >
        <button
          v-for="p in results"
          :key="p.producto_id"
          type="button"
          class="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between gap-3"
          @click="onSelect(p)"
        >
          <span class="min-w-0">
            <span class="block text-sm text-gray-800 truncate">{{ p.nombre }}</span>
            <span class="block text-xs text-gray-500">{{ p.sku || 'sin SKU' }}</span>
          </span>
        </button>
      </div>
    </div>

    <p v-if="!modelValue.length" class="text-sm text-gray-500 mt-3">Todavía no agregaste productos.</p>

    <!-- Líneas -->
    <div v-else class="mt-3 border border-gray-200 rounded-lg divide-y">
      <div
        v-for="line in modelValue"
        :key="`${line.producto_id}:${line.productoatributo_id}`"
        class="flex items-center gap-3 p-3"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800 truncate">
            {{ line.nombre }}
            <span v-if="line.variante" class="text-gray-500">· {{ line.variante }}</span>
          </p>
          <p class="text-xs" :class="excede(line) ? 'text-red-600' : 'text-gray-500'">
            {{ line.sku || 'sin SKU' }}
            <span v-if="line.disponible !== null && line.disponible !== undefined">
              · disponible: {{ line.disponible }}
            </span>
          </p>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="w-8 h-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            @click="updateQty(line, line.cantidad - 1)"
          >
            −
          </button>
          <input
            :value="line.cantidad"
            type="number"
            min="1"
            class="w-16 text-center border border-gray-300 rounded-md px-1 py-1.5 text-sm"
            @input="updateQty(line, Number($event.target.value))"
          />
          <button
            type="button"
            class="w-8 h-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            @click="updateQty(line, line.cantidad + 1)"
          >
            +
          </button>
        </div>

        <button
          type="button"
          class="text-gray-400 hover:text-red-600 p-1"
          aria-label="Quitar producto"
          @click="remove(line)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <p v-if="modelValue.some(excede)" class="text-sm text-red-600 mt-2">
      Hay líneas que superan el stock disponible.
    </p>

    <!-- Selector de variante -->
    <div v-if="variantDialog" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="px-4 py-3 border-b flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800 truncate">{{ variantProduct?.nombre }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="variantDialog = false">✕</button>
        </div>

        <div class="p-4">
          <div v-if="variantLoading" class="py-6 text-center text-gray-400">Cargando variantes…</div>
          <p v-else-if="!variants.length" class="text-sm text-gray-500 py-4">
            Este producto no tiene variantes activas.
          </p>
          <div v-else class="border border-gray-200 rounded-lg divide-y max-h-72 overflow-y-auto">
            <div
              v-for="v in variants"
              :key="v.productoatributo_id"
              class="flex items-center justify-between gap-3 p-3"
            >
              <div class="min-w-0">
                <p class="text-sm text-gray-800 truncate">{{ v.nombre || `Variante ${v.productoatributo_id}` }}</p>
                <p class="text-xs text-gray-500">
                  {{ v.stock_ilimitado ? 'stock ilimitado' : `disponible: ${v.stock}` }}
                </p>
              </div>
              <button
                type="button"
                class="text-xs px-3 py-1.5 rounded border"
                :class="yaAgregada(variantProduct?.producto_id, v.productoatributo_id)
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-primary-500 text-primary-600 hover:bg-primary-50'"
                :disabled="yaAgregada(variantProduct?.producto_id, v.productoatributo_id)"
                @click="agregarVariante(v)"
              >
                {{ yaAgregada(variantProduct?.producto_id, v.productoatributo_id) ? 'Agregada' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t text-right">
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="variantDialog = false">
            Listo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Editor de líneas para movimientos y transferencias de inventario.
 *
 * El saldo disponible se resuelve por producto al agregarlo (`/inventory/stock`),
 * que además es lo único que sabe de variantes: el listado de stock por almacén
 * solo expone el nivel producto.
 */
import { ref } from 'vue';
import { productsApi } from '../../services/productsApi';
import { stockMovementsApi } from '../../services/stockMovementsApi';

const props = defineProps({
  modelValue: { type: Array, required: true },
  /** Almacén sobre el que se consultan los saldos. */
  almacenId: { type: Number, default: null },
  placeholder: { type: String, default: 'Buscar producto por nombre o SKU...' },
});

const emit = defineEmits(['update:modelValue']);

const query = ref('');
const results = ref([]);
const searching = ref(false);
const showResults = ref(false);
let searchTimer = null;

const variantDialog = ref(false);
const variantLoading = ref(false);
const variantProduct = ref(null);
const variants = ref([]);

function key(productoId, varianteId) {
  return `${productoId}:${varianteId}`;
}

function yaAgregada(productoId, varianteId) {
  if (!productoId) return false;
  return props.modelValue.some((l) => key(l.producto_id, l.productoatributo_id) === key(productoId, varianteId));
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(search, 350);
}

async function search() {
  const q = query.value.trim();
  if (q.length < 2) {
    results.value = [];
    return;
  }
  searching.value = true;
  try {
    const response = await productsApi.getProducts({ search: q, limit: 10 });
    results.value = (response?.data ?? []).map((p) => ({
      producto_id: p.id,
      nombre: p.name,
      sku: p.sku,
    }));
    showResults.value = true;
  } catch {
    results.value = [];
  } finally {
    searching.value = false;
  }
}

/**
 * Una sola consulta a `/inventory/stock` resuelve las dos cosas: si el producto
 * tiene variantes (y hay que elegir una) y cuál es su saldo en el almacén.
 *
 * No se usa el `has_variants` del buscador a propósito: el POS busca por
 * MeiliSearch y ese índice no lo trae, así que llega SIEMPRE en false y los
 * productos con variantes se agregarían como simples, moviendo stock del padre.
 */
async function onSelect(producto) {
  query.value = '';
  results.value = [];
  showResults.value = false;

  variantProduct.value = producto;
  variants.value = [];
  variantLoading.value = true;
  variantDialog.value = true;

  let data = null;
  try {
    data = await stockMovementsApi.stock(producto.producto_id, props.almacenId);
  } catch {
    data = null;
  } finally {
    variantLoading.value = false;
  }

  const variantes = data?.variantes ?? [];
  if (variantes.length) {
    variants.value = variantes;
    return;
  }

  // Producto simple: no hay nada que elegir.
  variantDialog.value = false;
  if (yaAgregada(producto.producto_id, 0)) return;

  const stock = data?.producto;
  emit('update:modelValue', [
    ...props.modelValue,
    {
      producto_id: producto.producto_id,
      productoatributo_id: 0,
      nombre: producto.nombre,
      variante: '',
      sku: producto.sku,
      cantidad: 1,
      disponible: stock && !stock.stock_ilimitado ? stock.stock : null,
    },
  ]);
}

function agregarVariante(v) {
  const producto = variantProduct.value;
  if (!producto || yaAgregada(producto.producto_id, v.productoatributo_id)) return;

  emit('update:modelValue', [
    ...props.modelValue,
    {
      producto_id: producto.producto_id,
      productoatributo_id: v.productoatributo_id,
      nombre: producto.nombre,
      variante: v.nombre ?? '',
      sku: producto.sku,
      cantidad: 1,
      disponible: v.stock_ilimitado ? null : v.stock,
    },
  ]);
}

function remove(line) {
  emit(
    'update:modelValue',
    props.modelValue.filter(
      (l) => key(l.producto_id, l.productoatributo_id) !== key(line.producto_id, line.productoatributo_id)
    )
  );
}

function updateQty(line, cantidad) {
  const value = Math.max(1, Number.isFinite(cantidad) ? cantidad : 1);
  emit(
    'update:modelValue',
    props.modelValue.map((l) =>
      key(l.producto_id, l.productoatributo_id) === key(line.producto_id, line.productoatributo_id)
        ? { ...l, cantidad: value }
        : l
    )
  );
}

function excede(line) {
  return line.disponible !== null && line.disponible !== undefined && line.cantidad > line.disponible;
}
</script>
