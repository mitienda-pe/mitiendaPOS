<template>
  <div
    class="bg-white overflow-hidden shadow rounded-lg border-l-4"
    :class="borderClass"
  >
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <slot name="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10"
              :class="iconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </slot>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ label }}</dt>
            <dd v-if="isLoading" class="mt-1">
              <div class="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
            </dd>
            <dd v-else class="flex items-baseline flex-wrap">
              <div class="text-2xl font-semibold text-gray-900">{{ formattedValue }}</div>
              <div
                v-if="delta !== null"
                class="ml-2 flex items-baseline text-sm font-semibold"
                :class="deltaClass"
              >
                <svg
                  v-if="delta > 0"
                  class="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="delta < 0"
                  class="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ formattedDelta }}</span>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  previous: { type: [Number, String, null], default: null },
  format: { type: String, default: 'number' }, // currency | number | decimal
  color: { type: String, default: 'primary' }, // primary | green | purple | red | blue | amber
  isLoading: { type: Boolean, default: false },
  invertDelta: { type: Boolean, default: false }
});

const colorMap = {
  primary: { border: 'border-primary-500', icon: 'text-primary-500' },
  green: { border: 'border-green-500', icon: 'text-green-500' },
  purple: { border: 'border-purple-500', icon: 'text-purple-500' },
  red: { border: 'border-red-500', icon: 'text-red-500' },
  blue: { border: 'border-blue-500', icon: 'text-blue-500' },
  amber: { border: 'border-amber-500', icon: 'text-amber-500' }
};

const borderClass = computed(() => colorMap[props.color]?.border || colorMap.primary.border);
const iconClass = computed(() => colorMap[props.color]?.icon || colorMap.primary.icon);

const formatCurrency = (n) => {
  const num = Number(n) || 0;
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (n) => Number(n || 0).toLocaleString('es-PE');
const formatDecimal = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const formattedValue = computed(() => {
  if (props.format === 'currency') return formatCurrency(props.value);
  if (props.format === 'decimal') return formatDecimal(props.value);
  return formatNumber(props.value);
});

const delta = computed(() => {
  if (props.previous === null || props.previous === undefined) return null;
  const prev = Number(props.previous);
  const curr = Number(props.value);
  if (!prev) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
});

const formattedDelta = computed(() => {
  if (delta.value === null) return '';
  const abs = Math.abs(delta.value);
  return `${abs.toFixed(0)}%`;
});

const deltaClass = computed(() => {
  if (delta.value === null || delta.value === 0) return 'text-gray-500';
  const positive = props.invertDelta ? delta.value < 0 : delta.value > 0;
  return positive ? 'text-green-600' : 'text-red-600';
});
</script>
