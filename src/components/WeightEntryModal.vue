<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <!-- Encabezado -->
          <div class="flex justify-between items-start mb-4">
            <div class="min-w-0">
              <h3 class="text-lg leading-6 font-medium text-gray-900 truncate">{{ product?.nombre || 'Producto' }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ formatCurrency(pricePerUnit) }} / {{ unit }}</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Cerrar">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Selector de modo: por peso o por monto -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              class="py-2 text-sm font-medium rounded-lg border transition-colors"
              :class="mode === 'weight' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="setMode('weight')"
            >
              Por peso ({{ unit }})
            </button>
            <button
              type="button"
              class="py-2 text-sm font-medium rounded-lg border transition-colors"
              :class="mode === 'amount' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="setMode('amount')"
            >
              Por monto (S/)
            </button>
          </div>

          <!-- Display del valor ingresado -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 mb-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-gray-500 uppercase">{{ mode === 'weight' ? 'Peso' : 'Monto' }}</span>
              <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                <template v-if="mode === 'weight'">{{ entry || '0' }} <span class="text-base text-gray-400">{{ unit }}</span></template>
                <template v-else><span class="text-base text-gray-400">S/</span> {{ entry || '0' }}</template>
              </span>
            </div>
          </div>

          <!-- Resumen calculado -->
          <div class="flex items-center justify-between text-sm mb-4 px-1">
            <span class="text-gray-500">
              {{ formatWeight(computedWeight) }} {{ unit }} × {{ formatCurrency(pricePerUnit) }}
            </span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(computedTotal) }}</span>
          </div>

          <!-- Atajos rápidos -->
          <div class="grid grid-cols-4 gap-2 mb-3">
            <button
              v-for="q in quickWeights"
              :key="q"
              type="button"
              class="py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-primary-50 hover:border-primary-400"
              @click="setQuickWeight(q)"
            >
              {{ q }} {{ unit }}
            </button>
          </div>

          <!-- Keypad -->
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="key in keys"
              :key="key.value"
              type="button"
              class="py-3 text-lg font-medium rounded-lg border border-gray-200 text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              @click="press(key.value)"
            >
              <span v-if="key.value === 'back'">⌫</span>
              <span v-else>{{ key.value }}</span>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between gap-2">
          <button
            @click="clear"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            type="button"
            :disabled="computedWeight <= 0"
            class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            :class="computedWeight > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'"
            @click="confirm"
          >
            Agregar · {{ formatCurrency(computedTotal) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Producto base en formato POS ({ id, nombre, precio, sale_unit, __initialWeight? })
  product: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'close']);

const mode = ref('weight'); // 'weight' | 'amount'
const entry = ref('');      // string del valor en edición (peso o monto)

const quickWeights = [0.1, 0.25, 0.5, 1];

const keys = [
  { value: '1' }, { value: '2' }, { value: '3' },
  { value: '4' }, { value: '5' }, { value: '6' },
  { value: '7' }, { value: '8' }, { value: '9' },
  { value: '.' }, { value: '0' }, { value: 'back' },
];

const pricePerUnit = computed(() => Number(props.product?.precio) || 0);
const unit = computed(() => props.product?.sale_unit || 'kg');

// Peso resultante (kg) según el modo: directo, o monto / precio.
const computedWeight = computed(() => {
  const n = parseFloat(entry.value) || 0;
  if (n <= 0) return 0;
  if (mode.value === 'weight') return n;
  // Modo monto: peso = monto / precio por unidad.
  return pricePerUnit.value > 0 ? n / pricePerUnit.value : 0;
});

const computedTotal = computed(() => computedWeight.value * pricePerUnit.value);

const formatWeight = (value) => {
  const n = Number(value) || 0;
  return parseFloat(n.toFixed(3)).toString();
};

const press = (key) => {
  if (key === 'back') {
    entry.value = entry.value.slice(0, -1);
    return;
  }
  if (key === '.') {
    if (entry.value.includes('.')) return;
    entry.value = entry.value === '' ? '0.' : entry.value + '.';
    return;
  }
  // Evitar ceros a la izquierda redundantes.
  if (entry.value === '0') {
    entry.value = key;
    return;
  }
  // Límite de decimales: 3 para peso, 2 para monto.
  const maxDecimals = mode.value === 'weight' ? 3 : 2;
  const dot = entry.value.indexOf('.');
  if (dot !== -1 && entry.value.length - dot - 1 >= maxDecimals) return;
  entry.value += key;
};

const setMode = (m) => {
  if (mode.value === m) return;
  mode.value = m;
  entry.value = '';
};

const setQuickWeight = (q) => {
  mode.value = 'weight';
  entry.value = String(q);
};

const clear = () => {
  entry.value = '';
};

const confirm = () => {
  const w = computedWeight.value;
  if (w <= 0) return;
  // Redondear a 3 decimales (gramos) para empatar la columna DECIMAL(10,3).
  emit('confirm', parseFloat(w.toFixed(3)));
};

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

// Al abrir: resetear y precargar el peso inicial si se está editando una línea.
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      mode.value = 'weight';
      const initial = props.product?.__initialWeight;
      entry.value = initial != null && Number(initial) > 0 ? formatWeight(initial) : '';
    }
  }
);
</script>
