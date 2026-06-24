<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Facturación electrónica — Bizlinks</h1>
      <p class="text-sm text-gray-500 mt-1">Emite tus comprobantes ante SUNAT con Bizlinks. Puedes usar la facturación incluida en tu plan o tus propias credenciales.</p>
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
          {{ configured ? 'Bizlinks configurado' : 'Bizlinks no configurado' }}
        </p>
        <p :class="['text-sm mt-1', configured ? 'text-green-700' : 'text-yellow-700']">
          {{ configured
            ? 'Tu facturación con Bizlinks está guardada. Puedes actualizarla.'
            : 'Completa la configuración para empezar a emitir con Bizlinks.' }}
        </p>
      </div>

      <div v-if="message" :class="['rounded-md px-4 py-3 text-sm', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
        {{ message }}
      </div>

      <!-- Modo de facturación -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Modo de facturación</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" value="shared" v-model="form.mode" class="text-primary-600 focus:ring-primary-500" />
            <span>Incluida en el plan <span class="text-gray-400">— recomendado</span></span>
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" value="rest" v-model="form.mode" class="text-primary-600 focus:ring-primary-500" />
            <span>Usar mis propias credenciales Bizlinks</span>
          </label>
        </div>
        <p class="text-sm text-gray-500 mt-3">
          Incluida en el plan: emites con el bundle de Bizlinks de MiTienda, sin costo y sin ingresar credenciales. Credenciales propias: usas tu propia cuenta Bizlinks.
        </p>
      </section>

      <!-- Incluida en el plan: banner -->
      <div v-if="isShared" class="rounded-lg p-4 border bg-blue-50 border-blue-200 text-sm text-blue-800">
        Emites con el bundle de Bizlinks de MiTienda — no necesitas usuario ni contraseña. Completa tus datos fiscales y series abajo.
        MiTienda registra tu RUC en Bizlinks para activarlo; una vez activo podrás emitir.
      </div>

      <!-- Credenciales propias -->
      <section v-if="isOwn" class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Credenciales Bizlinks</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Usuario <span class="text-red-500">*</span></label>
            <input v-model="form.bizlinks_user" type="text" class="input-field" placeholder="usuario" />
          </div>
          <div>
            <label class="form-label">Contraseña <span v-if="!configured" class="text-red-500">*</span></label>
            <input v-model="form.bizlinks_password" type="password" class="input-field" placeholder="••••••••" />
            <p class="text-xs text-gray-400 mt-1">Se guarda cifrada. Al editar, déjala vacía para conservar la guardada.</p>
          </div>
        </div>
      </section>

      <!-- Datos del emisor -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Datos del emisor</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">RUC <span class="text-red-500">*</span></label>
            <input v-model="form.ruc_emisor" type="text" maxlength="11" class="input-field" placeholder="20123456789" />
          </div>
          <div>
            <label class="form-label">Razón social <span class="text-red-500">*</span></label>
            <input v-model="form.razon_social" type="text" class="input-field" placeholder="MI EMPRESA S.A.C." />
          </div>
          <div>
            <label class="form-label">Nombre comercial</label>
            <input v-model="form.nombre_comercial" type="text" class="input-field" placeholder="Mi Tienda" />
          </div>
          <div>
            <label class="form-label">Ubigeo</label>
            <input v-model="form.ubigeo" type="text" maxlength="6" class="input-field" placeholder="150101" />
          </div>
          <div class="md:col-span-2">
            <label class="form-label">Dirección fiscal</label>
            <input v-model="form.direccion" type="text" class="input-field" placeholder="Av. Ejemplo 123" />
          </div>
          <div class="md:col-span-2">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="facturacion@empresa.com" />
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

      <!-- Ambiente (solo credenciales propias) y formato -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ isOwn ? 'Ambiente y formato' : 'Formato de impresión' }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="isOwn">
            <span class="form-label">Ambiente</span>
            <div class="flex gap-4 mt-1">
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="production" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" /> Producción
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" value="development" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" /> Prueba
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
          <span class="text-sm font-medium text-gray-700">{{ autoEmissionEnabled ? 'Activa' : 'Inactiva' }}</span>
          <button
            type="button"
            role="switch"
            :aria-checked="autoEmissionEnabled"
            @click="autoEmissionEnabled = !autoEmissionEnabled"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="autoEmissionEnabled ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="autoEmissionEnabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </section>

      <!-- Acciones -->
      <div class="flex flex-wrap gap-3">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Guardando...' : (configured ? 'Actualizar' : 'Guardar') }}
        </button>
        <button v-if="configured && isOwn" type="button" class="btn-secondary" :disabled="testing" @click="handleTest">
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
  mode: 'shared',
  bizlinks_user: '',
  bizlinks_password: '',
  ruc_emisor: '',
  razon_social: '',
  nombre_comercial: '',
  direccion: '',
  ubigeo: '',
  email: '',
  serie_factura: '',
  numero_factura: null,
  serie_boleta: '',
  numero_boleta: null,
  environment: 'production',
  pdf_format: 'TICKET',
  blocked: true,
});

const isShared = computed(() => form.mode === 'shared');
const isOwn = computed(() => form.mode === 'rest');

// blocked = true => emisión automática DESACTIVADA (igual que Nubefact/backoffice)
const autoEmissionEnabled = computed({
  get: () => !form.blocked,
  set: (val) => { form.blocked = !val; },
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 5000);
};

const load = async () => {
  loading.value = true;
  try {
    const res = await billingApi.getBizlinksConfig();
    const config = res?.data ?? res;
    configured.value = !!config?.configured;
    const creds = config?.credentials;
    // Modo guardado; default 'shared' para tiendas nuevas.
    form.mode = config?.mode || creds?.mode || 'shared';
    if (configured.value && creds) {
      form.bizlinks_user = creds.bizlinks_user || '';
      form.bizlinks_password = '';
      form.ruc_emisor = creds.ruc_emisor || '';
      form.razon_social = creds.razon_social || '';
      form.nombre_comercial = creds.nombre_comercial || '';
      form.direccion = creds.direccion || '';
      form.ubigeo = creds.ubigeo || '';
      form.email = creds.email || '';
      form.serie_factura = creds.serie_factura || '';
      form.numero_factura = creds.numero_factura ? Number(creds.numero_factura) : null;
      form.serie_boleta = creds.serie_boleta || '';
      form.numero_boleta = creds.numero_boleta ? Number(creds.numero_boleta) : null;
      form.environment = creds.environment || 'production';
      form.pdf_format = creds.pdf_format || 'TICKET';
      form.blocked = config.blocked ?? true;
    }
  } catch (e) {
    showMessage('No se pudo cargar la configuración de Bizlinks.', 'error');
  } finally {
    loading.value = false;
  }
};

const buildPayload = () => {
  const payload = {
    mode: form.mode,
    ruc_emisor: form.ruc_emisor.trim(),
    razon_social: form.razon_social.trim(),
    environment: form.environment,
    pdf_format: form.pdf_format,
    blocked: form.blocked,
  };
  // Credenciales propias: usuario; password solo si se ingresó una nueva.
  if (isOwn.value) {
    payload.bizlinks_user = form.bizlinks_user.trim();
    if (form.bizlinks_password) payload.bizlinks_password = form.bizlinks_password;
  }
  if (form.nombre_comercial) payload.nombre_comercial = form.nombre_comercial.trim();
  if (form.direccion) payload.direccion = form.direccion.trim();
  if (form.ubigeo) payload.ubigeo = form.ubigeo.trim();
  if (form.email) payload.email = form.email.trim();
  if (form.serie_factura) payload.serie_factura = form.serie_factura;
  if (form.numero_factura) payload.numero_factura = form.numero_factura;
  if (form.serie_boleta) payload.serie_boleta = form.serie_boleta;
  if (form.numero_boleta) payload.numero_boleta = form.numero_boleta;
  return payload;
};

const validate = () => {
  if (!/^\d{11}$/.test(form.ruc_emisor.trim())) {
    showMessage('El RUC debe tener 11 dígitos.', 'error');
    return false;
  }
  if (!form.razon_social.trim()) {
    showMessage('La razón social es obligatoria.', 'error');
    return false;
  }
  if (isOwn.value) {
    if (!form.bizlinks_user.trim()) {
      showMessage('El usuario de Bizlinks es obligatorio.', 'error');
      return false;
    }
    if (!form.bizlinks_password && !configured.value) {
      showMessage('La contraseña de Bizlinks es obligatoria.', 'error');
      return false;
    }
  }
  return true;
};

const handleSave = async () => {
  if (!validate()) return;
  saving.value = true;
  message.value = '';
  try {
    const payload = buildPayload();
    if (configured.value) {
      await billingApi.updateBizlinksCredentials(payload);
    } else {
      await billingApi.saveBizlinksCredentials(payload);
    }
    showMessage('Configuración guardada correctamente.');
    await load();
  } catch (e) {
    const errs = e?.response?.data;
    const msg = errs?.messages
      ? Object.values(errs.messages).join(' ')
      : (errs && typeof errs === 'object' && !errs.message ? Object.values(errs).join(' ') : errs?.message);
    showMessage(msg || 'Error al guardar la configuración.', 'error');
  } finally {
    saving.value = false;
  }
};

const handleTest = async () => {
  testing.value = true;
  message.value = '';
  try {
    const res = await billingApi.testBizlinksConnection();
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
  if (!confirm('¿Eliminar la configuración de Bizlinks?')) return;
  try {
    await billingApi.deleteBizlinksCredentials();
    configured.value = false;
    Object.assign(form, {
      mode: 'shared', bizlinks_user: '', bizlinks_password: '', ruc_emisor: '', razon_social: '',
      nombre_comercial: '', direccion: '', ubigeo: '', email: '', serie_factura: '', numero_factura: null,
      serie_boleta: '', numero_boleta: null, environment: 'production', pdf_format: 'TICKET', blocked: true,
    });
    showMessage('Configuración eliminada.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al eliminar la configuración.', 'error');
  }
};

onMounted(load);
</script>
