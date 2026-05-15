<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="!optional" class="text-red-500">*</span>
    </label>
    <input
      :value="modelValue"
      type="text"
      inputmode="numeric"
      :placeholder="optional ? 'Opcional' : 'Sin configurar'"
      :class="[
        'block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border focus:outline-none focus:ring-2',
        showError
          ? 'border-red-400 focus:ring-red-200 bg-red-50'
          : 'border-gray-300 focus:ring-primary/40 focus:border-primary',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="showError" class="mt-1 text-xs text-red-600">
      Campo obligatorio sin valor — el sync NetSuite va a fallar.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  label: { type: String, required: true },
  /** True when the validate API reports this field as missing. */
  missing: { type: Boolean, default: false },
  /** Optional field — never highlights as required even when empty. */
  optional: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);

const showError = computed(() => {
  if (props.optional) return false;
  if (props.missing) return true;
  return props.modelValue === '' || props.modelValue === null || props.modelValue === undefined;
});
</script>
