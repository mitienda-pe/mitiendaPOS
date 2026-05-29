<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Marcas</h1>
        <p class="text-sm text-gray-500 mt-1">Organiza tus productos por marca.</p>
      </div>
      <button class="btn-primary" @click="openCreate">Nueva marca</button>
    </div>

    <div v-if="message" :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
      {{ message }}
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="brands.length === 0" class="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
      Aún no tienes marcas. Crea la primera con el botón “Nueva marca”.
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marca</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Productos</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="b in brands" :key="b.tiendamarca_id">
            <td class="px-4 py-3 text-sm text-gray-800">{{ b.tiendamarca_nombre }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ b.product_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right text-sm">
              <button class="text-primary-600 hover:text-primary-700 mr-4" @click="openEdit(b)">Editar</button>
              <button class="text-red-600 hover:text-red-700" @click="confirmDelete(b)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear/editar -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editing ? 'Editar marca' : 'Nueva marca' }}</h2>
        <form @submit.prevent="handleSubmit">
          <label class="form-label">Nombre</label>
          <input v-model="formName" type="text" class="input-field" placeholder="Nombre de la marca" autofocus />
          <div v-if="modalError" class="text-red-600 text-sm mt-2">{{ modalError }}</div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { catalogApi } from '../../services/catalogApi';

const loading = ref(true);
const saving = ref(false);
const brands = ref([]);
const message = ref('');
const messageType = ref('success');

const showModal = ref(false);
const editing = ref(null);
const formName = ref('');
const modalError = ref('');

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const load = async () => {
  loading.value = true;
  try {
    brands.value = await catalogApi.getBrands();
  } catch (e) {
    showMessage('No se pudieron cargar las marcas.', 'error');
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editing.value = null;
  formName.value = '';
  modalError.value = '';
  showModal.value = true;
};

const openEdit = (brand) => {
  editing.value = brand;
  formName.value = brand.tiendamarca_nombre || '';
  modalError.value = '';
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const handleSubmit = async () => {
  modalError.value = '';
  if (!formName.value || formName.value.trim().length < 2) {
    modalError.value = 'El nombre debe tener al menos 2 caracteres.';
    return;
  }
  saving.value = true;
  try {
    if (editing.value) {
      await catalogApi.updateBrand(editing.value.tiendamarca_id, { name: formName.value.trim() });
      showMessage('Marca actualizada.');
    } else {
      await catalogApi.createBrand({ name: formName.value.trim() });
      showMessage('Marca creada.');
    }
    closeModal();
    await load();
  } catch (e) {
    const errs = e?.response?.data;
    modalError.value = (errs && typeof errs === 'object' && !errs.message ? Object.values(errs).join(' ') : errs?.message)
      || 'Error al guardar la marca.';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (brand) => {
  if (!confirm(`¿Eliminar la marca "${brand.tiendamarca_nombre}"?`)) return;
  try {
    await catalogApi.deleteBrand(brand.tiendamarca_id);
    showMessage('Marca eliminada.');
    await load();
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al eliminar la marca.', 'error');
  }
};

onMounted(load);
</script>
