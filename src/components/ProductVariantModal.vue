<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <!-- Encabezado -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Elegir variación</h3>
              <p class="text-sm text-gray-500 mt-1">{{ product?.nombre || 'Producto' }}</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Cerrar">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cargando -->
          <div v-if="loading" class="py-10 text-center text-gray-500">
            <svg class="animate-spin h-6 w-6 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p class="mt-2 text-sm">Cargando variaciones…</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="py-8 text-center">
            <p class="text-sm text-red-600">{{ error }}</p>
            <button @click="loadVariants" class="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Reintentar
            </button>
          </div>

          <!-- Sin variaciones -->
          <div v-else-if="variants.length === 0" class="py-8 text-center text-gray-500">
            <p class="text-sm">Este producto no tiene variaciones disponibles.</p>
          </div>

          <!-- Lista de variaciones -->
          <ul v-else class="divide-y divide-gray-100 max-h-80 overflow-y-auto -mx-2">
            <li v-for="variant in variants" :key="variant.id">
              <button
                type="button"
                :disabled="!isAvailable(variant)"
                @click="choose(variant)"
                class="w-full flex items-center justify-between gap-3 px-2 py-3 text-left rounded-lg transition-colors"
                :class="isAvailable(variant)
                  ? 'hover:bg-primary-50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ variant.names || ('Variación #' + variant.id) }}
                  </p>
                  <p v-if="variant.sku" class="text-xs text-gray-400 truncate">SKU: {{ variant.sku }}</p>
                </div>

                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(variant.price) }}</p>
                  <span
                    class="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full"
                    :class="stockBadgeClass(variant)"
                  >
                    {{ stockLabel(variant) }}
                  </span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
          <button
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { productsApi } from '../services/productsApi';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Producto base en formato POS ({ id, nombre, precio, ... })
  product: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'select']);

const loading = ref(false);
const error = ref('');
const variants = ref([]);
const attributes = ref([]);

// La variación está disponible si tiene stock ilimitado o stock > 0.
const isAvailable = (variant) => variant.unlimited_stock === true || Number(variant.stock) > 0;

const stockLabel = (variant) => {
  if (variant.unlimited_stock) return 'Disponible';
  const stock = Number(variant.stock) || 0;
  return stock > 0 ? `Stock: ${stock}` : 'Agotado';
};

const stockBadgeClass = (variant) => {
  if (variant.unlimited_stock || Number(variant.stock) > 0) {
    return 'bg-primary-50 text-primary-700';
  }
  return 'bg-red-50 text-red-600';
};

const loadVariants = async () => {
  if (!props.product?.id) return;
  loading.value = true;
  error.value = '';
  try {
    const response = await productsApi.getVariants(props.product.id);
    variants.value = response.variants || [];
    attributes.value = response.attributes || [];
  } catch (e) {
    console.error('Error cargando variaciones:', e);
    error.value = 'No se pudieron cargar las variaciones. Intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const choose = (variant) => {
  if (!isAvailable(variant)) return;
  emit('select', variant);
  close();
};

const close = () => {
  emit('update:modelValue', false);
};

// Cargar variaciones al abrir el modal.
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      variants.value = [];
      attributes.value = [];
      loadVariants();
    }
  }
);
</script>
