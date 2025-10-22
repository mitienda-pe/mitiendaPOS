<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="handleCancel"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
                Venta Guardada Detectada
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-700 mb-4">
                  El cliente <strong class="text-blue-600">{{ customerName }}</strong> ya tiene una venta guardada.
                </p>
                <p class="text-sm text-gray-600 mb-4">
                  ¿Qué deseas hacer?
                </p>

                <!-- Comparación de ventas -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Venta Guardada -->
                  <div class="border rounded-lg p-3 bg-gray-50">
                    <h4 class="font-medium text-sm text-gray-700 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Venta Guardada
                    </h4>
                    <div class="text-xs text-gray-600 space-y-1">
                      <p><span class="font-medium">Fecha:</span> {{ formatDate(existingSale.timestamp) }}</p>
                      <p><span class="font-medium">Productos:</span> {{ existingSale.items?.length || 0 }}</p>
                      <p><span class="font-medium">Total:</span> {{ formatCurrency(calculateTotal(existingSale.items)) }}</p>
                    </div>
                    <div v-if="existingSale.items && existingSale.items.length > 0" class="mt-2 max-h-32 overflow-y-auto border-t pt-2">
                      <div v-for="item in existingSale.items" :key="item.id" class="text-xs text-gray-600 py-1">
                        <span class="font-medium">{{ item.quantity }}x</span> {{ item.nombre }}
                      </div>
                    </div>
                  </div>

                  <!-- Venta Actual -->
                  <div class="border rounded-lg p-3 bg-blue-50">
                    <h4 class="font-medium text-sm text-blue-700 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Venta Actual
                    </h4>
                    <div class="text-xs text-gray-700 space-y-1">
                      <p><span class="font-medium">Fecha:</span> Ahora</p>
                      <p><span class="font-medium">Productos:</span> {{ currentSale.items?.length || 0 }}</p>
                      <p><span class="font-medium">Total:</span> {{ formatCurrency(calculateTotal(currentSale.items)) }}</p>
                    </div>
                    <div v-if="currentSale.items && currentSale.items.length > 0" class="mt-2 max-h-32 overflow-y-auto border-t pt-2">
                      <div v-for="item in currentSale.items" :key="item.id" class="text-xs text-gray-700 py-1">
                        <span class="font-medium">{{ item.quantity }}x</span> {{ item.nombre }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview de fusión -->
                <div v-if="mergedPreview.length > 0" class="border rounded-lg p-3 bg-green-50 mb-4">
                  <h4 class="font-medium text-sm text-green-700 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vista Previa de Fusión
                  </h4>
                  <div class="text-xs text-gray-700">
                    <p class="mb-2"><span class="font-medium">Total de productos:</span> {{ mergedPreview.length }} (cantidades sumadas)</p>
                    <div class="max-h-32 overflow-y-auto border-t pt-2">
                      <div v-for="item in mergedPreview" :key="item.id" class="text-xs text-gray-700 py-1">
                        <span class="font-medium">{{ item.quantity }}x</span> {{ item.nombre }}
                        <span v-if="item.merged" class="ml-2 text-green-600">✓ Fusionado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  <strong>Nota:</strong> Si fusionas, los productos repetidos sumarán sus cantidades. Si eliges crear nueva venta, la venta guardada anterior permanecerá sin cambios.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="handleMerge"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            🔀 Fusionar Ventas
          </button>
          <button
            @click="handleCreateNew"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-blue-300 shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            ➕ Nueva Venta Independiente
          </button>
          <button
            @click="handleCancel"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  existingSale: {
    type: Object,
    required: true
  },
  currentSale: {
    type: Object,
    required: true
  },
  customerName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'merge', 'create-new']);

// Calcular total de items
const calculateTotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const precio = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.quantity) || 0;
    return sum + (precio * cantidad);
  }, 0);
};

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
};

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Preview de cómo quedaría la fusión
const mergedPreview = computed(() => {
  const existingItems = props.existingSale.items || [];
  const currentItems = props.currentSale.items || [];

  const merged = {};

  // Agregar items de la venta guardada
  existingItems.forEach(item => {
    merged[item.id] = { ...item, merged: false };
  });

  // Fusionar con items de la venta actual
  currentItems.forEach(item => {
    if (merged[item.id]) {
      // Producto repetido: sumar cantidades y usar precio más reciente
      merged[item.id] = {
        ...item, // Usar datos actuales (precio más reciente)
        quantity: merged[item.id].quantity + item.quantity,
        merged: true
      };
    } else {
      // Producto nuevo
      merged[item.id] = { ...item, merged: false };
    }
  });

  return Object.values(merged);
});

const handleMerge = () => {
  emit('merge', {
    existingSaleId: props.existingSale.id,
    mergedItems: mergedPreview.value
  });
  emit('update:modelValue', false);
};

const handleCreateNew = () => {
  emit('create-new');
  emit('update:modelValue', false);
};

const handleCancel = () => {
  emit('update:modelValue', false);
};
</script>
