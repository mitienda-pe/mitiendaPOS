<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Categorías</h1>
        <p class="text-sm text-gray-500 mt-1">Clasifica tus productos en categorías y subcategorías.</p>
      </div>
      <button class="btn-primary" @click="openCreate()">Nueva categoría</button>
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

    <div v-else-if="flatCategories.length === 0" class="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
      Aún no tienes categorías. Crea la primera con el botón “Nueva categoría”.
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Productos</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in flatCategories" :key="c.tiendacategoria_id">
            <td class="px-4 py-3 text-sm text-gray-800">
              <span :style="{ paddingLeft: c.depth * 20 + 'px' }">
                <span v-if="c.depth > 0" class="text-gray-400 mr-1">└</span>{{ c.tiendacategoria_nombre }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ c.product_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right text-sm">
              <button class="text-primary-600 hover:text-primary-700 mr-4" @click="openEdit(c)">Editar</button>
              <button class="text-red-600 hover:text-red-700" @click="confirmDelete(c)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear/editar -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editing ? 'Editar categoría' : 'Nueva categoría' }}</h2>
        <form @submit.prevent="handleSubmit">
          <label class="form-label">Nombre</label>
          <input v-model="formName" type="text" class="input-field" placeholder="Nombre de la categoría" autofocus />

          <label class="form-label mt-4">Categoría padre</label>
          <select v-model="formParentId" class="input-field">
            <option :value="0">— Categoría principal —</option>
            <option v-for="opt in parentOptions" :key="opt.tiendacategoria_id" :value="opt.tiendacategoria_id">
              {{ '— '.repeat(opt.depth) }}{{ opt.tiendacategoria_nombre }}
            </option>
          </select>

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
import { ref, computed, onMounted } from 'vue';
import { catalogApi } from '../../services/catalogApi';

const loading = ref(true);
const saving = ref(false);
const tree = ref([]);
const message = ref('');
const messageType = ref('success');

const showModal = ref(false);
const editing = ref(null);
const formName = ref('');
const formParentId = ref(0);
const modalError = ref('');

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

// Aplana el árbol a una lista con profundidad para mostrar la jerarquía.
const flatten = (nodes, depth = 0, acc = []) => {
  for (const node of nodes) {
    acc.push({ ...node, depth });
    if (node.sub && node.sub.length) flatten(node.sub, depth + 1, acc);
  }
  return acc;
};

const flatCategories = computed(() => flatten(tree.value));

// Opciones de padre: excluye la categoría en edición y sus descendientes.
const parentOptions = computed(() => {
  if (!editing.value) return flatCategories.value;
  const excluded = new Set();
  const collect = (node) => {
    excluded.add(node.tiendacategoria_id);
    (node.sub || []).forEach(collect);
  };
  const find = (nodes) => {
    for (const n of nodes) {
      if (n.tiendacategoria_id === editing.value.tiendacategoria_id) { collect(n); return true; }
      if (n.sub && find(n.sub)) return true;
    }
    return false;
  };
  find(tree.value);
  return flatCategories.value.filter((c) => !excluded.has(c.tiendacategoria_id));
});

const load = async () => {
  loading.value = true;
  try {
    tree.value = await catalogApi.getCategories();
  } catch (e) {
    showMessage('No se pudieron cargar las categorías.', 'error');
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editing.value = null;
  formName.value = '';
  formParentId.value = 0;
  modalError.value = '';
  showModal.value = true;
};

const openEdit = (cat) => {
  editing.value = cat;
  formName.value = cat.tiendacategoria_nombre || '';
  formParentId.value = Number(cat.parent_id) || 0;
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
  const payload = { name: formName.value.trim(), parent_id: Number(formParentId.value) || 0 };
  try {
    if (editing.value) {
      await catalogApi.updateCategory(editing.value.tiendacategoria_id, payload);
      showMessage('Categoría actualizada.');
    } else {
      await catalogApi.createCategory(payload);
      showMessage('Categoría creada.');
    }
    closeModal();
    await load();
  } catch (e) {
    const errs = e?.response?.data;
    modalError.value = (errs && typeof errs === 'object' && !errs.message ? Object.values(errs).join(' ') : errs?.message)
      || 'Error al guardar la categoría.';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (cat) => {
  if (!confirm(`¿Eliminar la categoría "${cat.tiendacategoria_nombre}"?`)) return;
  try {
    await catalogApi.deleteCategory(cat.tiendacategoria_id);
    showMessage('Categoría eliminada.');
    await load();
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al eliminar la categoría.', 'error');
  }
};

onMounted(load);
</script>
