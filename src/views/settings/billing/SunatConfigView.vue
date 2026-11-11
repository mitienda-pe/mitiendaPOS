<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Facturación MiTienda</h1>
      <p class="text-sm text-gray-500 mt-1">
        Emite tus comprobantes directo a SUNAT, sin contratar un proveedor externo.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- La tienda no está habilitada: se llegó por URL directa. El backend
         rechaza igual la escritura; esto evita un formulario que no serviría. -->
    <div v-else-if="!available" class="max-w-3xl rounded-lg p-4 border bg-yellow-50 border-yellow-200">
      <p class="font-semibold text-sm text-yellow-800">Todavía no está habilitada para esta tienda</p>
      <p class="text-sm mt-1 text-yellow-700">
        Escríbenos si quieres activar la emisión directa a SUNAT.
      </p>
    </div>

    <form v-else class="space-y-6 max-w-3xl" @submit.prevent="handleSave">
      <!-- Estado -->
      <div :class="['rounded-lg p-4 border', configured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200']">
        <p :class="['font-semibold text-sm', configured ? 'text-green-800' : 'text-yellow-800']">
          {{ configured ? 'Facturación MiTienda activa' : 'Facturación MiTienda sin configurar' }}
        </p>
        <p :class="['text-sm mt-1', configured ? 'text-green-700' : 'text-yellow-700']">
          {{ configured
            ? 'Tu empresa está registrada y puede emitir comprobantes.'
            : 'Completa los tres pasos para empezar a emitir.' }}
        </p>
      </div>

      <div v-if="message" :class="['rounded-md px-4 py-3 text-sm', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
        {{ message }}
      </div>

      <!-- El CDT gratuito dura un año: cuando vence, la tienda deja de emitir
           sin explicación si nadie avisó antes. -->
      <div v-if="certWarning" class="rounded-md px-4 py-3 text-sm bg-amber-50 text-amber-800 border border-amber-200">
        {{ certWarning }}
      </div>

      <!-- Pasos -->
      <ol class="flex items-center gap-2 text-sm">
        <li v-for="(titulo, i) in pasos" :key="titulo" class="flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
            :class="paso === i + 1 ? 'bg-primary-600 text-white' : (paso > i + 1 ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500')"
          >{{ i + 1 }}</span>
          <span :class="paso === i + 1 ? 'font-medium text-gray-800' : 'text-gray-500'">{{ titulo }}</span>
          <span v-if="i < pasos.length - 1" class="text-gray-300">›</span>
        </li>
      </ol>

      <!-- Paso 1: datos fiscales -->
      <section v-show="paso === 1" class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Datos de tu empresa</h2>
        <p class="text-sm text-gray-500 mb-4">
          Tienen que coincidir exactamente con lo que figura en tu ficha RUC de SUNAT.
        </p>
        <div class="space-y-4">
          <div>
            <label class="form-label">RUC <span class="text-red-500">*</span></label>
            <input v-model="form.ruc_emisor" type="text" inputmode="numeric" maxlength="11" class="input-field" placeholder="20123456789" />
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
            <label class="form-label">Domicilio fiscal <span class="text-red-500">*</span></label>
            <input v-model="form.direccion" type="text" class="input-field" placeholder="AV. LIMA 100" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="form-label">Ubigeo <span class="text-red-500">*</span></label>
              <input v-model="form.ubigeo" type="text" inputmode="numeric" maxlength="6" class="input-field" placeholder="150101" />
            </div>
            <div>
              <label class="form-label">Departamento</label>
              <input v-model="form.departamento" type="text" class="input-field" placeholder="LIMA" />
            </div>
            <div>
              <label class="form-label">Provincia</label>
              <input v-model="form.provincia" type="text" class="input-field" placeholder="LIMA" />
            </div>
            <div>
              <label class="form-label">Distrito</label>
              <input v-model="form.distrito" type="text" class="input-field" placeholder="MIRAFLORES" />
            </div>
          </div>
          <div v-if="configured" class="flex justify-end">
            <button type="button" class="btn-secondary" :disabled="saving" @click="guardarPaso(1)">
              {{ saving ? 'Guardando...' : 'Guardar datos de la empresa' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Paso 2: SOL y certificado -->
      <section v-show="paso === 2" class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Clave SOL y certificado digital</h2>

        <div class="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 mb-4">
          Usa un <strong>usuario SOL secundario</strong> con el permiso de facturación
          electrónica, no tu clave principal. El certificado es el archivo
          <strong>.pfx</strong> o <strong>.p12</strong> que descargas de SUNAT.
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Usuario SOL <span class="text-red-500">*</span></label>
              <input v-model="form.sol_user" type="text" autocapitalize="characters" class="input-field" placeholder="FACTURA1" />
            </div>
            <div>
              <label class="form-label">Clave SOL <span v-if="!configured" class="text-red-500">*</span></label>
              <input v-model="form.sol_pass" type="password" class="input-field" />
              <p v-if="configured" class="text-xs text-gray-500 mt-1">Déjala vacía para mantener la clave actual.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="btn-secondary"
              :disabled="verifyingSol || !form.sol_user || (!form.sol_pass && !configured)"
              @click="handleVerifySol"
            >
              {{ verifyingSol ? 'Verificando...' : 'Verificar clave SOL' }}
            </button>
            <p v-if="solCheck" class="text-sm" :class="solCheckClass">{{ solCheckTexto }}</p>
          </div>
          <p class="text-xs text-gray-500 -mt-2">
            Se consulta a SUNAT sin emitir ningún comprobante ni gastar números de la serie.
            <template v-if="configured && !form.sol_pass">Sin clave escrita, se prueba la que está guardada.</template>
          </p>

          <div>
            <label class="form-label">
              Certificado (.pfx o .p12)
              <span v-if="!configured" class="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pfx,.p12"
              class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white"
              @change="onCertificateSelected"
            />
            <p v-if="certFileName" class="text-xs text-gray-500 mt-1">{{ certFileName }}</p>
            <p v-if="configured && !form.certificado" class="text-xs text-gray-500 mt-1">
              Ya hay un certificado cargado. Sube uno nuevo solo si lo renovaste.
            </p>
          </div>

          <div>
            <label class="form-label">Contraseña del certificado</label>
            <input v-model="form.cert_password" type="password" class="input-field" />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="btn-secondary"
              :disabled="!form.certificado || inspecting"
              @click="handleInspect"
            >
              {{ inspecting ? 'Verificando...' : 'Verificar certificado' }}
            </button>
            <p v-if="certInfo" class="text-sm text-green-700">
              {{ certInfo.subject }} · vence {{ formatDate(certInfo.valido_hasta) }}
            </p>
          </div>
          <p class="text-xs text-gray-500">
            Verificarlo acá evita descubrir que está vencido o que la contraseña no es
            la correcta recién al emitir tu primera venta.
          </p>
          <div v-if="configured" class="flex justify-end">
            <button
              type="button"
              class="btn-secondary"
              :disabled="saving || (!form.sol_pass && !form.certificado)"
              @click="guardarPaso(2)"
            >
              {{ saving ? 'Guardando...' : 'Guardar clave SOL y certificado' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Paso 3: series y ambiente -->
      <section v-show="paso === 3" class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Series y ambiente</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Serie de factura</label>
            <input v-model="form.serie_factura" type="text" maxlength="4" class="input-field" placeholder="F001" />
          </div>
          <div>
            <label class="form-label">Serie de boleta</label>
            <input v-model="form.serie_boleta" type="text" maxlength="4" class="input-field" placeholder="B001" />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          No se pide el correlativo: la numeración la lleva el servicio de emisión, así
          que no tienes que mantenerla al día.
        </p>

        <div class="mt-5">
          <span class="form-label">Ambiente</span>
          <div class="flex gap-4 mt-1">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="beta" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" />
              Pruebas
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="produccion" v-model="form.environment" class="text-primary-600 focus:ring-primary-500" />
              Producción
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            En pruebas los comprobantes no tienen validez tributaria. Cambia a
            producción cuando hayas verificado que todo sale bien.
          </p>
        </div>

        <div class="mt-5">
          <span class="form-label">Formato de impresión</span>
          <div class="flex gap-4 mt-1">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="TICKET" v-model="form.pdf_format" class="text-primary-600 focus:ring-primary-500" />
              Ticket (80mm)
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="A4" v-model="form.pdf_format" class="text-primary-600 focus:ring-primary-500" />
              A4
            </label>
          </div>
        </div>

        <div class="mt-5 pt-5 border-t border-gray-100">
          <h3 class="text-sm font-semibold text-gray-800 mb-1">Emisión automática</h3>
          <p class="text-sm text-gray-500 mb-3">
            Cuando está activa, los comprobantes se emiten automáticamente al
            confirmarse el pago.
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
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="autoEmissionEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
      </section>

      <!-- Navegación y acciones -->
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="btn-secondary" :disabled="paso === 1" @click="paso--">Atrás</button>
        <button v-if="paso < 3" type="button" class="btn-primary" @click="siguiente">Siguiente</button>
        <button v-else type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Guardando...' : (configured ? 'Guardar cambios' : 'Activar facturación') }}
        </button>

        <template v-if="configured">
          <button type="button" class="btn-secondary" :disabled="testing" @click="handleTest">
            {{ testing ? 'Probando...' : 'Probar configuración' }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 text-sm"
            @click="handleDelete"
          >
            Eliminar
          </button>
        </template>
      </div>

      <section v-if="configured" class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-sm font-semibold text-gray-800 mb-3">Estado</h2>
        <dl class="text-sm space-y-2">
          <div class="flex justify-between">
            <dt class="text-gray-500">RUC</dt>
            <dd class="font-medium text-gray-800">{{ credentials?.ruc_emisor || '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Ambiente</dt>
            <dd class="font-medium text-gray-800">
              {{ credentials?.environment === 'produccion' ? 'Producción' : 'Pruebas' }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Certificado vence</dt>
            <dd class="font-medium text-gray-800">{{ formatDate(credentials?.cert_expires_at) }}</dd>
          </div>
        </dl>
        <!-- Dos pruebas distintas: "Servicio" no sale de MiTienda; "Clave SOL"
             pregunta a SUNAT. Un "conexión correcta" solo no garantiza que se
             pueda emitir (Dental Bach: servicio OK y SUNAT con 0111). -->
        <ul v-if="prueba" class="text-sm space-y-2 mt-4 pt-4 border-t border-gray-100">
          <li :class="prueba.servicio.ok ? 'text-green-700' : 'text-red-700'">
            {{ prueba.servicio.ok ? '✓' : '✗' }} <strong>Servicio de facturación:</strong> {{ prueba.servicio.texto }}
          </li>
          <li :class="prueba.sol.clase">
            {{ prueba.sol.ok ? '✓' : '✗' }} <strong>Clave SOL ante SUNAT:</strong> {{ prueba.sol.texto }}
          </li>
        </ul>
      </section>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import billingApi from '../../../services/billingApi';

const loading = ref(true);
const saving = ref(false);
const testing = ref(false);
const inspecting = ref(false);
const configured = ref(false);
const available = ref(false);
const credentials = ref(null);
const message = ref('');
const messageType = ref('success');

const paso = ref(1);
const pasos = ['Empresa', 'SOL y certificado', 'Series'];

const certInfo = ref(null);
const certFileName = ref('');

const form = reactive({
  ruc_emisor: '',
  razon_social: '',
  nombre_comercial: '',
  direccion: '',
  ubigeo: '150101',
  departamento: '',
  provincia: '',
  distrito: '',
  sol_user: '',
  sol_pass: '',
  certificado: '',
  cert_password: '',
  serie_factura: 'F001',
  serie_boleta: 'B001',
  environment: 'beta',
  pdf_format: 'TICKET',
  blocked: true,
});

// blocked = true significa emisión automática DESACTIVADA (igual que el resto)
const autoEmissionEnabled = computed({
  get: () => !form.blocked,
  set: (val) => { form.blocked = !val; },
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 5000);
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-PE');
};

const certWarning = computed(() => {
  const vence = credentials.value?.cert_expires_at;
  if (!vence) return '';
  const dias = Math.ceil((new Date(vence).getTime() - Date.now()) / 86400000);
  if (Number.isNaN(dias)) return '';
  if (dias < 0) return 'Tu certificado digital venció. No podrás emitir hasta renovarlo en SUNAT y volver a cargarlo acá.';
  if (dias <= 30) return `Tu certificado digital vence en ${dias} día${dias === 1 ? '' : 's'}. Renuévalo en SUNAT y vuelve a cargarlo para no quedarte sin emitir.`;
  return '';
});

const load = async () => {
  loading.value = true;
  try {
    const res = await billingApi.getSunatConfig();
    const config = res?.data ?? res;
    available.value = config?.available !== false;
    configured.value = !!config?.configured;
    credentials.value = config?.credentials || null;

    const creds = credentials.value;
    if (configured.value && creds) {
      form.ruc_emisor = creds.ruc_emisor || '';
      form.serie_factura = creds.serie_factura || 'F001';
      form.serie_boleta = creds.serie_boleta || 'B001';
      form.environment = creds.environment || 'beta';
      form.pdf_format = creds.pdf_format || 'TICKET';
      form.blocked = config.blocked ?? true;
    }

    // Razón social, domicilio y usuario SOL viven solo en el servicio de
    // facturación; la API los trae de allá. Sin esto el formulario se abría
    // vacío y guardar pisaba los datos registrados (el ubigeo volvía a 150101).
    const company = config?.company;
    if (configured.value && company) {
      form.ruc_emisor = company.ruc || form.ruc_emisor;
      form.razon_social = company.razon_social || '';
      form.nombre_comercial = company.nombre_comercial || '';
      form.direccion = company.direccion || '';
      form.ubigeo = company.ubigeo || form.ubigeo;
      form.departamento = company.departamento || '';
      form.provincia = company.provincia || '';
      form.distrito = company.distrito || '';
      form.sol_user = company.sol_user || '';
    }
  } catch (e) {
    // Un 403 del backend es la tienda no habilitada, no un fallo.
    if (e?.response?.status === 403) {
      available.value = false;
    } else {
      showMessage('No se pudo cargar la configuración.', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const onCertificateSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  certFileName.value = file.name;
  certInfo.value = null;

  const reader = new FileReader();
  reader.onload = () => {
    // El resultado viene como data URL; al backend va solo el base64.
    const result = String(reader.result || '');
    form.certificado = result.includes(',') ? result.split(',')[1] : result;
  };
  reader.onerror = () => showMessage('No se pudo leer el archivo del certificado.', 'error');
  reader.readAsDataURL(file);
};

const handleInspect = async () => {
  inspecting.value = true;
  certInfo.value = null;
  try {
    const res = await billingApi.inspectSunatCertificate(form.certificado, form.cert_password);
    const data = res?.data ?? res;
    if (res?.success === false) {
      showMessage(res?.message || 'No se pudo leer el certificado.', 'error');
    } else {
      certInfo.value = data;
    }
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo leer el certificado.', 'error');
  } finally {
    inspecting.value = false;
  }
};

const siguiente = () => {
  if (paso.value === 1) {
    if (!/^\d{11}$/.test(form.ruc_emisor)) return showMessage('El RUC debe tener 11 dígitos.', 'error');
    if (!form.razon_social.trim()) return showMessage('La razón social es obligatoria.', 'error');
    if (!form.direccion.trim()) return showMessage('El domicilio fiscal es obligatorio.', 'error');
    if (!/^\d{6}$/.test(form.ubigeo.trim())) return showMessage('El ubigeo debe tener 6 dígitos.', 'error');
  }
  if (paso.value === 2) {
    // Con la empresa registrada, la clave SOL vacía conserva la actual.
    if (!form.sol_user || (!form.sol_pass && !configured.value)) {
      return showMessage('El usuario y la clave SOL son obligatorios.', 'error');
    }
    if (!form.certificado && !configured.value) return showMessage('Carga tu certificado digital.', 'error');
  }
  message.value = '';
  paso.value++;
};

const handleSave = async () => {
  saving.value = true;
  try {
    const res = await billingApi.saveSunatCompany({ ...form }, configured.value);
    if (res?.success === false) {
      showMessage(res?.message || 'No se pudo guardar la configuración.', 'error');
    } else {
      showMessage('Facturación MiTienda configurada correctamente.');
      // La clave SOL y el certificado no vuelven del backend: se limpian para no
      // dejarlos en memoria más de lo necesario.
      form.sol_pass = '';
      form.certificado = '';
      form.cert_password = '';
      certFileName.value = '';
      await load();
    }
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo guardar la configuración.', 'error');
  } finally {
    saving.value = false;
  }
};

/**
 * Guarda solo un paso, con la empresa ya registrada. La API manda al servicio
 * de facturación únicamente lo que llega: corregir el domicilio no exige volver
 * a cargar la clave SOL ni el certificado.
 */
const guardarPaso = async (n) => {
  let datos;
  if (n === 1) {
    if (!form.razon_social.trim()) return showMessage('La razón social es obligatoria.', 'error');
    if (!/^\d{6}$/.test(form.ubigeo.trim())) return showMessage('El ubigeo debe tener 6 dígitos.', 'error');
    datos = {
      razon_social: form.razon_social,
      nombre_comercial: form.nombre_comercial,
      direccion: form.direccion,
      ubigeo: form.ubigeo.trim(),
      departamento: form.departamento,
      provincia: form.provincia,
      distrito: form.distrito,
    };
  } else {
    if (form.sol_pass && !form.sol_user) return showMessage('Falta el usuario SOL.', 'error');
    datos = {
      sol_user: form.sol_user,
      sol_pass: form.sol_pass,
      certificado: form.certificado,
      cert_password: form.cert_password,
    };
  }

  saving.value = true;
  try {
    const res = await billingApi.saveSunatCompany(datos, true);
    if (res?.success === false) {
      showMessage(res?.message || 'No se pudo guardar.', 'error');
      return;
    }
    showMessage('Cambios guardados.');
    if (n === 2) {
      // Los secretos no se quedan en memoria una vez enviados.
      form.sol_pass = '';
      form.certificado = '';
      form.cert_password = '';
      certFileName.value = '';
      certInfo.value = null;
    }
    await load();
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo guardar.', 'error');
  } finally {
    saving.value = false;
  }
};

// ─── Verificación de la clave SOL (sin emitir) ─────────────────────────
const verifyingSol = ref(false);
const solCheck = ref(null);

const textoSol = (r) => {
  if (!r) return '';
  switch (r.estado) {
    case 'ok':
      return 'La clave SOL funciona y tiene permiso para enviar comprobantes.';
    case 'credenciales_invalidas':
      return `SUNAT no reconoce el usuario o la clave SOL. Revísalos. (${r.code})`;
    case 'sin_perfil':
      return 'La clave es correcta, pero SUNAT no permite enviar comprobantes con ella (0111). '
        + 'Revisa los permisos del usuario secundario, la afiliación al SEE – Del Contribuyente y que no tengas un OSE vigente.';
    case 'sin_respuesta':
      return 'SUNAT no respondió. Intenta de nuevo en unos minutos.';
    default:
      return `SUNAT respondió algo inesperado: ${r.mensaje}`;
  }
};

const claseSol = (r) => {
  switch (r?.estado) {
    case 'ok': return 'text-green-700';
    case 'sin_respuesta':
    case 'indeterminado': return 'text-amber-700';
    default: return 'text-red-700';
  }
};

const solCheckTexto = computed(() => textoSol(solCheck.value));
const solCheckClass = computed(() => claseSol(solCheck.value));

/** Devuelve { ok, data } o { ok: false, error }. Sin clave escrita, la API usa la guardada. */
const verificarSolApi = async (datos) => {
  try {
    const res = await billingApi.verifySunatSol(datos);
    if (res?.success === false) return { ok: false, error: res?.message || 'No se pudo verificar la clave SOL.' };
    return { ok: true, data: res?.data ?? res };
  } catch (e) {
    return { ok: false, error: e?.response?.data?.message || 'No se pudo verificar la clave SOL.' };
  }
};

const handleVerifySol = async () => {
  verifyingSol.value = true;
  solCheck.value = null;
  const r = await verificarSolApi({
    ruc_emisor: form.ruc_emisor,
    sol_user: form.sol_user,
    sol_pass: form.sol_pass || undefined,
    environment: form.environment,
  });
  verifyingSol.value = false;
  if (r.ok) solCheck.value = r.data;
  else showMessage(r.error, 'error');
};

// ─── Probar configuración: servicio + clave SOL ────────────────────────
const prueba = ref(null);

const handleTest = async () => {
  testing.value = true;
  prueba.value = null;
  message.value = '';

  // 1. Servicio de facturación: MiTienda llega y el token sirve. No consulta a SUNAT.
  let servicio;
  try {
    const res = await billingApi.testSunatConnection();
    const data = res?.data ?? res;
    if (res?.success === false || data?.connected === false) {
      servicio = { ok: false, texto: res?.message || 'no responde.' };
    } else {
      const amb = data?.environment === 'produccion' ? 'producción' : 'pruebas';
      servicio = { ok: true, texto: `funciona. ${data?.razon_social || ''} en ${amb}.` };
    }
  } catch (e) {
    servicio = { ok: false, texto: e?.response?.data?.message || 'no responde.' };
  }

  // 2. Clave SOL ante SUNAT, con la guardada, sin emitir.
  const r = await verificarSolApi({ environment: credentials.value?.environment });
  const sol = r.ok
    ? { ok: r.data?.estado === 'ok', texto: textoSol(r.data), clase: claseSol(r.data) }
    : { ok: false, texto: r.error, clase: 'text-red-700' };

  prueba.value = { servicio, sol };
  testing.value = false;
};

const handleDelete = async () => {
  if (!confirm('Se eliminará la configuración de esta tienda. Los comprobantes ya emitidos se conservan.')) return;
  try {
    await billingApi.deleteSunatConfig();
    configured.value = false;
    credentials.value = null;
    paso.value = 1;
    showMessage('Configuración eliminada.');
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo eliminar la configuración.', 'error');
  }
};

onMounted(load);
</script>
