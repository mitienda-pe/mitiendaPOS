<template>
  <div class="bg-white rounded-lg shadow p-3 flex flex-wrap items-center gap-2">
    <div class="flex gap-1">
      <button
        v-for="opt in presets"
        :key="opt.value"
        type="button"
        class="px-3 py-1.5 text-sm rounded-md transition-colors"
        :class="
          modelValue.preset === opt.value
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        "
        @click="$emit('preset', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="flex items-center gap-1 ml-2">
      <input
        type="date"
        :value="modelValue.dateFrom"
        :max="modelValue.dateTo"
        class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        @change="onFromChange"
      />
      <span class="text-gray-400 text-sm">—</span>
      <input
        type="date"
        :value="modelValue.dateTo"
        :min="modelValue.dateFrom"
        class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        @change="onToChange"
      />
    </div>

    <label class="flex items-center gap-2 ml-auto text-sm text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="!!modelValue.compare"
        class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
        @change="$emit('toggle-compare')"
      />
      <span>Comparar con período anterior</span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true }
});

const emit = defineEmits(['preset', 'custom-range', 'toggle-compare']);

const presets = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' }
];

const onFromChange = (e) => {
  emit('custom-range', { dateFrom: e.target.value, dateTo: props.modelValue.dateTo });
};
const onToChange = (e) => {
  emit('custom-range', { dateFrom: props.modelValue.dateFrom, dateTo: e.target.value });
};
</script>
