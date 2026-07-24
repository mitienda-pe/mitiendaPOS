<template>
  <div
    v-if="authStore.isImpersonating"
    class="bg-purple-700 text-white px-4 py-3 flex items-center justify-between"
    role="alert"
  >
    <div class="text-sm">
      <strong>👤 Modo Super-Admin.</strong>
      Estás operando como
      <strong>{{ authStore.impersonatedStoreName || 'una tienda' }}</strong>
      <span v-if="authStore.selectedStore?.id">(#{{ authStore.selectedStore.id }})</span>.
      Los cambios se aplican a esa tienda.
    </div>
    <button
      @click="handleExit"
      :disabled="exiting"
      class="ml-4 bg-white text-purple-700 hover:bg-purple-50 px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap disabled:opacity-50"
    >
      {{ exiting ? 'Saliendo…' : 'Salir de impersonación' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const exiting = ref(false);

const handleExit = async () => {
  exiting.value = true;
  try {
    await authStore.exitImpersonation();
    router.push('/superadmin/stores');
  } catch (error) {
    console.error('Error al salir de impersonación:', error);
    alert('No se pudo salir de la impersonación. Intenta de nuevo.');
  } finally {
    exiting.value = false;
  }
};
</script>
