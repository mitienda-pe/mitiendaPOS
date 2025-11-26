<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">Cuentas NetSuite</h1>
        <p class="text-sm text-gray-600">
          Configura las cuentas de NetSuite con 3 niveles de especificidad: Merchant (global), Branch (sucursal) o Caja (terminal específico)
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors'
            ]"
          >
            {{ tab.label }}
            <span class="ml-2 text-xs" :class="activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'">
              {{ tab.description }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Branch Selector (only for Branch and Caja tabs) -->
      <div v-if="activeTab !== 'merchant'" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selecciona una sucursal
        </label>
        <select
          v-model="selectedBranchId"
          @change="loadAccounts"
          class="max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option :value="null">Selecciona una sucursal</option>
          <option
            v-for="branch in branches"
            :key="branch.tiendadireccion_id"
            :value="branch.tiendadireccion_id"
          >
            {{ branch.tiendadireccion_nombresucursal }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-8 flex justify-center">
        <div class="text-gray-500">Cargando configuraciones...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Add New Button -->
        <div class="mb-4 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            {{ filteredAccounts.length }} {{ filteredAccounts.length === 1 ? 'configuración' : 'configuraciones' }}
          </p>
          <button
            @click="openCreateModal"
            :disabled="activeTab !== 'merchant' && !selectedBranchId"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="getButtonTitle()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Nueva Configuración
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAccounts.length === 0" class="bg-white shadow rounded-lg">
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 mb-2">
              {{ getEmptyStateMessage() }}
            </p>
            <button
              v-if="canCreateInCurrentTab()"
              @click="openCreateModal"
              class="mt-4 text-indigo-600 hover:text-indigo-700"
            >
              Crear primera configuración
            </button>
          </div>
        </div>

        <!-- Accounts Table -->
        <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th v-if="activeTab === 'caja'" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caja
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuenta NetSuite
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="account in filteredAccounts"
                :key="account.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getLevelBadgeClass(account)" class="px-2 py-1 text-xs rounded-full font-medium">
                    {{ getLevelLabel(account) }}
                  </span>
                </td>
                <td v-if="activeTab === 'caja'" class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span class="text-indigo-600 font-semibold">{{ account.caja_numero }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        Caja {{ account.caja_numero }}
                      </div>
                      <div v-if="account.caja_nombre" class="text-sm text-gray-500">
                        {{ account.caja_nombre }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentMethodBadgeClass(account.payment_method)" class="px-2 py-1 text-xs rounded-full">
                    {{ getPaymentMethodLabel(account.payment_method) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-mono text-gray-900">{{ account.netsuite_account_id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ account.is_active ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editAccount(account)"
                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(account)"
                    class="text-red-600 hover:text-red-900"
                    title="Desactivar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
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
        {{ showEditModal ? 'Editar Configuración' : `Nueva Configuración - ${getCurrentTabLabel()}` }}
      </h2>

      <form @submit.prevent="saveAccount">
        <div class="space-y-4">
          <!-- Caja Number (only for Caja level) -->
          <div v-if="activeTab === 'caja'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de Caja *
            </label>
            <select
              v-model.number="formData.caja_numero"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecciona un número</option>
              <option v-for="n in availableCashiers" :key="n" :value="n">Caja {{ n }}</option>
            </select>
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

          <!-- Active -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.is_active"
                type="checkbox"
                :true-value="1"
                :false-value="0"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm font-medium text-gray-700">Configuración activa</span>
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
        ¿Estás seguro de desactivar esta configuración?
      </p>
      <div class="flex gap-3 justify-end">
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

const tabs = [
  { id: 'merchant', label: 'Merchant', description: 'Global' },
  { id: 'branch', label: 'Branch', description: 'Por Sucursal' },
  { id: 'caja', label: 'Caja', description: 'Por Terminal' }
];

const activeTab = ref('merchant');
const branches = ref([]);
const cashiers = ref([]);
const allAccounts = ref([]);
const selectedBranchId = ref(null);
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
  caja_nombre: '',
  payment_method: '',
  netsuite_account_id: '',
  is_active: 1
});

const editingAccount = ref(null);
const accountToDelete = ref(null);

const selectedBranch = computed(() => {
  return branches.value.find(b => b.tiendadireccion_id === selectedBranchId.value);
});

const availableCashiers = computed(() => {
  if (!selectedBranch.value) return 0;
  return selectedBranch.value.tiendadireccion_numero_cajas || 1;
});

const filteredAccounts = computed(() => {
  if (activeTab.value === 'merchant') {
    // Merchant level: tienda_id set, branch and caja NULL
    return allAccounts.value.filter(a =>
      a.tienda_id && !a.tiendadireccion_id && !a.caja_numero
    );
  } else if (activeTab.value === 'branch') {
    // Branch level: tienda_id and branch set, caja NULL
    if (!selectedBranchId.value) return [];
    return allAccounts.value.filter(a =>
      a.tienda_id && a.tiendadireccion_id === selectedBranchId.value && !a.caja_numero
    );
  } else {
    // Caja level: all three set
    if (!selectedBranchId.value) return [];
    return allAccounts.value.filter(a =>
      a.tienda_id && a.tiendadireccion_id === selectedBranchId.value && a.caja_numero
    );
  }
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
    allAccounts.value = response.data || [];
  } catch (err) {
    console.error('Error cargando configuraciones:', err);
    error.value = 'Error al cargar las configuraciones de caja';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  formData.value = {
    tienda_id: currentStoreId.value,
    tiendadireccion_id: activeTab.value !== 'merchant' ? selectedBranchId.value : null,
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

    if (showEditModal.value && editingAccount.value) {
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

const getLevelLabel = (account) => {
  if (account.caja_numero) return 'Caja';
  if (account.tiendadireccion_id) return 'Branch';
  return 'Merchant';
};

const getLevelBadgeClass = (account) => {
  if (account.caja_numero) return 'bg-purple-100 text-purple-800';
  if (account.tiendadireccion_id) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
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

const getCurrentTabLabel = () => {
  const tab = tabs.find(t => t.id === activeTab.value);
  return tab ? tab.label : '';
};

const getButtonTitle = () => {
  if (activeTab.value === 'merchant') return 'Nueva configuración global';
  if (!selectedBranchId.value) return 'Selecciona una sucursal primero';
  return 'Nueva configuración';
};

const getEmptyStateMessage = () => {
  if (activeTab.value === 'merchant') {
    return 'No hay configuraciones a nivel Merchant';
  }
  if (!selectedBranchId.value) {
    return 'Selecciona una sucursal para ver sus configuraciones';
  }
  if (activeTab.value === 'branch') {
    return 'No hay configuraciones a nivel Branch para esta sucursal';
  }
  return 'No hay configuraciones a nivel Caja para esta sucursal';
};

const canCreateInCurrentTab = () => {
  if (activeTab.value === 'merchant') return true;
  return !!selectedBranchId.value;
};

onMounted(async () => {
  await loadBranches();
  await loadAccounts();
});
</script>
