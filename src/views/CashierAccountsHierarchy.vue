<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Cuentas NetSuite</h1>
          <p class="text-sm text-gray-600">
            Configura las cuentas de NetSuite por sucursal y terminal. Las configuraciones pueden ser globales (todas las sucursales), por sucursal específica, o por terminal específico.
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nueva Configuración
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-8 flex justify-center">
        <div class="text-gray-500">Cargando configuraciones...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Accounts List -->
      <div v-else>
        <div v-if="allAccounts.length === 0" class="bg-white shadow rounded-lg">
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 mb-2">No hay configuraciones de cuentas</p>
            <button
              @click="openCreateModal"
              class="mt-4 text-indigo-600 hover:text-indigo-700"
            >
              Crear primera configuración
            </button>
          </div>
        </div>

        <div v-else class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursal
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caja
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Cuenta NetSuite
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="account in allAccounts"
                :key="account.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getBranchName(account) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getCajaName(account) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getPaymentMethodBadgeClass(account.payment_method)
                    ]"
                  >
                    {{ getPaymentMethodLabel(account.payment_method) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {{ account.netsuite_account_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editAccount(account)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(account)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        {{ showEditModal ? 'Editar Configuración' : 'Nueva Configuración' }}
      </h2>

      <form @submit.prevent="saveAccount">
        <div class="space-y-4">
          <!-- Branch Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sucursal *
            </label>
            <select
              v-model="formData.tiendadireccion_id"
              @change="onBranchChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option :value="null">Todas (Global)</option>
              <option
                v-for="branch in branches"
                :key="branch.tiendadireccion_id"
                :value="branch.tiendadireccion_id"
              >
                {{ branch.tiendadireccion_nombresucursal }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Selecciona "Todas" para configuración global
            </p>
          </div>

          <!-- Caja Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Caja *
            </label>
            <select
              v-model="formData.caja_numero"
              :disabled="!formData.tiendadireccion_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option :value="null">Todas (Nivel Sucursal)</option>
              <option v-for="n in availableCashiers" :key="n" :value="n">{{ n }}</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              {{ formData.tiendadireccion_id ? 'Selecciona "Todas" para configuración por sucursal' : 'Selecciona una sucursal primero' }}
            </p>
          </div>

          <!-- Payment Method -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <select
              v-model="formData.payment_method"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecciona un método</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="banco">Banco</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
              <option value="nota_credito">Nota de Crédito</option>
              <option value="redondeo_favor">Redondeo a Favor</option>
              <option value="redondeo_contra">Redondeo en Contra</option>
            </select>
          </div>

          <!-- NetSuite Account ID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ID de Cuenta NetSuite *
            </label>
            <input
              v-model="formData.netsuite_account_id"
              type="text"
              maxlength="50"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              placeholder="Ej: 10100"
            />
            <p class="mt-1 text-xs text-gray-500">
              El ID de la cuenta bancaria/caja en NetSuite
            </p>
          </div>

          <!-- Active Checkbox -->
          <div class="flex items-center">
            <input
              v-model="formData.is_active"
              type="checkbox"
              :true-value="1"
              :false-value="0"
              id="is_active"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="is_active" class="ml-2 block text-sm text-gray-700">
              Configuración activa
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
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
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 class="text-xl font-semibold mb-4 text-red-600">Confirmar Eliminación</h2>
      <p class="text-gray-700 mb-6">
        ¿Estás seguro de que deseas desactivar esta configuración?
      </p>
      <div class="flex justify-end gap-3">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="deleteAccount"
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
import { cashierAccountsApi } from '../services/cashierAccountsApi';
import { branchesApi } from '../services/branchesApi';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const branches = ref([]);
const allAccounts = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const currentStoreId = computed(() => authStore.selectedStore?.id || null);

const formData = ref({
  tienda_id: currentStoreId.value,
  tiendadireccion_id: null,
  caja_numero: null,
  payment_method: '',
  netsuite_account_id: '',
  is_active: 1
});

const editingAccount = ref(null);
const accountToDelete = ref(null);

const selectedBranch = computed(() => {
  if (!formData.value.tiendadireccion_id) return null;
  return branches.value.find(b => b.tiendadireccion_id === formData.value.tiendadireccion_id);
});

const availableCashiers = computed(() => {
  if (!selectedBranch.value) return [];
  const numCajas = parseInt(selectedBranch.value.tiendadireccion_numero_cajas) || 1;
  return Array.from({ length: numCajas }, (_, i) => i + 1);
});

const loadBranches = async () => {
  if (!currentStoreId.value) {
    error.value = 'No hay tienda seleccionada';
    loading.value = false;
    return;
  }

  try {
    const response = await branchesApi.getAll(currentStoreId.value);
    branches.value = response.data || [];
  } catch (err) {
    console.error('Error cargando sucursales:', err);
    error.value = 'Error al cargar las sucursales';
  }
};

const loadAccounts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await cashierAccountsApi.getAll();
    // Show accounts with matching tienda_id OR null tienda_id (legacy records)
    // Convert both to numbers for comparison to handle type mismatch (API returns strings, store has numbers)
    const accountsData = response.data || [];
    allAccounts.value = accountsData.filter(a => {
      if (a.tienda_id === null) return true; // Legacy records
      return parseInt(a.tienda_id) === currentStoreId.value;
    });
  } catch (err) {
    console.error('Error cargando configuraciones:', err);
    error.value = 'Error al cargar las configuraciones de caja';
  } finally {
    loading.value = false;
  }
};

const onBranchChange = () => {
  // Reset caja when branch changes
  formData.value.caja_numero = null;
};

const openCreateModal = () => {
  formData.value = {
    tienda_id: currentStoreId.value,
    tiendadireccion_id: null,
    caja_numero: null,
    payment_method: '',
    netsuite_account_id: '',
    is_active: 1
  };
  showCreateModal.value = true;
};

const editAccount = (account) => {
  editingAccount.value = account;
  formData.value = {
    tienda_id: account.tienda_id,
    tiendadireccion_id: account.tiendadireccion_id || null,
    caja_numero: account.caja_numero || null,
    payment_method: account.payment_method,
    netsuite_account_id: account.netsuite_account_id,
    is_active: account.is_active
  };
  showEditModal.value = true;
};

const saveAccount = async () => {
  try {
    saving.value = true;
    error.value = null;

    if (showEditModal.value) {
      await cashierAccountsApi.update(editingAccount.value.id, formData.value);
    } else {
      await cashierAccountsApi.create(formData.value);
    }

    await loadAccounts();
    closeModal();
  } catch (err) {
    console.error('Error guardando configuración:', err);
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Error al guardar la configuración';
    }
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (account) => {
  accountToDelete.value = account;
  showDeleteModal.value = true;
};

const deleteAccount = async () => {
  try {
    saving.value = true;
    await cashierAccountsApi.delete(accountToDelete.value.id);
    await loadAccounts();
    showDeleteModal.value = false;
    accountToDelete.value = null;
  } catch (err) {
    console.error('Error desactivando configuración:', err);
    error.value = 'Error al desactivar la configuración';
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingAccount.value = null;
};

const getBranchName = (account) => {
  if (!account.tiendadireccion_id) return 'Todas';
  const branch = branches.value.find(b => b.tiendadireccion_id === account.tiendadireccion_id);
  return branch?.tiendadireccion_nombresucursal || `Branch #${account.tiendadireccion_id}`;
};

const getCajaName = (account) => {
  if (!account.tiendadireccion_id) return 'Todas';
  if (!account.caja_numero) return 'Todas';
  return `Caja ${account.caja_numero}`;
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'banco': 'Banco',
    'yape': 'Yape',
    'plin': 'Plin',
    'transferencia': 'Transferencia',
    'qr': 'QR',
    'nota_credito': 'Nota de Crédito',
    'redondeo_favor': 'Redondeo a Favor',
    'redondeo_contra': 'Redondeo en Contra'
  };
  return labels[method] || method;
};

const getPaymentMethodBadgeClass = (method) => {
  const classes = {
    'efectivo': 'bg-emerald-100 text-emerald-800',
    'tarjeta': 'bg-blue-100 text-blue-800',
    'banco': 'bg-green-100 text-green-800',
    'yape': 'bg-purple-100 text-purple-800',
    'plin': 'bg-pink-100 text-pink-800',
    'transferencia': 'bg-indigo-100 text-indigo-800',
    'qr': 'bg-yellow-100 text-yellow-800',
    'nota_credito': 'bg-orange-100 text-orange-800',
    'redondeo_favor': 'bg-teal-100 text-teal-800',
    'redondeo_contra': 'bg-red-100 text-red-800'
  };
  return classes[method] || 'bg-gray-100 text-gray-800';
};

onMounted(async () => {
  await loadBranches();
  await loadAccounts();
});
</script>
