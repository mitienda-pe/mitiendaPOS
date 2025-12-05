<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Usuarios - NetSuite</h1>
      <p class="mt-2 text-gray-600">
        Configure el ID de NetSuite para cada usuario. Esta información se utiliza para la sincronización con el sistema NetSuite.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
              NetSuite ID
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.empleado_id" class="hover:bg-gray-50">
            <!-- User Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.empleado_nombres }} {{ user.empleado_apellidos }}
                  </div>
                  <div class="text-sm text-gray-500" v-if="user.empleado_documento">
                    {{ user.empleado_documento }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.empleado_email || '-' }}</div>
            </td>

            <!-- Role -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-purple-100 text-purple-800': user.empleado_rol === 'administrador',
                  'bg-blue-100 text-blue-800': user.empleado_rol === 'supervisor',
                  'bg-green-100 text-green-800': user.empleado_rol === 'cajero'
                }">
                {{ getRoleLabel(user.empleado_rol) }}
              </span>
            </td>

            <!-- NetSuite ID - Inline Editable -->
            <td class="px-6 py-4">
              <InlineEditField
                :model-value="user.empleado_netsuite_id"
                placeholder="Sin configurar"
                :maxlength="50"
                @save="(value) => updateNetsuiteId(user.empleado_id, value)"
              />
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span v-if="user.empleado_netsuite_id" class="inline-flex items-center text-green-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </span>
              <span v-else class="inline-flex items-center text-gray-400">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p class="mt-1 text-sm text-gray-500">
          No se encontraron usuarios para configurar.
        </p>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { posEmpleadosApi } from '../services/posEmpleadosApi';
import InlineEditField from '../components/InlineEditField.vue';

const authStore = useAuthStore();
const loading = ref(true);
const users = ref([]);
const successMessage = ref('');

const currentStoreId = computed(() => authStore.selectedStore?.id || null);

// Fetch users
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await posEmpleadosApi.getAll(currentStoreId.value);
    users.value = response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Error al cargar los usuarios');
  } finally {
    loading.value = false;
  }
};

// Update NetSuite ID
const updateNetsuiteId = async (empleadoId, netsuiteId) => {
  try {
    await posEmpleadosApi.update(empleadoId, {
      empleado_netsuite_id: netsuiteId || null
    });

    // Update local data
    const userIndex = users.value.findIndex(u => u.empleado_id === empleadoId);
    if (userIndex !== -1) {
      users.value[userIndex].empleado_netsuite_id = netsuiteId;
    }

    // Show success message
    showSuccessMessage('NetSuite ID actualizado correctamente');
  } catch (error) {
    console.error('Error updating NetSuite ID:', error);
    throw new Error('Error al actualizar el NetSuite ID');
  }
};

// Helper: Get user initials
const getUserInitials = (user) => {
  const firstInitial = user.empleado_nombres?.charAt(0) || '';
  const lastInitial = user.empleado_apellidos?.charAt(0) || '';
  return (firstInitial + lastInitial).toUpperCase();
};

// Helper: Get role label
const getRoleLabel = (role) => {
  const labels = {
    'administrador': 'Administrador',
    'supervisor': 'Supervisor',
    'cajero': 'Cajero'
  };
  return labels[role] || role;
};

// Helper: Show success message
const showSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

onMounted(() => {
  fetchUsers();
});
</script>
