<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Facturación electrónica</h1>
      <p class="text-sm text-gray-500 mt-1">Elige cómo quieres emitir tus comprobantes ante SUNAT. Tu tienda usa un proveedor a la vez.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <!-- Bizlinks -->
      <router-link
        to="/settings/billing/bizlinks"
        class="block bg-white rounded-lg shadow-sm p-5 border border-transparent hover:border-primary-300 hover:shadow transition"
      >
        <div class="flex items-start justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-800">Bizlinks</h2>
          <span v-if="activeProviderId === 3" class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activo</span>
          <span v-else class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">Incluido en el plan</span>
        </div>
        <p class="text-sm text-gray-500">
          Emite gratis con el bundle incluido en tu plan, o con tus propias credenciales Bizlinks.
        </p>
      </router-link>

      <!-- Nubefact -->
      <router-link
        to="/settings/billing/nubefact"
        class="block bg-white rounded-lg shadow-sm p-5 border border-transparent hover:border-primary-300 hover:shadow transition"
      >
        <div class="flex items-start justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-800">Nubefact</h2>
          <span v-if="activeProviderId === 2" class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activo</span>
        </div>
        <p class="text-sm text-gray-500">
          Configura tus credenciales de Nubefact para emitir comprobantes.
        </p>
      </router-link>
    </div>

    <p class="text-xs text-gray-400 mt-4 max-w-3xl">
      Para cambiar de proveedor, primero elimina la configuración del proveedor activo.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import billingApi from '../../../services/billingApi';

// provider_id: 2 = Nubefact, 3 = Bizlinks
const activeProviderId = ref(null);

onMounted(async () => {
  try {
    const res = await billingApi.getStatus();
    const data = res?.data ?? res;
    activeProviderId.value = data?.provider_configured ? (data?.provider_id ?? null) : null;
  } catch (e) {
    activeProviderId.value = null;
  }
});
</script>
