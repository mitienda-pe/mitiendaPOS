<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Sucursales</h1>
        <button
          @click="showCreateModal = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nueva Sucursal
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-8 flex justify-center">
        <div class="text-gray-500">Cargando sucursales...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Branches List -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div v-if="branches.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <p class="text-gray-500">No hay sucursales registradas</p>
          <button
            @click="showCreateModal = true"
            class="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Crear primera sucursal
          </button>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="branch in branches"
            :key="branch.tiendadireccion_id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ branch.tiendadireccion_nombresucursal || 'Sucursal sin nombre' }}
                  </h3>
                  <span class="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                    {{ branch.tiendadireccion_numero_cajas }} {{ branch.tiendadireccion_numero_cajas === 1 ? 'caja' : 'cajas' }}
                  </span>
                  <span v-if="branch.total_empleados_asignados > 0" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {{ branch.total_empleados_asignados }} {{ branch.total_empleados_asignados === 1 ? 'empleado' : 'empleados' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ branch.tiendadireccion_direccion }}</p>
                <p v-if="branch.tiendadireccion_interior" class="text-sm text-gray-500">{{ branch.tiendadireccion_interior }}</p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="editBranch(branch)"
                  class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(branch)"
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
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 class="text-xl font-semibold mb-4">
        {{ showEditModal ? 'Editar Sucursal' : 'Nueva Sucursal' }}
      </h2>

      <form @submit.prevent="saveBranch">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la sucursal *
            </label>
            <input
              v-model="formData.tiendadireccion_nombresucursal"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Sucursal Centro"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <input
              v-model="formData.tiendadireccion_direccion"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Calle y número"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Interior / Piso (opcional)
            </label>
            <input
              v-model="formData.tiendadireccion_interior"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Piso 2, Of. 201"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de cajas *
            </label>
            <input
              v-model.number="formData.tiendadireccion_numero_cajas"
              type="number"
              min="1"
              max="50"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Referencia (opcional)
            </label>
            <textarea
              v-model="formData.tiendadireccion_referencia"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Referencias adicionales para llegar"
            ></textarea>
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
        ¿Estás seguro de desactivar la sucursal "{{ branchToDelete?.tiendadireccion_nombresucursal }}"?
      </p>
      <div class="flex gap-3 justify-end">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="deleteBranch"
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
import { ref, onMounted } from 'vue';
import { branchesApi } from '../services/branchesApi';

const branches = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const formData = ref({
  tienda_id: 404, // TODO: Obtener del store o contexto
  tiendadireccion_nombresucursal: '',
  tiendadireccion_direccion: '',
  tiendadireccion_interior: '',
  tiendadireccion_numero_cajas: 1,
  tiendadireccion_referencia: '',
  tiendadireccion_latitud: '0',
  tiendadireccion_longitud: '0',
  tiendadireccion_ubigeo: 0
});

const editingBranch = ref(null);
const branchToDelete = ref(null);

const loadBranches = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await branchesApi.getAll(404); // TODO: Obtener tienda_id del store
    branches.value = response.data || [];
  } catch (err) {
    console.error('Error cargando sucursales:', err);
    error.value = 'Error al cargar las sucursales. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const editBranch = (branch) => {
  editingBranch.value = branch;
  formData.value = {
    tienda_id: branch.tienda_id,
    tiendadireccion_nombresucursal: branch.tiendadireccion_nombresucursal,
    tiendadireccion_direccion: branch.tiendadireccion_direccion,
    tiendadireccion_interior: branch.tiendadireccion_interior || '',
    tiendadireccion_numero_cajas: branch.tiendadireccion_numero_cajas || 1,
    tiendadireccion_referencia: branch.tiendadireccion_referencia || '',
    tiendadireccion_latitud: branch.tiendadireccion_latitud || '0',
    tiendadireccion_longitud: branch.tiendadireccion_longitud || '0',
    tiendadireccion_ubigeo: branch.tiendadireccion_ubigeo || 0
  };
  showEditModal.value = true;
};

const saveBranch = async () => {
  try {
    saving.value = true;
    error.value = null;

    if (showEditModal.value && editingBranch.value) {
      await branchesApi.update(editingBranch.value.tiendadireccion_id, formData.value);
    } else {
      await branchesApi.create(formData.value);
    }

    await loadBranches();
    closeModal();
  } catch (err) {
    console.error('Error guardando sucursal:', err);
    error.value = 'Error al guardar la sucursal. Por favor, intenta de nuevo.';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (branch) => {
  branchToDelete.value = branch;
  showDeleteModal.value = true;
};

const deleteBranch = async () => {
  try {
    saving.value = true;
    await branchesApi.delete(branchToDelete.value.tiendadireccion_id);
    await loadBranches();
    showDeleteModal.value = false;
    branchToDelete.value = null;
  } catch (err) {
    console.error('Error desactivando sucursal:', err);
    error.value = 'Error al desactivar la sucursal. Por favor, intenta de nuevo.';
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingBranch.value = null;
  formData.value = {
    tienda_id: 404,
    tiendadireccion_nombresucursal: '',
    tiendadireccion_direccion: '',
    tiendadireccion_interior: '',
    tiendadireccion_numero_cajas: 1,
    tiendadireccion_referencia: '',
    tiendadireccion_latitud: '0',
    tiendadireccion_longitud: '0',
    tiendadireccion_ubigeo: 0
  };
};

onMounted(() => {
  loadBranches();
});
</script>
