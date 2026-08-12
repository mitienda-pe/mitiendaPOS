<template>
  <div
    v-if="newVersionAvailable"
    class="px-4 py-3 flex items-center justify-between gap-4"
    :class="saleInProgress ? 'bg-amber-500 text-white' : 'bg-primary-600 text-white'"
    role="status"
  >
    <div class="text-sm">
      <strong>Hay una nueva versión disponible{{ latestVersion ? ` (v${latestVersion})` : '' }}.</strong>
      <template v-if="saleInProgress">
        Termina o guarda la venta en curso antes de actualizar: al refrescar se pierde el carrito.
      </template>
      <template v-else>
        Refresca para usar la última versión del POS.
      </template>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button
        @click="handleReload"
        class="bg-white px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap hover:bg-gray-50"
        :class="saleInProgress ? 'text-amber-700' : 'text-primary-700'"
      >
        Actualizar ahora
      </button>
      <button
        @click="dismiss"
        class="text-white/80 hover:text-white text-sm px-1"
        aria-label="Cerrar aviso"
        title="Cerrar aviso"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVersionCheck } from '../composables/useVersionCheck';
import { useCartStore } from '../stores/cart';

const { newVersionAvailable, latestVersion, reload, dismiss } = useVersionCheck();
const cartStore = useCartStore();

const saleInProgress = computed(() => cartStore.hasItems);

const handleReload = () => {
  if (saleInProgress.value) {
    const ok = window.confirm(
      'Hay una venta en curso. Si actualizas ahora se perderá el carrito.\n\n¿Actualizar de todos modos?'
    );
    if (!ok) return;
  }
  reload();
};
</script>
