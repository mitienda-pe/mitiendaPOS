<template>
  <div class="inline-edit-field">
    <div
      v-if="!isEditing"
      @click="startEditing"
      class="inline-edit-display cursor-pointer px-3 py-2 rounded hover:bg-gray-50 transition-colors min-h-[38px] flex items-center"
      :class="{ 'text-gray-400 italic': !displayValue }"
    >
      {{ displayValue || placeholder }}
    </div>

    <div v-else class="inline-edit-input relative">
      <input
        ref="inputRef"
        v-model="editValue"
        type="text"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="isSaving"
        @keydown.enter="save"
        @keydown.esc="cancel"
        @blur="save"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{
          'border-gray-300': !isSaving && !error,
          'border-green-500 bg-green-50': isSaving,
          'border-red-500 bg-red-50': error
        }"
      />

      <div v-if="isSaving" class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <div v-if="error" class="text-red-600 text-xs mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Click para editar'
  },
  maxlength: {
    type: Number,
    default: 50
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const isEditing = ref(false);
const isSaving = ref(false);
const editValue = ref('');
const error = ref('');
const inputRef = ref(null);

const displayValue = ref(props.modelValue || '');

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  displayValue.value = newValue || '';
  if (!isEditing.value) {
    editValue.value = newValue || '';
  }
});

const startEditing = () => {
  if (isSaving.value) return;

  editValue.value = props.modelValue || '';
  isEditing.value = true;
  error.value = '';

  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const cancel = () => {
  editValue.value = props.modelValue || '';
  isEditing.value = false;
  error.value = '';
};

const save = async () => {
  if (isSaving.value) return;

  // If value hasn't changed, just exit edit mode
  if (editValue.value === props.modelValue) {
    isEditing.value = false;
    return;
  }

  try {
    isSaving.value = true;
    error.value = '';

    // Emit save event and wait for parent to handle it
    await emit('save', editValue.value);

    // Update display value and exit edit mode
    displayValue.value = editValue.value;
    emit('update:modelValue', editValue.value);
    isEditing.value = false;
  } catch (err) {
    error.value = err.message || 'Error al guardar';
    // Keep in edit mode on error
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.inline-edit-field {
  width: 100%;
}
</style>
