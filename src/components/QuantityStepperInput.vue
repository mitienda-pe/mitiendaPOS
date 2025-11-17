<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    default: 1
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: Infinity
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Para solicitar confirmación cuando llega a 0
  confirmOnZero: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm-remove']);

// Estado local para edición
const inputValue = ref(props.modelValue.toString());
const isEditing = ref(false);

// Observar cambios en modelValue para actualizar el input
watch(() => props.modelValue, (newValue) => {
  if (!isEditing.value) {
    inputValue.value = newValue.toString();
  }
});

const decrement = () => {
  if (props.disabled) return;

  const currentValue = props.modelValue;

  // Si va a llegar a 0 y confirmOnZero está activo, emitir evento de confirmación
  if (currentValue === 1 && props.confirmOnZero) {
    emit('confirm-remove');
    return;
  }

  // Si ya es el mínimo, no hacer nada
  if (currentValue <= props.min) return;

  const newValue = Math.max(props.min, currentValue - 1);
  emit('update:modelValue', newValue);
};

const increment = () => {
  if (props.disabled) return;

  const currentValue = props.modelValue;

  // Si ya es el máximo, no hacer nada
  if (currentValue >= props.max) return;

  const newValue = Math.min(props.max, currentValue + 1);
  emit('update:modelValue', newValue);
};

const onInputFocus = () => {
  if (props.disabled) return;
  isEditing.value = true;
  // Seleccionar todo el texto al hacer focus
  setTimeout(() => {
    const input = document.getElementById('quantity-input');
    if (input) input.select();
  }, 0);
};

const onInputBlur = () => {
  isEditing.value = false;
  validateAndUpdate();
};

const onInputKeydown = (event) => {
  // Enter: guardar y salir
  if (event.key === 'Enter') {
    event.preventDefault();
    validateAndUpdate();
    event.target.blur();
  }

  // Escape: cancelar y restaurar valor original
  if (event.key === 'Escape') {
    event.preventDefault();
    inputValue.value = props.modelValue.toString();
    event.target.blur();
  }

  // Solo permitir números y teclas de control
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
  if (!allowedKeys.includes(event.key) && isNaN(event.key)) {
    event.preventDefault();
  }
};

const validateAndUpdate = () => {
  // Intentar parsear el valor
  let numValue = parseInt(inputValue.value, 10);

  // Si no es un número válido, restaurar el valor anterior
  if (isNaN(numValue)) {
    inputValue.value = props.modelValue.toString();
    return;
  }

  // Aplicar límites
  numValue = Math.max(props.min, Math.min(props.max, numValue));

  // Si cambió el valor, emitir actualización
  if (numValue !== props.modelValue) {
    emit('update:modelValue', numValue);
  }

  // Actualizar el input con el valor validado
  inputValue.value = numValue.toString();
};

// Computed para deshabilitar botones
const canDecrement = computed(() => {
  return !props.disabled && props.modelValue > props.min;
});

const canIncrement = computed(() => {
  return !props.disabled && props.modelValue < props.max;
});
</script>

<template>
  <div class="flex items-center space-x-1">
    <!-- Botón Decrementar -->
    <button
      @click="decrement"
      :disabled="!canDecrement"
      class="p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      :class="{ 'hover:bg-red-100': modelValue === 1 && confirmOnZero }"
      :title="modelValue === 1 && confirmOnZero ? 'Eliminar producto' : 'Disminuir cantidad'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        :class="{ 'text-red-600': modelValue === 1 && confirmOnZero }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Input Editable -->
    <input
      id="quantity-input"
      v-model="inputValue"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :disabled="disabled"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @keydown="onInputKeydown"
      class="w-12 text-center text-sm font-medium border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      :class="{ 'bg-blue-50': isEditing }"
    />

    <!-- Botón Incrementar -->
    <button
      @click="increment"
      :disabled="!canIncrement"
      class="p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      title="Aumentar cantidad"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  </div>
</template>
