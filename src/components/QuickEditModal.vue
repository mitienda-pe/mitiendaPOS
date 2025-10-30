<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ readOnly ? 'Detalle del Producto' : 'Edición Rápida' }}
                </h3>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ product?.name }}</p>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
              <!-- SKU (solo lectura) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  :value="product?.sku"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <!-- Precio -->
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                  Precio (S/)
                </label>
                <input
                  id="price"
                  ref="priceInput"
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  :required="!readOnly"
                  :disabled="readOnly"
                  :class="readOnly ? 'w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'"
                  placeholder="0.00"
                />
              </div>

              <!-- Stock -->
              <div>
                <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
                  Stock Actual
                </label>
                <input
                  id="stock"
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  :required="!readOnly"
                  :disabled="readOnly"
                  :class="readOnly ? 'w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'"
                  placeholder="0"
                />
              </div>

              <!-- Info adicional -->
              <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div class="flex items-start">
                  <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-sm text-blue-700">
                    <p class="font-medium">Stock mínimo: {{ product?.min_stock || 5 }} unidades</p>
                    <p v-if="form.stock <= (product?.min_stock || 5)" class="mt-1 text-red-600 font-semibold">
                      ⚠️ El stock está por debajo del mínimo
                    </p>
                  </div>
                </div>
              </div>

              <!-- Error message -->
              <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>

              <!-- Footer -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  :class="readOnly ? 'w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors' : 'flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'"
                  :disabled="loading"
                >
                  {{ readOnly ? 'Cerrar' : 'Cancelar' }}
                </button>
                <button
                  v-if="!readOnly"
                  type="submit"
                  class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="loading"
                >
                  <span v-if="!loading">Guardar Cambios</span>
                  <span v-else class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  price: 0,
  stock: 0
});

const loading = ref(false);
const error = ref(null);
const priceInput = ref(null);

// Watch para actualizar el formulario cuando cambia el producto
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      price: newProduct.price || 0,
      stock: newProduct.stock || 0
    };
    error.value = null;
  }
}, { immediate: true });

// Focus automático en el campo de precio cuando se abre el modal
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    priceInput.value?.focus();
    priceInput.value?.select();
  }
});

const closeModal = () => {
  if (!loading.value) {
    emit('close');
  }
};

const handleSubmit = async () => {
  error.value = null;
  loading.value = true;

  try {
    // Validaciones básicas
    if (form.value.price < 0) {
      error.value = 'El precio no puede ser negativo';
      return;
    }

    if (form.value.stock < 0) {
      error.value = 'El stock no puede ser negativo';
      return;
    }

    // Emitir evento con los datos
    emit('save', {
      productId: props.product.id,
      price: form.value.price,
      stock: form.value.stock
    });

    // El componente padre cerrará el modal después de guardar
  } catch (err) {
    console.error('Error en handleSubmit:', err);
    error.value = err.message || 'Error al guardar los cambios';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Animaciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div > div,
.modal-leave-active > div > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div > div,
.modal-leave-to > div > div {
  transform: scale(0.95);
}

/* Animación del spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
