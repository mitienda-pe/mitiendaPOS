<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Facturación electrónica</h1>
      <p class="text-sm text-gray-500 mt-1">Configura tus credenciales de Nubefact para emitir comprobantes ante SUNAT.</p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <form v-else class="space-y-6 max-w-3xl" @submit.prevent="handleSave">
      <!-- Estado -->
      <div :class="['rounded-lg p-4 border', configured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200']">
        <p :class="['font-semibold text-sm', configured ? 'text-green-800' : 'text-yellow-800']">
          {{ configured ? 'Nubefact configurado' : 'Nubefact no configurado' }}
        </p>
        <p :class="['text-sm mt-1', configured ? 'text-green-700' : 'text-yellow-700']">
          {{ configured
            ? 'Tus credenciales están guardadas. Puedes actualizarlas o probar la conexión.'
            : 'Configura tus credenciales de Nubefact para empezar a emitir comprobantes.' }}
        </p>
      </div>

      <div v-if="message" :class="['rounded-md px-4 py-3 text-sm', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
        {{ message }}
      </div>

      <!-- Credenciales -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Credenciales</h2>
        <div class="space-y-4">
          <div>
            <label class="form-label">URL de Nubefact <span class="text-red-500">*</span></label>
            <input v-model="form.nubefact_url" type="url" class="input-field" placeholder="https://api.nubefact.com/api/v1/..." />
          </div>
          <div>
            <label class="form-label">Token de autenticación <span class="text-red-500">*</span></label>
            <input v-model="form.api_token" type="text" class="input-field" placeholder="Token de Nubefact" />
          </div>
        </div>
      </section>

      <!-- Series -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Series de documentos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Serie de factura</label>
            <input v-model="form.serie_factura" type="text" maxlength="4" class="input-field" placeholder="F001" />
          </div>
          <div>
            <label class="form-label">Número inicial (factura)</label>
            <input v-model.number="form.numero_factura" type="number" min="1" class="input-field" placeholder="1" />
          </div>
          <div>
            <label class="form-label">Serie de boleta</label>
            <input v-model="form.serie_boleta" type="text" maxlength="4" class="input-field" placeholder="B001" />
          </div>
          <div>
            <label class="form-label">Número inicial (boleta)</label>
            <input v-model.number="form.numero_boleta" type="number" min="1" class="input-field" placeholder="1" />
          </div>
        </div>
      </section>

      <!-- Ambiente y formato -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Ambiente y formato</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span class="form-label">Ambiente</span>
            <div class="flex gap-4 mt-1">
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="produccion" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" /> Producción
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="prueba" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" /> Prueba
              </label>
            </div>
          </div>
          <div>
            <span class="form-label">Formato de impresión</span>
            <div class="flex gap-4 mt-1">
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="A4" v-model="form.pdf_format" class="text-primary-600 focus:ring-primary-500" /> A4
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="TICKET" v-model="form.pdf_format" class="text-primary-600 focus:ring-primary-500" /> Ticket (80mm)
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Emisión automática -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Emisión automática</h2>
        <p class="text-sm text-gray-500 mb-4">
          Cuando está activa, los comprobantes se emiten automáticamente ante SUNAT al confirmarse el pago.
          Si la apagas, deberás emitir cada comprobante manualmente.
        </p>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            {{ autoEmissionEnabled ? 'Activa' : 'Inactiva' }}
          </span>
          <button
            type="button"
            role="switch"
            :aria-checked="autoEmissionEnabled"
            @click="autoEmissionEnabled = !autoEmissionEnabled"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="autoEmissionEnabled ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="autoEmissionEnabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </section>

      <!-- Acciones -->
      <div class="flex flex-wrap gap-3">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Guardando...' : (configured ? 'Actualizar credenciales' : 'Guardar credenciales') }}
        </button>
        <button v-if="configured" type="button" class="btn-secondary" :disabled="testing" @click="handleTest">
          {{ testing ? 'Probando...' : 'Probar conexión' }}
        </button>
        <button v-if="configured" type="button" class="px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 text-sm" @click="handleDelete">
          Eliminar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import billingApi from '../../../services/billingApi';

const loading = ref(true);
const saving = ref(false);
const testing = ref(false);
const configured = ref(false);
const message = ref('');
const messageType = ref('success');

const form = reactive({
  nubefact_url: '',
  api_token: '',
  serie_factura: '',
  numero_factura: null,
  serie_boleta: '',
  numero_boleta: null,
  environment: 'prueba',
  pdf_format: 'TICKET',
  blocked: true,
});

// blocked = true significa emisión automática DESACTIVADA (igual que el backoffice)
const autoEmissionEnabled = computed({
  get: () => !form.blocked,
  set: (val) => { form.blocked = !val; },
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const load = async () => {
  loading.value = true;
  try {
    const res = await billingApi.getNubefactConfig();
    const config = res?.data ?? res;
    configured.value = !!config?.configured;
    const creds = config?.credentials;
    if (configured.value && creds) {
      form.nubefact_url = creds.nubefact_url || '';
      form.api_token = creds.api_token || '';
      form.serie_factura = creds.serie_factura || '';
      form.numero_factura = creds.numero_factura ? Number(creds.numero_factura) : null;
      form.serie_boleta = creds.serie_boleta || '';
      form.numero_boleta = creds.numero_boleta ? Number(creds.numero_boleta) : null;
      form.environment = creds.environment || 'prueba';
      form.pdf_format = creds.pdf_format || 'TICKET';
      form.blocked = config.blocked ?? true;
    }
  } catch (e) {
    showMessage('No se pudo cargar la configuración de Nubefact.', 'error');
  } finally {
    loading.value = false;
  }
};

const buildPayload = () => {
  const payload = {
    nubefact_url: form.nubefact_url.trim(),
    api_token: form.api_token.trim(),
    environment: form.environment,
    pdf_format: form.pdf_format,
    blocked: form.blocked,
  };
  if (form.serie_factura) payload.serie_factura = form.serie_factura;
  if (form.numero_factura) payload.numero_factura = form.numero_factura;
  if (form.serie_boleta) payload.serie_boleta = form.serie_boleta;
  if (form.numero_boleta) payload.numero_boleta = form.numero_boleta;
  return payload;
};

const handleSave = async () => {
  if (!form.nubefact_url.trim() || !form.api_token.trim()) {
    showMessage('La URL y el token son obligatorios.', 'error');
    return;
  }
  saving.value = true;
  message.value = '';
  try {
    const payload = buildPayload();
    if (configured.value) {
      await billingApi.updateNubefactCredentials(payload);
    } else {
      await billingApi.saveNubefactCredentials(payload);
    }
    showMessage('Credenciales guardadas correctamente.');
    await load();
  } catch (e) {
    const errs = e?.response?.data;
    const msg = errs?.messages
      ? Object.values(errs.messages).join(' ')
      : (errs && typeof errs === 'object' && !errs.message ? Object.values(errs).join(' ') : errs?.message);
    showMessage(msg || 'Error al guardar las credenciales.', 'error');
  } finally {
    saving.value = false;
  }
};

const handleTest = async () => {
  testing.value = true;
  message.value = '';
  try {
    const res = await billingApi.testNubefactConnection();
    if (res?.success && res?.data?.connected) {
      showMessage(`Conexión correcta (ambiente: ${res.data.environment}).`);
    } else {
      showMessage(res?.message || 'No se pudo validar la conexión.', 'error');
    }
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al probar la conexión.', 'error');
  } finally {
    testing.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm('¿Eliminar las credenciales de Nubefact?')) return;
  try {
    await billingApi.deleteNubefactCredentials();
    configured.value = false;
    Object.assign(form, {
      nubefact_url: '', api_token: '', serie_factura: '', numero_factura: null,
      serie_boleta: '', numero_boleta: null, environment: 'prueba', pdf_format: 'TICKET', blocked: true,
    });
    showMessage('Credenciales eliminadas.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al eliminar las credenciales.', 'error');
  }
};

onMounted(load);
</script>
