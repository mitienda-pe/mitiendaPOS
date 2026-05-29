<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Datos de la tienda</h1>
      <p class="text-sm text-gray-500 mt-1">
        Razón social, RUC y datos de contacto. Aparecen en tus comprobantes y tickets.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSave">
      <!-- Feedback -->
      <div v-if="message" :class="['rounded-md px-4 py-3 text-sm', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
        {{ message }}
      </div>

      <!-- Logo -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Logotipo</h2>
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="max-w-full max-h-full object-contain" />
            <span v-else class="text-xs text-gray-400 text-center px-2">Sin logo</span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer">
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" :disabled="uploadingLogo" @change="handleLogoUpload" />
              {{ uploadingLogo ? 'Subiendo...' : 'Subir logo' }}
            </label>
            <button v-if="logoUrl" type="button" class="text-sm text-red-600 hover:text-red-700 text-left" :disabled="uploadingLogo" @click="handleLogoDelete">
              Eliminar logo
            </button>
            <p class="text-xs text-gray-400">JPG, PNG, WebP o SVG. Máx 5 MB.</p>
          </div>
        </div>
      </section>

      <!-- Datos del negocio -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Datos del negocio</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Nombre comercial</label>
            <input v-model="form.tienda_nombre_comercial" type="text" class="input-field" placeholder="Mi Tienda" />
          </div>
          <div>
            <label class="form-label">Razón social</label>
            <input v-model="form.tienda_razonsocial" type="text" class="input-field" placeholder="Mi Empresa S.A.C." />
          </div>
          <div>
            <label class="form-label">RUC</label>
            <input v-model="form.tienda_ruc" type="text" maxlength="20" class="input-field" placeholder="20123456789" />
          </div>
          <div>
            <label class="form-label">Rubro</label>
            <select v-model="form.rubro_id" class="input-field">
              <option :value="null">Selecciona un rubro</option>
              <option v-for="r in rubros" :key="r.rubro_id" :value="Number(r.rubro_id)">{{ r.rubro_nombre }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="form-label">Descripción</label>
            <textarea v-model="form.tienda_descripcion" rows="2" class="input-field" placeholder="Breve descripción del negocio"></textarea>
          </div>
        </div>
      </section>

      <!-- Contacto -->
      <section class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Contacto</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Email</label>
            <input v-model="form.tienda_email" type="email" class="input-field" placeholder="contacto@mitienda.pe" />
          </div>
          <div>
            <label class="form-label">Celular</label>
            <input v-model="form.tienda_telefonocelular1" type="text" maxlength="30" class="input-field" placeholder="999 999 999" />
          </div>
          <div>
            <label class="form-label">Teléfono fijo</label>
            <input v-model="form.tienda_telefonofijo1" type="text" maxlength="30" class="input-field" placeholder="(01) 000 0000" />
          </div>
          <div>
            <label class="form-label">WhatsApp</label>
            <input v-model="form.tienda_whatsapp" type="text" maxlength="30" class="input-field" placeholder="51999999999" />
          </div>
        </div>
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
import { ref, reactive, onMounted } from 'vue';
import { storeApi } from '../../services/storeApi';

const loading = ref(true);
const saving = ref(false);
const uploadingLogo = ref(false);
const message = ref('');
const messageType = ref('success');
const rubros = ref([]);
const logoUrl = ref(null);

const form = reactive({
  tienda_nombre_comercial: '',
  tienda_razonsocial: '',
  tienda_ruc: '',
  tienda_descripcion: '',
  rubro_id: null,
  tienda_email: '',
  tienda_telefonocelular1: '',
  tienda_telefonofijo1: '',
  tienda_whatsapp: '',
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 4000);
};

const loadData = async () => {
  loading.value = true;
  try {
    const [info, rubrosList, appearance] = await Promise.all([
      storeApi.getInfo(),
      storeApi.getRubros().catch(() => []),
      storeApi.getAppearance().catch(() => null),
    ]);
    Object.keys(form).forEach((key) => {
      if (info && info[key] !== undefined && info[key] !== null) {
        form[key] = key === 'rubro_id' ? Number(info[key]) || null : info[key];
      }
    });
    rubros.value = rubrosList;
    logoUrl.value = appearance?.logo_url || null;
  } catch (e) {
    showMessage('No se pudieron cargar los datos de la tienda.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  message.value = '';
  try {
    await storeApi.updateInfo({ ...form });
    showMessage('Datos guardados correctamente.');
  } catch (e) {
    const errs = e?.response?.data;
    const msg = typeof errs === 'object' && errs && !errs.message ? Object.values(errs).join(' ') : null;
    showMessage(msg || e?.response?.data?.message || 'Error al guardar los datos.', 'error');
  } finally {
    saving.value = false;
  }
};

const handleLogoUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  uploadingLogo.value = true;
  try {
    const result = await storeApi.uploadLogo(file);
    logoUrl.value = result?.logo_url || logoUrl.value;
    showMessage('Logo actualizado correctamente.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al subir el logo.', 'error');
  } finally {
    uploadingLogo.value = false;
    event.target.value = '';
  }
};

const handleLogoDelete = async () => {
  uploadingLogo.value = true;
  try {
    const result = await storeApi.deleteLogo();
    logoUrl.value = result?.logo_url || null;
    showMessage('Logo eliminado.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'Error al eliminar el logo.', 'error');
  } finally {
    uploadingLogo.value = false;
  }
};

onMounted(loadData);
</script>
