<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Preferencias</h1>
      </div>

      <!-- NetSuite Series Configuration Section -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Configuración de Series NetSuite
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Configure los IDs de series de NetSuite para boletas y facturas.
          </p>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-8">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-3 text-gray-600">Cargando configuración...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error al cargar la configuración</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div v-else>
            <form @submit.prevent="saveConfig" class="space-y-6">
              <!-- Boleta Serie ID -->
              <div>
                <label for="boleta_id" class="block text-sm font-medium text-gray-700">
                  ID Serie Boleta en NetSuite
                  <span class="text-gray-500 font-normal ml-1">(ejemplo: 182)</span>
                </label>
                <div class="mt-1">
                  <input
                    type="text"
                    id="boleta_id"
                    v-model="formData.boleta_netsuite_id"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                    placeholder="182"
                  />
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Este ID se utilizará para todas las boletas (documentos con DNI o sin documento).
                </p>
              </div>

              <!-- Factura Serie ID -->
              <div>
                <label for="factura_id" class="block text-sm font-medium text-gray-700">
                  ID Serie Factura en NetSuite
                  <span class="text-gray-500 font-normal ml-1">(ejemplo: 439)</span>
                </label>
                <div class="mt-1">
                  <input
                    type="text"
                    id="factura_id"
                    v-model="formData.factura_netsuite_id"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                    placeholder="439"
                  />
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Este ID se utilizará para todas las facturas (documentos con RUC).
                </p>
              </div>

              <!-- Informational Note -->
              <div class="rounded-md bg-blue-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3 flex-1">
                    <h3 class="text-sm font-medium text-blue-800">Nota importante</h3>
                    <div class="mt-2 text-sm text-blue-700">
                      <p>
                        El sistema detecta automáticamente el tipo de documento basándose en el número de documento del cliente:
                      </p>
                      <ul class="list-disc list-inside mt-1 ml-2">
                        <li>RUC (11 dígitos que empiezan con 10 o 20): se usa <strong>Factura</strong></li>
                        <li>DNI o sin documento: se usa <strong>Boleta</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="loadConfig"
                  :disabled="saving"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="saving || !hasChanges"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeSeriesApi } from '../services/storeSeriesApi';

// Get current store ID from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');
const selectedStore = JSON.parse(localStorage.getItem('selected_store') || '{}');
const currentStoreId = ref(selectedStore.tienda_id || user.tienda_id);

// State
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const successMessage = ref(null);

const formData = ref({
  boleta_netsuite_id: '',
  factura_netsuite_id: ''
});

const originalData = ref({
  boleta_netsuite_id: '',
  factura_netsuite_id: ''
});

// Computed
const hasChanges = computed(() => {
  return formData.value.boleta_netsuite_id !== originalData.value.boleta_netsuite_id ||
         formData.value.factura_netsuite_id !== originalData.value.factura_netsuite_id;
});

// Methods
const loadConfig = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const response = await storeSeriesApi.getConfig(currentStoreId.value);

    if (response.success) {
      formData.value = {
        boleta_netsuite_id: response.data.boleta_netsuite_id || '',
        factura_netsuite_id: response.data.factura_netsuite_id || ''
      };
      originalData.value = { ...formData.value };
    } else {
      error.value = response.message || 'Error al cargar la configuración';
    }
  } catch (err) {
    console.error('Error loading series config:', err);
    error.value = 'Error al conectar con el servidor';
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  saving.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const response = await storeSeriesApi.updateConfig(currentStoreId.value, {
      boleta_netsuite_id: formData.value.boleta_netsuite_id,
      factura_netsuite_id: formData.value.factura_netsuite_id
    });

    if (response.success) {
      successMessage.value = 'Configuración guardada exitosamente';
      originalData.value = { ...formData.value };

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    } else {
      error.value = response.message || 'Error al guardar la configuración';
    }
  } catch (err) {
    console.error('Error saving series config:', err);
    error.value = err.response?.data?.message || 'Error al guardar la configuración';
  } finally {
    saving.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadConfig();
});
</script>
