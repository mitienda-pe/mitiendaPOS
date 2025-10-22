<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="handleCancel"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
                Productos sin Documento de Cliente
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-700 mb-4">
                  Tienes <strong class="text-blue-600">{{ productCount }} producto(s)</strong> en el carrito pero aún no has registrado el documento del cliente.
                </p>
                <p class="text-sm text-gray-600 mb-3">
                  ¿Qué deseas hacer con estos productos?
                </p>

                <!-- Lista de productos -->
                <div v-if="products && products.length > 0" class="mb-4 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                  <div v-for="item in products" :key="item.id" class="text-xs text-gray-600 py-1 border-b last:border-b-0">
                    <span class="font-medium">{{ item.quantity }}x</span> {{ item.nombre }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="handleKeep"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ✓ Mantener Productos
          </button>
          <button
            @click="handleDelete"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            ✗ Eliminar Productos
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
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  productCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue', 'keep', 'delete']);

const handleKeep = () => {
  emit('keep');
  emit('update:modelValue', false);
};

const handleDelete = () => {
  emit('delete');
  emit('update:modelValue', false);
};

const handleCancel = () => {
  emit('update:modelValue', false);
};
</script>
