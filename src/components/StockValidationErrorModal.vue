<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="text-xl font-bold">Productos No Disponibles</h3>
            <p class="text-sm opacity-90">No se puede completar la venta</p>
          </div>
        </div>
        <button
          @click="close"
          class="text-white hover:text-gray-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="unavailableItems && unavailableItems.length > 0" class="space-y-4">
          <!-- List of unavailable items -->
          <div
            v-for="item in unavailableItems"
            :key="item.product_id || item.sku"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <!-- Product not found in NetSuite (no stock data) -->
            <div v-if="item.reason === 'not_found_in_netsuite'" class="flex items-start gap-4">
              <div class="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-lg">{{ item.product_name }}</h4>
                <p class="text-sm text-gray-600 mt-1">SKU: {{ item.sku }}</p>
                <div class="mt-3 p-3 bg-white border border-red-300 rounded">
                  <p class="text-red-700 font-medium">{{ item.message }}</p>
                </div>
              </div>
            </div>

            <!-- Insufficient stock (has stock data) -->
            <div v-else>
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ item.product_name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">SKU: {{ item.sku }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Solicitado</div>
                  <div class="text-2xl font-bold text-gray-900">{{ item.requested }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Disponible</div>
                  <div class="text-2xl font-bold text-red-600">{{ item.available }}</div>
                </div>
              </div>

              <!-- Stock status -->
              <div class="mt-3 pt-3 border-t border-red-200">
                <div v-if="item.available === 0" class="flex items-center gap-2 text-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm font-medium">Producto agotado</span>
                </div>
                <div v-else class="flex items-center gap-2 text-orange-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm font-medium">Stock insuficiente (Faltante: {{ item.requested - item.available }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional message -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Para continuar:</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>Retira los productos indicados del carrito</li>
                <li>Contacta al administrador si necesitas ayuda</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div class="flex justify-end gap-3">
          <button
            @click="close"
            class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  unavailableItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

// Close on ESC key
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }
});
</script>
