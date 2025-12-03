<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Empleados POS</h1>
        <button
          @click="openCreateModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Empleado
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-8 flex justify-center">
        <div class="text-gray-500">Cargando empleados...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Employees List -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div v-if="empleados.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-gray-500">No hay empleados registrados</p>
          <button
            @click="openCreateModal"
            class="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Crear primer empleado
          </button>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="empleado in empleados"
            :key="empleado.empleado_id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-indigo-600 font-semibold text-lg">
                    {{ getInitials(empleado.empleado_nombres, empleado.empleado_apellidos) }}
                  </span>
                </div>

                <!-- Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ empleado.empleado_nombres }} {{ empleado.empleado_apellidos }}
                    </h3>
                    <span
                      :class="getRoleBadgeClass(empleado.empleado_rol)"
                      class="px-2 py-1 text-xs rounded-full"
                    >
                      {{ empleado.empleado_rol }}
                    </span>
                    <span
                      v-if="!empleado.empleado_activo"
                      class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      Inactivo
                    </span>
                  </div>

                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span v-if="empleado.empleado_documento">DNI: {{ empleado.empleado_documento }}</span>
                    <span v-if="empleado.empleado_email">{{ empleado.empleado_email }}</span>
                    <span v-if="empleado.empleado_telefono">Tel: {{ empleado.empleado_telefono }}</span>
                  </div>

                  <div class="mt-2 text-sm">
                    <span v-if="empleado.sucursales_nombres" class="text-gray-600">
                      📍 {{ empleado.sucursales_nombres }}
                    </span>
                    <span v-else class="text-gray-400 italic">Sin sucursales asignadas</span>
                  </div>

                  <div v-if="empleado.empleado_horario_inicio && empleado.empleado_horario_fin" class="mt-1 text-sm text-gray-500">
                    🕐 Horario: {{ formatTime(empleado.empleado_horario_inicio) }} - {{ formatTime(empleado.empleado_horario_fin) }}
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="editEmpleado(empleado)"
                  class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(empleado)"
                  class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Desactivar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div
    v-if="showCreateModal || showEditModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
      <h2 class="text-xl font-semibold mb-4">
        {{ showEditModal ? 'Editar Empleado' : 'Nuevo Empleado' }}
      </h2>

      <form @submit.prevent="saveEmpleado">
        <div class="grid grid-cols-2 gap-4">
          <!-- Nombres -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombres *
            </label>
            <input
              v-model="formData.empleado_nombres"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Apellidos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Apellidos *
            </label>
            <input
              v-model="formData.empleado_apellidos"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Documento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              DNI / Documento
            </label>
            <input
              v-model="formData.empleado_documento"
              type="text"
              maxlength="20"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              v-model="formData.empleado_telefono"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Email -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="formData.empleado_email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- PIN -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              PIN (4 dígitos) *
            </label>
            <input
              v-model="formData.empleado_pin"
              @input="validatePinAvailability"
              type="text"
              pattern="[0-9]{4}"
              maxlength="4"
              required
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                pinValidation.checking ? 'border-gray-300' :
                pinValidation.isValid ? 'border-green-500 focus:ring-green-500' :
                pinValidation.error ? 'border-red-500 focus:ring-red-500' :
                'border-gray-300 focus:ring-indigo-500'
              ]"
              placeholder="0000"
            />
            <p v-if="pinValidation.checking" class="text-xs text-gray-500 mt-1">
              ⏳ Verificando disponibilidad...
            </p>
            <p v-else-if="pinValidation.isValid" class="text-xs text-green-600 mt-1">
              ✓ PIN disponible
            </p>
            <p v-else-if="pinValidation.error" class="text-xs text-red-600 mt-1">
              ✗ {{ pinValidation.error }}
            </p>
            <p v-else class="text-xs text-gray-500 mt-1">
              PIN numérico de 4 dígitos para acceso rápido
            </p>
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              v-model="formData.empleado_rol"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="cajero">Cajero</option>
              <option value="supervisor">Supervisor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <!-- Horario Inicio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Horario Inicio (opcional)
            </label>
            <input
              v-model="formData.empleado_horario_inicio"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Horario Fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Horario Fin (opcional)
            </label>
            <input
              v-model="formData.empleado_horario_fin"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Sucursales -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Sucursales Asignadas
            </label>
            <div v-if="loadingBranches" class="text-gray-500 text-sm">Cargando sucursales...</div>
            <div v-else-if="availableBranches.length === 0" class="text-gray-500 text-sm italic">
              No hay sucursales disponibles
            </div>
            <div v-else class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <label
                v-for="branch in availableBranches"
                :key="branch.tiendadireccion_id"
                class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  :value="branch.tiendadireccion_id"
                  v-model="formData.sucursales"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700">{{ branch.tiendadireccion_nombresucursal }}</span>
                <span class="text-xs text-gray-500">({{ branch.tiendadireccion_numero_cajas }} cajas)</span>
              </label>
            </div>
          </div>

          <!-- Netsuite ID -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ID NetSuite (opcional)
            </label>
            <input
              v-model="formData.empleado_netsuite_id"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="ID del empleado en NetSuite"
            />
            <p class="text-xs text-gray-500 mt-1">
              Identificador del empleado en el sistema NetSuite
            </p>
          </div>

          <!-- Activo -->
          <div class="col-span-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.empleado_activo"
                type="checkbox"
                :true-value="1"
                :false-value="0"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm font-medium text-gray-700">Empleado activo</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showDeleteModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
      <h2 class="text-xl font-semibold mb-4 text-red-600">Confirmar desactivación</h2>
      <p class="text-gray-600 mb-6">
        ¿Estás seguro de desactivar al empleado "{{ empleadoToDelete?.empleado_nombres }} {{ empleadoToDelete?.empleado_apellidos }}"?
      </p>
      <div class="flex gap-3 justify-end">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="deleteEmpleado"
          :disabled="saving"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Desactivando...' : 'Desactivar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { posEmpleadosApi } from '../services/posEmpleadosApi';
import { branchesApi } from '../services/branchesApi';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const empleados = ref([]);
const availableBranches = ref([]);
const loading = ref(true);
const loadingBranches = ref(false);
const error = ref(null);
const saving = ref(false);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Validación de PIN en tiempo real
const pinValidation = ref({
  checking: false,
  isValid: false,
  error: null
});

let pinValidationTimeout = null;

// Obtener store_id de la tienda seleccionada
const currentStoreId = computed(() => authStore.selectedStore?.id || null);

const formData = ref({
  tienda_id: currentStoreId.value,
  empleado_nombres: '',
  empleado_apellidos: '',
  empleado_documento: '',
  empleado_email: '',
  empleado_telefono: '',
  empleado_netsuite_id: '',
  empleado_pin: '',
  empleado_rol: 'cajero',
  empleado_horario_inicio: null,
  empleado_horario_fin: null,
  empleado_activo: 1,
  sucursales: []
});

const editingEmpleado = ref(null);
const empleadoToDelete = ref(null);

const loadEmpleados = async () => {
  if (!currentStoreId.value) {
    error.value = 'No hay tienda seleccionada';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const response = await posEmpleadosApi.getAll(currentStoreId.value);
    empleados.value = response.data || [];
  } catch (err) {
    console.error('Error cargando empleados:', err);
    error.value = 'Error al cargar los empleados. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const loadBranches = async () => {
  if (!currentStoreId.value) {
    return;
  }

  try {
    loadingBranches.value = true;
    const response = await branchesApi.getAll(currentStoreId.value);
    availableBranches.value = response.data || [];
  } catch (err) {
    console.error('Error cargando sucursales:', err);
  } finally {
    loadingBranches.value = false;
  }
};

const openCreateModal = () => {
  // Resetear validación de PIN
  pinValidation.value = {
    checking: false,
    isValid: false,
    error: null
  };
  loadBranches();
  showCreateModal.value = true;
};

// Validación de PIN en tiempo real con debounce
const validatePinAvailability = async () => {
  const pin = formData.value.empleado_pin;

  // Resetear validación
  pinValidation.value = {
    checking: false,
    isValid: false,
    error: null
  };

  // Cancelar timeout anterior
  if (pinValidationTimeout) {
    clearTimeout(pinValidationTimeout);
  }

  // Validar formato
  if (!pin || pin.length < 4) {
    return;
  }

  if (!/^\d{4}$/.test(pin)) {
    pinValidation.value.error = 'El PIN debe tener exactamente 4 dígitos';
    return;
  }

  // Verificar disponibilidad con debounce
  pinValidation.value.checking = true;

  pinValidationTimeout = setTimeout(async () => {
    try {
      const excludeId = editingEmpleado.value?.empleado_id || null;
      const response = await posEmpleadosApi.checkPin(currentStoreId.value, pin, excludeId);

      if (response.success && response.available) {
        pinValidation.value.isValid = true;
        pinValidation.value.error = null;
      } else {
        pinValidation.value.isValid = false;
        pinValidation.value.error = response.message || 'El PIN ya está en uso';
      }
    } catch (err) {
      console.error('Error validando PIN:', err);
      pinValidation.value.error = 'Error al validar PIN';
    } finally {
      pinValidation.value.checking = false;
    }
  }, 500); // Esperar 500ms después de que el usuario deje de escribir
};

const editEmpleado = (empleado) => {
  editingEmpleado.value = empleado;

  // Resetear validación de PIN
  pinValidation.value = {
    checking: false,
    isValid: false,
    error: null
  };

  // Parsear sucursales_ids (viene como array del backend)
  const sucursalesIds = Array.isArray(empleado.sucursales_ids)
    ? empleado.sucursales_ids.map(id => parseInt(id))
    : [];

  formData.value = {
    tienda_id: empleado.tienda_id,
    empleado_nombres: empleado.empleado_nombres,
    empleado_apellidos: empleado.empleado_apellidos,
    empleado_documento: empleado.empleado_documento || '',
    empleado_email: empleado.empleado_email || '',
    empleado_telefono: empleado.empleado_telefono || '',
    empleado_netsuite_id: empleado.empleado_netsuite_id || '',
    empleado_pin: empleado.empleado_pin,
    empleado_rol: empleado.empleado_rol,
    empleado_horario_inicio: empleado.empleado_horario_inicio || null,
    empleado_horario_fin: empleado.empleado_horario_fin || null,
    empleado_activo: empleado.empleado_activo,
    sucursales: sucursalesIds
  };

  loadBranches();
  showEditModal.value = true;
};

const saveEmpleado = async () => {
  try {
    saving.value = true;
    error.value = null;

    // Validar que haya tienda seleccionada
    if (!currentStoreId.value) {
      error.value = 'No hay tienda seleccionada';
      saving.value = false;
      return;
    }

    // Asegurar que siempre se envíe el tienda_id correcto
    const dataToSave = {
      ...formData.value,
      tienda_id: currentStoreId.value
    };

    console.log('💾 Guardando empleado:', dataToSave);

    if (showEditModal.value && editingEmpleado.value) {
      await posEmpleadosApi.update(editingEmpleado.value.empleado_id, dataToSave);
    } else {
      await posEmpleadosApi.create(dataToSave);
    }

    await loadEmpleados();
    closeModal();
  } catch (err) {
    console.error('❌ Error guardando empleado:', err);
    console.error('Response data:', err.response?.data);
    console.error('Validation messages:', err.response?.data?.messages);

    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.response?.data?.messages) {
      // Manejar errores de validación múltiples
      const messages = err.response.data.messages;
      console.log('📋 Errores de validación:', messages);
      error.value = Object.values(messages).flat().join(', ');
    } else {
      error.value = 'Error al guardar el empleado. Por favor, intenta de nuevo.';
    }
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (empleado) => {
  empleadoToDelete.value = empleado;
  showDeleteModal.value = true;
};

const deleteEmpleado = async () => {
  try {
    saving.value = true;
    await posEmpleadosApi.delete(empleadoToDelete.value.empleado_id);
    await loadEmpleados();
    showDeleteModal.value = false;
    empleadoToDelete.value = null;
  } catch (err) {
    console.error('Error desactivando empleado:', err);
    error.value = 'Error al desactivar el empleado. Por favor, intenta de nuevo.';
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingEmpleado.value = null;

  // Resetear validación de PIN
  pinValidation.value = {
    checking: false,
    isValid: false,
    error: null
  };

  // Cancelar timeout pendiente
  if (pinValidationTimeout) {
    clearTimeout(pinValidationTimeout);
    pinValidationTimeout = null;
  }

  formData.value = {
    tienda_id: currentStoreId.value,
    empleado_nombres: '',
    empleado_apellidos: '',
    empleado_documento: '',
    empleado_email: '',
    empleado_telefono: '',
    empleado_netsuite_id: '',
    empleado_pin: '',
    empleado_rol: 'cajero',
    empleado_horario_inicio: null,
    empleado_horario_fin: null,
    empleado_activo: 1,
    sucursales: []
  };
};

const getInitials = (nombres, apellidos) => {
  const n = nombres?.charAt(0) || '';
  const a = apellidos?.charAt(0) || '';
  return (n + a).toUpperCase();
};

const getRoleBadgeClass = (rol) => {
  const classes = {
    'cajero': 'bg-blue-100 text-blue-800',
    'supervisor': 'bg-purple-100 text-purple-800',
    'administrador': 'bg-red-100 text-red-800'
  };
  return classes[rol] || 'bg-gray-100 text-gray-800';
};

const formatTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5); // HH:MM
};

onMounted(() => {
  loadEmpleados();
});
</script>
