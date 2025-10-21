<template>
  <div class="p-3 border border-gray-300 rounded-lg bg-gray-50">
    <h4 class="text-sm font-medium text-gray-700 mb-3">{{ title }}</h4>

    <!-- Billetes -->
    <div class="mb-3">
      <h5 class="text-xs font-medium text-gray-600 mb-2 uppercase">Billetes</h5>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="bill in DENOMINATIONS.bills" :key="bill" class="flex items-center space-x-2">
          <label class="text-xs font-medium text-gray-700 w-16">S/ {{ bill }}</label>
          <input
            type="number"
            :value="counts[bill] || 0"
            @input="updateCount(bill, $event.target.value)"
            min="0"
            step="1"
            placeholder="0"
            class="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
          />
          <span class="text-xs text-gray-500 w-16 text-right">
            S/ {{ (bill * (counts[bill] || 0)).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Monedas -->
    <div>
      <h5 class="text-xs font-medium text-gray-600 mb-2 uppercase">Monedas</h5>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="coin in DENOMINATIONS.coins" :key="coin" class="flex items-center space-x-2">
          <label class="text-xs font-medium text-gray-700 w-16">S/ {{ coin.toFixed(2) }}</label>
          <input
            type="number"
            :value="counts[coin] || 0"
            @input="updateCount(coin, $event.target.value)"
            min="0"
            step="1"
            placeholder="0"
            class="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
          />
          <span class="text-xs text-gray-500 w-16 text-right">
            S/ {{ (coin * (counts[coin] || 0)).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Total del desglose -->
    <div class="mt-3 pt-3 border-t border-gray-300">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">{{ totalLabel }}:</span>
        <span class="text-lg font-bold text-gray-900">S/ {{ total.toFixed(2) }}</span>
      </div>

      <!-- Diferencia (si la hay y se espera un monto) -->
      <div v-if="expectedAmount !== null && Math.abs(difference) > 0.01"
           class="mt-2 p-2 rounded"
           :class="matches ? 'bg-green-50' : 'bg-red-50'">
        <div class="flex items-center justify-between text-sm">
          <span :class="matches ? 'text-green-700' : 'text-red-700'">
            {{ matches ? '✓ Coincide' : '✗ No coincide' }}
          </span>
          <span :class="matches ? 'text-green-700 font-medium' : 'text-red-700 font-medium'">
            {{ difference > 0 ? 'Sobrante' : 'Faltante' }}: S/ {{ Math.abs(difference).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DENOMINATIONS } from '../utils/cashDenominations.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  expectedAmount: {
    type: Number,
    default: null
  },
  title: {
    type: String,
    default: 'Arqueo - Conteo de denominaciones'
  },
  totalLabel: {
    type: String,
    default: 'Total contado'
  }
});

const emit = defineEmits(['update:modelValue', 'update:total']);

const counts = computed(() => props.modelValue);

const total = computed(() => {
  let sum = 0;
  for (const [denomination, count] of Object.entries(counts.value)) {
    sum += parseFloat(denomination) * parseInt(count || 0);
  }
  return Math.round(sum * 100) / 100;
});

const difference = computed(() => {
  if (props.expectedAmount === null) return 0;
  return Math.round((total.value - props.expectedAmount) * 100) / 100;
});

const matches = computed(() => {
  if (props.expectedAmount === null) return true;
  return Math.abs(difference.value) < 0.01;
});

const updateCount = (denomination, value) => {
  const newCounts = { ...counts.value };
  newCounts[denomination] = parseInt(value) || 0;
  emit('update:modelValue', newCounts);
  emit('update:total', total.value);
};
</script>
