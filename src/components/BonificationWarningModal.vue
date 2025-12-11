<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="text-xl font-bold">Bonificaciones Sin Stock</h3>
            <p class="text-sm opacity-90">Las siguientes promociones no están disponibles</p>
          </div>
        </div>
        <button
          @click="cancel"
          class="text-white hover:text-gray-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="unavailableBonifications && unavailableBonifications.length > 0" class="space-y-4">
          <!-- Explanation -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-amber-800">
                <p class="font-medium">Los productos de esta venta califican para bonificaciones, pero no hay stock disponible en el almacén para los siguientes productos promocionales:</p>
              </div>
            </div>
          </div>

          <!-- List of unavailable bonifications -->
          <div
            v-for="bonif in unavailableBonifications"
            :key="bonif.product_id"
            class="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4"
          >
            <div class="flex items-start gap-4">
              <!-- Gift icon -->
              <div class="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clip-rule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>

              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  {{ bonif.product_name || bonif.name }}
                  <span class="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-medium">PROMOCIÓN</span>
                </h4>
                <p class="text-sm text-gray-600 mt-1">Cantidad bonificada: {{ bonif.quantity }}</p>

                <div class="mt-3 flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-sm">
                    <p class="font-medium text-amber-800">Stock agotado en el almacén</p>
                    <p class="text-gray-600 mt-1">Este producto no puede ser incluido en la venta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available bonifications (will be included) -->
        <div v-if="availableBonifications && availableBonifications.length > 0" class="mt-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-green-800">
                <p class="font-medium">Las siguientes bonificaciones SÍ están disponibles y serán incluidas en la venta:</p>
              </div>
            </div>
          </div>

          <div
            v-for="bonif in availableBonifications"
            :key="bonif.product_id"
            class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-3"
          >
            <div class="flex items-start gap-4">
              <!-- Gift icon -->
              <div class="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clip-rule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>

              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  {{ bonif.product_name || bonif.name }}
                  <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">DISPONIBLE</span>
                </h4>
                <p class="text-sm text-gray-600 mt-1">Cantidad bonificada: {{ bonif.quantity }}</p>

                <div class="mt-3 flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-sm">
                    <p class="font-medium text-green-800">Stock disponible</p>
                    <p class="text-gray-600 mt-1">Este producto será incluido en la venta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Decision prompt -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-2">¿Cómo desea proceder?</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li v-if="availableBonifications && availableBonifications.length > 0">
                  <strong>Continuar:</strong> La venta se procesará con las bonificaciones disponibles, excluyendo solo las que no tienen stock.
                </li>
                <li v-else>
                  <strong>Continuar sin bonificaciones:</strong> La venta se procesará normalmente pero sin los productos bonificados.
                </li>
                <li><strong>Cancelar:</strong> Podrá contactar al cliente para informarle sobre la situación.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div class="flex justify-end gap-3">
          <button
            @click="cancel"
            class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
          >
            Cancelar Venta
          </button>
          <button
            @click="proceed"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Continuar Sin Bonificaciones
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  unavailableBonifications: {
    type: Array,
    default: () => []
  },
  availableBonifications: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['proceed', 'cancel']);

const proceed = () => {
  emit('proceed');
};

const cancel = () => {
  emit('cancel');
};

// Close on ESC key
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        cancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }
});
</script>

<style scoped>
.bg-primary {
  background-color: #00b2a6;
}

.bg-primary-dark {
  background-color: #009688;
}
</style>
