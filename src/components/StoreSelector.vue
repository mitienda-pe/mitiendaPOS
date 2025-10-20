<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Selecciona tu Tienda</h3>
                  <p class="text-sm text-gray-500 mt-1">Elige la tienda con la que deseas trabajar</p>
                </div>
                <button
                  v-if="!required"
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Loading state -->
              <div v-if="authStore.loading" class="text-center py-8">
                <svg class="animate-spin h-10 w-10 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 mt-2">Cargando tiendas...</p>
              </div>

              <!-- Store list -->
              <div v-else class="space-y-3">
                <div
                  v-for="store in authStore.stores"
                  :key="store.id"
                  @click="handleSelectStore(store)"
                  class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  :class="authStore.selectedStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
                >
                  <div class="flex items-center gap-4">
                    <!-- Logo de la tienda -->
                    <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg v-if="!store.logo" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <img v-else :src="store.logo" :alt="store.name" class="w-full h-full object-cover rounded-lg">
                    </div>

                    <!-- Info de la tienda -->
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-lg text-gray-900 truncate">{{ store.name }}</h3>
                      <p class="text-sm text-gray-500 truncate">{{ store.url || store.slug }}</p>
                      <div class="flex gap-2 mt-1">
                        <span
                          v-if="store.plan"
                          class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >
                          {{ store.plan }}
                        </span>
                        <span
                          class="text-xs px-2 py-1 rounded"
                          :class="store.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        >
                          {{ store.status === 'active' ? 'Activa' : 'Inactiva' }}
                        </span>
                      </div>
                    </div>

                    <!-- Icono seleccionado -->
                    <div class="flex-shrink-0">
                      <svg
                        v-if="authStore.selectedStore?.id === store.id"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 text-green-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Error message -->
                <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-sm text-red-700">{{ authStore.error }}</p>
                </div>

                <!-- No stores message -->
                <div v-if="authStore.stores.length === 0" class="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p class="text-gray-500">No tienes tiendas disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            v-if="!required"
            @click="closeModal"
            class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
          <button
            v-if="required && authStore.stores.length > 0"
            @click="authStore.logout()"
            class="mt-3 sm:mt-0 sm:mr-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'store-selected']);

const authStore = useAuthStore();
const router = useRouter();

const handleSelectStore = async (store) => {
  try {
    await authStore.selectStore(store.id);
    emit('store-selected', store);

    if (!props.required) {
      closeModal();
    } else {
      // Si es requerido, redirigir al menú después de seleccionar
      router.push('/menu');
    }
  } catch (error) {
    console.error('Error selecting store:', error);
    alert('Error al seleccionar la tienda. Por favor, intenta nuevamente.');
  }
};

const closeModal = () => {
  if (!props.required) {
    emit('update:modelValue', false);
  }
};
</script>
