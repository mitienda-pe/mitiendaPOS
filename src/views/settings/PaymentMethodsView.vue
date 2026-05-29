<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Formas de pago</h1>
      <p class="text-sm text-gray-500 mt-1">
        Activa o desactiva los métodos de pago disponibles al cobrar y personaliza su nombre.
      </p>
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

    <div v-else class="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
      <div v-for="method in methods" :key="method.id" class="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex-1">
          <label class="form-label">Nombre visible</label>
          <input v-model="method.nombre" type="text" maxlength="100" class="input-field max-w-sm" />
          <p class="text-xs text-gray-400 mt-1">Código: {{ method.metodo_codigo }}</p>
        </div>
        <div class="flex items-center gap-6">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="method._habilitado" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
            <span class="text-sm text-gray-700">{{ method._habilitado ? 'Activo' : 'Inactivo' }}</span>
          </label>
          <button class="btn-primary" :disabled="method._saving" @click="save(method)">
            {{ method._saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="mt-4">
      <button class="text-sm text-gray-500 hover:text-gray-700" @click="handleReset">Restaurar valores por defecto</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { paymentMethodsApi } from '../../services/paymentMethodsApi';
import { usePaymentMethodsStore } from '../../stores/paymentMethods';

const loading = ref(true);
const methods = ref([]);
const message = ref('');
const messageType = ref('success');
const paymentMethodsStore = usePaymentMethodsStore();

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const decorate = (list) => list.map((m) => ({
  ...m,
  _habilitado: Number(m.habilitado) === 1,
  _saving: false,
}));

const load = async () => {
  loading.value = true;
  try {
    methods.value = decorate(await paymentMethodsApi.getAll());
  } catch (e) {
    showMessage('No se pudieron cargar las formas de pago.', 'error');
  } finally {
    loading.value = false;
  }
};

const save = async (method) => {
  if (!method.nombre || !method.nombre.trim()) {
    showMessage('El nombre no puede estar vacío.', 'error');
    return;
  }
  method._saving = true;
  try {
    await paymentMethodsApi.update(method.id, {
      nombre: method.nombre.trim(),
      habilitado: method._habilitado ? 1 : 0,
    });
    showMessage(`"${method.nombre}" actualizado.`);
    // Refrescar cache que consume el PaymentModal.
    await paymentMethodsStore.fetchActive(true);
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al guardar la forma de pago.', 'error');
  } finally {
    method._saving = false;
  }
};

const handleReset = async () => {
  if (!confirm('¿Restaurar las formas de pago a sus valores por defecto?')) return;
  loading.value = true;
  try {
    methods.value = decorate(await paymentMethodsApi.reset());
    await paymentMethodsStore.fetchActive(true);
    showMessage('Formas de pago restauradas.');
  } catch (e) {
    showMessage('No se pudieron restaurar las formas de pago.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
