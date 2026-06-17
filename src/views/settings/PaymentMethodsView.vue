<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Formas de pago</h1>
      <p class="text-sm text-gray-500 mt-1">
        Activa o desactiva los métodos de pago disponibles al cobrar y personaliza su nombre.
      </p>
    </div>

    <div v-if="message" :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
      {{ message }}
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Configuración de Pago con QR (Yape / Plin) -->
    <div v-if="!loading" class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Pago con QR (Yape / Plin)</h2>
        <p class="text-sm text-gray-500 mt-1">
          Sube tu código QR para cobrar con Yape o Plin. El cliente escanea, paga desde su app
          y tú confirmas el pago manualmente. Esta configuración es la misma que usa tu tienda online.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Yape -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 font-bold">Y</span>
              </div>
              <h3 class="text-base font-semibold text-gray-800">Yape</h3>
            </div>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="qr.yape_enabled" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
              <span class="text-sm text-gray-700">{{ qr.yape_enabled ? 'Activo' : 'Inactivo' }}</span>
            </label>
          </div>

          <div v-if="qr.yape_enabled" class="space-y-4 mt-4">
            <div>
              <label class="form-label">Número de teléfono</label>
              <input v-model="qr.yape_business_id" type="text" maxlength="20" placeholder="999 999 999" class="input-field max-w-sm" />
              <p class="text-xs text-gray-400 mt-1">El número asociado a tu cuenta Yape</p>
            </div>
            <div>
              <label class="form-label">Imagen del código QR</label>
              <div v-if="yapePreview || qr.yape_qr_url" class="mt-1">
                <img :src="yapePreview || qr.yape_qr_url" alt="QR Yape"
                  class="w-48 h-48 object-contain border border-gray-200 rounded-lg bg-white p-2" />
                <button type="button" class="mt-2 text-sm text-red-600 hover:text-red-800" @click="removeQr('yape')">
                  Eliminar imagen
                </button>
              </div>
              <div v-else
                class="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                @click="triggerUpload('yape')" @dragover.prevent @drop.prevent="handleDrop('yape', $event)">
                <p class="text-sm text-gray-600">
                  Arrastra tu imagen QR aquí o <span class="text-primary-600 font-medium">haz clic para seleccionar</span>
                </p>
                <p class="text-xs text-gray-400 mt-1">PNG, JPG o WebP. Máx 2MB</p>
              </div>
              <input ref="yapeFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleFile('yape', $event)" />
              <p class="text-xs text-gray-400 mt-1">Descarga tu QR desde la app Yape y súbelo aquí.</p>
            </div>
          </div>
        </div>

        <!-- Plin -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center">
                <span class="text-cyan-600 font-bold">P</span>
              </div>
              <h3 class="text-base font-semibold text-gray-800">Plin</h3>
            </div>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="qr.plin_enabled" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
              <span class="text-sm text-gray-700">{{ qr.plin_enabled ? 'Activo' : 'Inactivo' }}</span>
            </label>
          </div>

          <div v-if="qr.plin_enabled" class="space-y-4 mt-4">
            <div>
              <label class="form-label">Número de teléfono</label>
              <input v-model="qr.plin_business_id" type="text" maxlength="20" placeholder="999 999 999" class="input-field max-w-sm" />
              <p class="text-xs text-gray-400 mt-1">El número asociado a tu cuenta Plin</p>
            </div>
            <div>
              <label class="form-label">Imagen del código QR</label>
              <div v-if="plinPreview || qr.plin_qr_url" class="mt-1">
                <img :src="plinPreview || qr.plin_qr_url" alt="QR Plin"
                  class="w-48 h-48 object-contain border border-gray-200 rounded-lg bg-white p-2" />
                <button type="button" class="mt-2 text-sm text-red-600 hover:text-red-800" @click="removeQr('plin')">
                  Eliminar imagen
                </button>
              </div>
              <div v-else
                class="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                @click="triggerUpload('plin')" @dragover.prevent @drop.prevent="handleDrop('plin', $event)">
                <p class="text-sm text-gray-600">
                  Arrastra tu imagen QR aquí o <span class="text-primary-600 font-medium">haz clic para seleccionar</span>
                </p>
                <p class="text-xs text-gray-400 mt-1">PNG, JPG o WebP. Máx 2MB</p>
              </div>
              <input ref="plinFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleFile('plin', $event)" />
              <p class="text-xs text-gray-400 mt-1">Descarga tu QR desde la app de tu banco y súbelo aquí.</p>
            </div>
          </div>
        </div>

        <!-- Instrucciones -->
        <div>
          <label class="form-label">Instrucciones para el cliente (opcional)</label>
          <textarea v-model="qr.instructions" rows="3" maxlength="500"
            placeholder="Instrucciones que verá el cliente al elegir este método de pago..."
            class="input-field"></textarea>
        </div>

        <div class="flex justify-end">
          <button class="btn-primary" :disabled="qrSaving" @click="saveQr">
            {{ qrSaving ? 'Guardando...' : (qrConfigured ? 'Actualizar QR' : 'Guardar QR') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
      <div v-for="method in methods" :key="method.id" class="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex-1">
          <label class="form-label">Nombre visible</label>
          <input v-model="method.nombre" type="text" maxlength="100" class="input-field max-w-sm" />
          <p class="text-xs text-gray-400 mt-1">Código: {{ method.metodo_codigo }}</p>
        </div>
        <div class="flex items-center gap-6">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="method._habilitado" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
            <span class="text-sm text-gray-700">{{ method._habilitado ? 'Activo' : 'Inactivo' }}</span>
          </label>
          <button class="btn-primary" :disabled="method._saving" @click="save(method)">
            {{ method._saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="mt-4">
      <button class="text-sm text-gray-500 hover:text-gray-700" @click="handleReset">Restaurar valores por defecto</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { paymentMethodsApi } from '../../services/paymentMethodsApi';
import { paymentGatewaysApi } from '../../services/paymentGatewaysApi';
import { usePaymentMethodsStore } from '../../stores/paymentMethods';

const loading = ref(true);
const methods = ref([]);
const message = ref('');
const messageType = ref('success');
const paymentMethodsStore = usePaymentMethodsStore();

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

// ─── Configuración de billeteras QR (Yape / Plin) ───
const qr = reactive({
  yape_enabled: false,
  yape_business_id: '',
  yape_qr_url: '',
  plin_enabled: false,
  plin_business_id: '',
  plin_qr_url: '',
  instructions: '',
});
const qrConfigured = ref(false);
const qrSaving = ref(false);

const yapeFileInput = ref(null);
const plinFileInput = ref(null);
const qrFiles = { yape: null, plin: null };
const yapePreview = ref('');
const plinPreview = ref('');

const loadQr = async () => {
  try {
    const config = await paymentGatewaysApi.getQrWallets();
    qrConfigured.value = !!config?.gateway?.configured;
    const c = config?.credentials || {};
    qr.yape_enabled = !!c.yape_enabled;
    qr.yape_business_id = c.yape_business_id ?? '';
    qr.yape_qr_url = c.yape_qr_url ?? '';
    qr.plin_enabled = !!c.plin_enabled;
    qr.plin_business_id = c.plin_business_id ?? '';
    qr.plin_qr_url = c.plin_qr_url ?? '';
    qr.instructions = c.instructions ?? '';
  } catch (e) {
    // Silencioso: la sección queda en blanco si no se pudo cargar.
    console.warn('[PaymentMethods] No se pudo cargar la config QR:', e?.message);
  }
};

const triggerUpload = (wallet) => {
  (wallet === 'yape' ? yapeFileInput : plinFileInput).value?.click();
};

const setFile = (wallet, file) => {
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    showMessage('Formato no soportado. Usa PNG, JPG o WebP.', 'error');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showMessage('La imagen no debe superar 2MB.', 'error');
    return;
  }
  const previewRef = wallet === 'yape' ? yapePreview : plinPreview;
  if (previewRef.value) URL.revokeObjectURL(previewRef.value);
  qrFiles[wallet] = file;
  previewRef.value = URL.createObjectURL(file);
};

const handleFile = (wallet, event) => {
  setFile(wallet, event.target.files?.[0]);
};

const handleDrop = (wallet, event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) setFile(wallet, file);
};

const removeQr = (wallet) => {
  const previewRef = wallet === 'yape' ? yapePreview : plinPreview;
  if (previewRef.value) URL.revokeObjectURL(previewRef.value);
  previewRef.value = '';
  qrFiles[wallet] = null;
  if (wallet === 'yape') {
    qr.yape_qr_url = '';
    if (yapeFileInput.value) yapeFileInput.value.value = '';
  } else {
    qr.plin_qr_url = '';
    if (plinFileInput.value) plinFileInput.value.value = '';
  }
};

const saveQr = async () => {
  if (!qr.yape_enabled && !qr.plin_enabled) {
    showMessage('Activa al menos una billetera (Yape o Plin).', 'error');
    return;
  }
  qrSaving.value = true;
  try {
    // 1. Subir imágenes nuevas (si las hay) y fijar la URL resultante.
    if (qrFiles.yape) {
      const res = await paymentGatewaysApi.uploadQrImage('yape', qrFiles.yape);
      if (res?.qr_url) {
        qr.yape_qr_url = res.qr_url;
        qrFiles.yape = null;
        if (yapePreview.value) { URL.revokeObjectURL(yapePreview.value); yapePreview.value = ''; }
      }
    }
    if (qrFiles.plin) {
      const res = await paymentGatewaysApi.uploadQrImage('plin', qrFiles.plin);
      if (res?.qr_url) {
        qr.plin_qr_url = res.qr_url;
        qrFiles.plin = null;
        if (plinPreview.value) { URL.revokeObjectURL(plinPreview.value); plinPreview.value = ''; }
      }
    }

    // 2. Guardar la configuración (create la primera vez, update después).
    const payload = { credentials: { ...qr }, environment: 'produccion', enabled: true };
    if (qrConfigured.value) {
      await paymentGatewaysApi.updateQrWallets(payload);
    } else {
      await paymentGatewaysApi.saveQrWallets(payload);
      qrConfigured.value = true;
    }

    // 3. Refrescar el cache que consume el PaymentModal (qr_config).
    await paymentMethodsStore.fetchActive(true);
    showMessage('Configuración de QR guardada.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo guardar la configuración de QR.', 'error');
  } finally {
    qrSaving.value = false;
  }
};

const decorate = (list) => list.map((m) => ({
  ...m,
  _habilitado: Number(m.habilitado) === 1,
  _saving: false,
}));

const load = async () => {
  loading.value = true;
  try {
    methods.value = decorate(await paymentMethodsApi.getAll());
  } catch (e) {
    showMessage('No se pudieron cargar las formas de pago.', 'error');
  } finally {
    loading.value = false;
  }
};

const save = async (method) => {
  if (!method.nombre || !method.nombre.trim()) {
    showMessage('El nombre no puede estar vacío.', 'error');
    return;
  }
  method._saving = true;
  try {
    await paymentMethodsApi.update(method.id, {
      nombre: method.nombre.trim(),
      habilitado: method._habilitado ? 1 : 0,
    });
    showMessage(`"${method.nombre}" actualizado.`);
    // Refrescar cache que consume el PaymentModal.
    await paymentMethodsStore.fetchActive(true);
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al guardar la forma de pago.', 'error');
  } finally {
    method._saving = false;
  }
};

const handleReset = async () => {
  if (!confirm('¿Restaurar las formas de pago a sus valores por defecto?')) return;
  loading.value = true;
  try {
    methods.value = decorate(await paymentMethodsApi.reset());
    await paymentMethodsStore.fetchActive(true);
    showMessage('Formas de pago restauradas.');
  } catch (e) {
    showMessage('No se pudieron restaurar las formas de pago.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([load(), loadQr()]);
});

onBeforeUnmount(() => {
  if (yapePreview.value) URL.revokeObjectURL(yapePreview.value);
  if (plinPreview.value) URL.revokeObjectURL(plinPreview.value);
});
</script>
