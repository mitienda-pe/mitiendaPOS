<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Preferencias</h1>
      <p class="text-sm text-gray-500 mt-1">
        Moneda, límites de monto y entrega que aplican a tus ventas.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSave">
      <div v-if="message" :class="['rounded-md px-4 py-3 text-sm', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
        {{ message }}
      </div>

      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Moneda</h2>
        <div class="max-w-sm">
          <label class="form-label">Moneda de la tienda</label>
          <select v-model.number="form.moneda_id" class="input-field">
            <option v-for="c in currencies" :key="c.moneda_id" :value="c.moneda_id">
              {{ c.moneda_nombre }} ({{ c.moneda_simbolo }})
            </option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Se usa para mostrar precios y emitir comprobantes.</p>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Límites de monto</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label class="form-label">Monto mínimo de venta</label>
            <input v-model.number="form.tiendageneral_montominimo" type="number" min="0" step="0.01" class="input-field" placeholder="0.00" />
            <p class="text-xs text-gray-400 mt-1">Deja 0 para no exigir mínimo.</p>
          </div>
          <div>
            <label class="form-label">Monto máximo de venta</label>
            <input v-model.number="form.tiendageneral_montomaximo" type="number" min="0" step="0.01" class="input-field" placeholder="100000.00" />
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Entrega</h2>

        <label class="inline-flex items-center gap-2" :class="canEnableDelivery ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'">
          <input
            v-model="form.tiendageneral_sw_pos_entregaadomicilio"
            type="checkbox"
            :disabled="!canEnableDelivery"
            class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span class="text-sm text-gray-700">Vender con envío a domicilio desde el POS</span>
        </label>

        <p v-if="canEnableDelivery" class="text-xs text-gray-400 mt-2">
          El vendedor podrá tomar el pedido con la dirección del cliente. El costo sale de tu
          tarifario de reparto, igual que en la tienda web.
        </p>
        <p v-else class="text-xs text-amber-600 mt-2">
          {{ deliveryBlockReason }} Configúralo en Envíos para poder activarlo.
        </p>
      </section>

      <div class="flex justify-end">
        <button type="submit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { storeApi } from '../../services/storeApi';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const message = ref('');
const messageType = ref('success');
const currencies = ref([]);

// Motivo por el que la tienda todavía no puede vender a domicilio (reparto
// apagado, sin coberturas, ítem de envío del ERP sin configurar), o null si ya
// puede. Lo calcula la API: el POS no replica esas condiciones para no divergir
// del enforcement que corre al crear la venta.
const deliveryBlockReason = ref(null);
const canEnableDelivery = computed(() => deliveryBlockReason.value === null);

const form = reactive({
  moneda_id: 1,
  tiendageneral_montominimo: 0,
  tiendageneral_montomaximo: 100000,
  tiendageneral_sw_pos_entregaadomicilio: false,
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const loadData = async () => {
  loading.value = true;
  try {
    const [config, currencyList] = await Promise.all([
      storeApi.getConfig(),
      storeApi.getCurrencies().catch(() => []),
    ]);
    currencies.value = currencyList;
    if (config) {
      form.moneda_id = Number(config.moneda_id) || 1;
      form.tiendageneral_montominimo = config.tiendageneral_montominimo != null ? Number(config.tiendageneral_montominimo) : 0;
      form.tiendageneral_montomaximo = config.tiendageneral_montomaximo != null ? Number(config.tiendageneral_montomaximo) : 100000;
      form.tiendageneral_sw_pos_entregaadomicilio = Number(config.tiendageneral_sw_pos_entregaadomicilio) === 1;
      deliveryBlockReason.value = config.pos_delivery_config_reason ?? null;
    }
  } catch (e) {
    showMessage('No se pudieron cargar las preferencias.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  message.value = '';
  try {
    const updated = await storeApi.updateConfig({
      moneda_id: form.moneda_id,
      tiendageneral_montominimo: form.tiendageneral_montominimo,
      tiendageneral_montomaximo: form.tiendageneral_montomaximo,
      tiendageneral_sw_pos_entregaadomicilio: form.tiendageneral_sw_pos_entregaadomicilio ? 1 : 0,
    });
    if (updated) {
      deliveryBlockReason.value = updated.pos_delivery_config_reason ?? null;
    }
    // `pos_delivery_enabled` se resuelve en /pos/access y queda cacheado en
    // selectedStore desde el login. Sin este refresh, el toggle de entrega no
    // aparece en el mostrador hasta que el cajero cierre sesión.
    await auth.refreshAccessFlags().catch(() => {});
    showMessage('Preferencias guardadas correctamente.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al guardar las preferencias.', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
</script>
