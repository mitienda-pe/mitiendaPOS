<template>
  <div class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="handleClose"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Nueva Bonificación</h3>
                <button
                  @click="handleClose"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  :disabled="loading"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Bonificación *
                  </label>
                  <input
                    v-model="formData.tiendapromocion_nombre"
                    type="text"
                    placeholder="Ej: 2x1 en Coca Cola"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': errors.tiendapromocion_nombre }"
                    :disabled="loading"
                  />
                  <small v-if="errors.tiendapromocion_nombre" class="text-red-500 text-xs">
                    {{ errors.tiendapromocion_nombre }}
                  </small>
                </div>

                <!-- Código -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    v-model="formData.tiendapromocion_codigo"
                    type="text"
                    placeholder="Ej: 2X1-COCA"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': errors.tiendapromocion_codigo }"
                    :disabled="loading"
                  />
                  <small v-if="errors.tiendapromocion_codigo" class="text-red-500 text-xs">
                    {{ errors.tiendapromocion_codigo }}
                  </small>
                  <small class="text-gray-500 text-xs">
                    Código único para identificar esta bonificación
                  </small>
                </div>

                <!-- Fechas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      v-model="startDate"
                      type="date"
                      class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      :class="{ 'border-red-500': errors.tiendapromocion_fechainicio }"
                      :disabled="loading"
                    />
                    <small v-if="errors.tiendapromocion_fechainicio" class="text-red-500 text-xs">
                      {{ errors.tiendapromocion_fechainicio }}
                    </small>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin *
                    </label>
                    <input
                      v-model="endDate"
                      type="date"
                      class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      :class="{ 'border-red-500': errors.tiendapromocion_fechacaducidad }"
                      :disabled="loading"
                    />
                    <small v-if="errors.tiendapromocion_fechacaducidad" class="text-red-500 text-xs">
                      {{ errors.tiendapromocion_fechacaducidad }}
                    </small>
                  </div>
                </div>

                <!-- Estado -->
                <div class="flex items-center gap-2">
                  <input
                    v-model="formData.tiendapromocion_estado"
                    type="checkbox"
                    :true-value="1"
                    :false-value="0"
                    id="estado"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    :disabled="loading"
                  />
                  <label for="estado" class="text-sm font-medium text-gray-700">
                    Activar bonificación inmediatamente
                  </label>
                </div>

                <!-- Nota informativa -->
                <div class="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-blue-700">
                        Después de crear la bonificación básica, serás redirigido a la pantalla de configuración
                        donde podrás definir los productos base, productos bonificados y las reglas de la bonificación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="handleSave"
            :disabled="loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            </span>
            <span v-else>Crear Bonificación</span>
          </button>
          <button
            @click="handleClose"
            :disabled="loading"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
import { promotionsApi } from '../services/promotionsApi';

const emit = defineEmits(['close', 'created']);

const loading = ref(false);
const startDate = ref('');
const endDate = ref('');

const formData = ref({
  promocion_id: 7, // Solo bonificaciones
  tiendapromocion_nombre: '',
  tiendapromocion_codigo: '',
  tiendapromocion_tipodescuento: 1,
  tiendapromocion_valor: 0,
  tiendapromocion_ilimitado: 0,
  tiendapromocion_cantidad: 100,
  tiendapromocion_fechainicio: '',
  tiendapromocion_fechacaducidad: '',
  tiendapromocion_estado: 1,
  tiendapromocion_swopciones: 0,
  tiendapromocion_opciones: null
});

const errors = ref({
  tiendapromocion_nombre: '',
  tiendapromocion_codigo: '',
  tiendapromocion_fechainicio: '',
  tiendapromocion_fechacaducidad: ''
});

// Watch dates
watch(startDate, (value) => {
  formData.value.tiendapromocion_fechainicio = value;
});

watch(endDate, (value) => {
  formData.value.tiendapromocion_fechacaducidad = value;
});

function validateForm() {
  errors.value = {
    tiendapromocion_nombre: '',
    tiendapromocion_codigo: '',
    tiendapromocion_fechainicio: '',
    tiendapromocion_fechacaducidad: ''
  };

  let isValid = true;

  if (!formData.value.tiendapromocion_nombre.trim()) {
    errors.value.tiendapromocion_nombre = 'El nombre es requerido';
    isValid = false;
  }

  if (!formData.value.tiendapromocion_codigo.trim()) {
    errors.value.tiendapromocion_codigo = 'El código es requerido';
    isValid = false;
  }

  if (!startDate.value) {
    errors.value.tiendapromocion_fechainicio = 'La fecha de inicio es requerida';
    isValid = false;
  }

  if (!endDate.value) {
    errors.value.tiendapromocion_fechacaducidad = 'La fecha de fin es requerida';
    isValid = false;
  }

  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    if (end < start) {
      errors.value.tiendapromocion_fechacaducidad = 'La fecha de fin debe ser posterior a la de inicio';
      isValid = false;
    }
  }

  return isValid;
}

async function handleSave() {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;
    const response = await promotionsApi.createPromotion(formData.value);

    if (response.status === 'success') {
      emit('created', response.data);
    }
  } catch (error) {
    console.error('Error creating promotion:', error);
    alert(error.response?.data?.message || 'Error al crear la bonificación');
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close');
  }
}
</script>
