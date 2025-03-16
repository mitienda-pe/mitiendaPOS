<template>
  <div class="min-h-screen bg-gray-100">
    <template v-if="authStore.isAuthenticated">
      <!-- Navigation -->
      <nav class="bg-gray-800 flex-shrink-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img src="@/assets/logo-mitiendapos.svg" alt="MiTiendaPOS Logo" class="h-8" />
              </div>
              <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-4">
                  <router-link v-if="['cajero', 'supervisor', 'administrador'].includes(authStore.userRole)" to="/menu"
                    class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    active-class="bg-gray-900 text-white">
                    Menú Principal
                  </router-link>
                </div>
              </div>
            </div>
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <div class="ml-3 relative">
                  <div class="flex items-center">
                    <span class="text-gray-300 text-sm mr-4">{{ authStore.user?.name }}</span>
                    <button @click="authStore.logout"
                      class="bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </template>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-gray-700">Cargando...</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <router-view v-if="!isLoading"></router-view>
    </main>

    <!-- Global Error Handler -->
    <div v-if="errorMessage"
      class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <span class="block sm:inline">{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="absolute top-0 bottom-0 right-0 px-4 py-3">
        <span class="sr-only">Cerrar</span>
        <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');
const isLoading = ref(true);

// Global error handler
window.onerror = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

// Check session on app initialization
onMounted(async () => {
  try {
    const hasValidSession = await authStore.checkSession();
    if (!hasValidSession && router.currentRoute.value.name !== 'login') {
      router.push('/login');
    }
  } catch (error) {
    console.error('Error checking session:', error);
    errorMessage.value = 'Error al verificar la sesión';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
