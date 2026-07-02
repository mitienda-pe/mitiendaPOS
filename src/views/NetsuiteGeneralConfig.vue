<template>
  <div class="p-6 max-w-5xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Configuración general NetSuite</h1>
      <p class="mt-2 text-gray-600">
        IDs internos de NetSuite que aplican a toda la tienda. Cada campo es obligatorio
        para que las facturas, pagos y asientos se generen correctamente. Sin valor el
        sync se interrumpe — no hay defaults ni fallbacks.
      </p>
    </div>

    <!-- Validation summary -->
    <div v-if="validation" class="mb-6 space-y-3">
      <!-- Critical -->
      <div
        v-if="criticalIssues.length"
        class="rounded-md bg-red-50 border border-red-200 p-4"
      >
        <p class="text-sm font-medium text-red-800">
          {{ criticalIssues.length }} configuración(es) crítica(s) faltante(s). El
          sync NetSuite está bloqueado para datos en uso.
        </p>
        <ul class="mt-3 space-y-1 text-sm text-red-700 list-disc list-inside">
          <li v-for="(issue, idx) in criticalIssues" :key="idx">{{ issue.message }}</li>
        </ul>
      </div>

      <!-- Warnings -->
      <div
        v-if="warningIssues.length"
        class="rounded-md bg-yellow-50 border border-yellow-200 p-4"
      >
        <p class="text-sm font-medium text-yellow-800">
          {{ warningIssues.length }} aviso(s) — config aspiracional sin impacto en
          ventas activas.
        </p>
        <details class="mt-2 text-sm text-yellow-700">
          <summary class="cursor-pointer underline">Ver detalle</summary>
          <ul class="mt-2 space-y-1 list-disc list-inside">
            <li v-for="(issue, idx) in warningIssues" :key="idx">{{ issue.message }}</li>
          </ul>
        </details>
      </div>

      <!-- Operative / complete -->
      <div
        v-if="!criticalIssues.length && !warningIssues.length"
        class="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800"
      >
        ✅ Configuración completa. La tienda puede sincronizar a NetSuite sin
        observaciones.
      </div>
      <div
        v-else-if="!criticalIssues.length"
        class="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800"
      >
        ✅ Tienda operativa. Los avisos de arriba son opcionales.
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
      Cargando configuración…
    </div>

    <form v-else @submit.prevent="save" class="space-y-8">
      <!-- Group: Identity -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Identidad y entorno</h2>
        <p class="text-sm text-gray-500 mb-4">
          Subsidiary, location default y entidades obligatorias del invoice.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NetsuiteIdField v-model="form.subsidiary_id" label="Subsidiary ID" :missing="missing('tiendacredencialerp_subsidiary_id')" />
          <NetsuiteIdField v-model="form.location_id" label="Default Location ID" :missing="missing('tiendacredencialerp_location_id')" />
          <NetsuiteIdField v-model="form.ubicacion_serie_id" label="Ubicación para serie PE" :missing="missing('tiendacredencialerp_ubicacion_serie_id')" />
          <NetsuiteIdField v-model="form.department_id" label="Department ID" :missing="missing('tiendacredencialerp_department_id')" />
          <NetsuiteIdField v-model="form.class_id" label="Class ID" :missing="missing('tiendacredencialerp_class_id')" />
          <NetsuiteIdField v-model="form.currency_id" label="Currency ID (PEN/USD)" :missing="missing('tiendacredencialerp_currency_id')" />
        </div>
      </section>

      <!-- Group: Pricing -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Precios e impuestos</h2>
        <p class="text-sm text-gray-500 mb-4">
          Price Level, terms, tax code y eDoc standard que se aplica al invoice.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NetsuiteIdField v-model="form.price_level_id" label="Price Level ID" :missing="missing('tiendacredencialerp_price_level_id')" />
          <NetsuiteIdField v-model="form.terms_id" label="Terms ID (CONTADO etc.)" :missing="missing('tiendacredencialerp_terms_id')" />
          <NetsuiteIdField v-model="form.tax_item_id" label="Tax Code ID" :missing="missing('tiendacredencialerp_tax_item_id')" />
          <NetsuiteIdField v-model="form.edoc_standard_id" label="PE eDoc Standard ID" :missing="missing('tiendacredencialerp_edoc_standard_id')" />
          <NetsuiteIdField v-model="form.receivables_account_id" label="Receivables Account ID" :missing="missing('tiendacredencialerp_receivables_account_id')" />
        </div>
      </section>

      <!-- Group: Customer defaults -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Clientes (defaults)</h2>
        <p class="text-sm text-gray-500 mb-4">
          Datos que se aplican al crear un customer nuevo en NetSuite.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NetsuiteIdField v-model="form.generic_customer_id" label="Generic Customer ID" :missing="missing('tiendacredencialerp_generic_customer_id')" />
          <NetsuiteIdField v-model="form.customer_category_id" label="Customer Category ID" :missing="missing('tiendacredencialerp_customer_category_id')" />
          <NetsuiteIdField v-model="form.entity_status_id" label="Entity Status ID" :missing="missing('tiendacredencialerp_entity_status_id')" />
          <NetsuiteIdField v-model="form.payment_method_id" label="Payment Method ID" :missing="missing('tiendacredencialerp_payment_method_id')" />
          <NetsuiteIdField v-model="form.country_id" label="Country ID" :missing="missing('tiendacredencialerp_country_id')" />
          <NetsuiteIdField v-model="form.default_zip_id" label="Default Zip / Ubigeo ID" :missing="missing('tiendacredencialerp_default_zip_id')" />
        </div>
      </section>

      <!-- Group: Items -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Items especiales</h2>
        <p class="text-sm text-gray-500 mb-4">
          Items de NetSuite que el sistema agrega automáticamente al invoice para
          bonificaciones y descuentos.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NetsuiteIdField v-model="form.bonification_item_id" label="Bonification Item ID" :missing="missing('tiendacredencialerp_bonification_item_id')" />
          <NetsuiteIdField v-model="form.discount_item_id" label="Discount Item ID" :missing="missing('tiendacredencialerp_discount_item_id')" />
        </div>
      </section>

      <!-- Group: Sales rep default -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Empleado por defecto (opcional)</h2>
        <p class="text-sm text-gray-500 mb-4">
          Si una venta llega con un cajero que no tiene
          <code>empleado_netsuite_id</code> mapeado, se usa este ID como salesrep.
          Vacío = el invoice se manda sin salesrep y NetSuite usa el del customer.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NetsuiteIdField
            v-model="form.default_salesrep_id"
            label="Default Sales Rep ID"
            :missing="false"
            :optional="true"
          />
        </div>
      </section>

      <!-- Group: Sync mode -->
      <section class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Modo de sincronización</h2>
        <p class="text-sm text-gray-500 mb-4">
          Cómo se sincroniza cada venta con NetSuite.
          <strong>Factura directa</strong>: crea Invoice + pago (POS de mostrador).
          <strong>Sales Order</strong>: crea solo la Orden de Venta; NetSuite genera el
          despacho, la guía de remisión y la factura (ventas web con despacho).
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modo de sincronización</label>
            <select
              v-model="form.sync_mode"
              class="block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="invoice_direct">Factura directa (POS)</option>
              <option value="sales_order">Sales Order (web / guía de remisión)</option>
            </select>
          </div>
          <div v-if="form.sync_mode === 'sales_order'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Custom Form ID del Sales Order
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              v-model="form.so_custom_form_id"
              type="text"
              inputmode="numeric"
              placeholder="ej: 225"
              class="block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            <p class="mt-1 text-xs text-gray-500">
              Custom Form de NetSuite para la Orden de Venta (ej: 225 = "PE Orden de Venta").
              Vacío = form por defecto de la cuenta.
            </p>
          </div>
        </div>
      </section>

      <div class="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          @click="reset"
        >
          Restaurar
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:bg-gray-400"
        >
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>
    </form>

    <div
      v-if="successMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { netsuiteConfigApi } from '../services/netsuiteConfigApi';
import NetsuiteIdField from '../components/NetsuiteIdField.vue';

const authStore = useAuthStore();
const tiendaId = computed(() => authStore.selectedStore?.id || null);

const loading = ref(true);
const saving = ref(false);
const validation = ref(null);
const successMessage = ref('');
const errorMessage = ref('');
let successTimer = null;
let errorTimer = null;

const emptyForm = () => ({
  subsidiary_id: '',
  location_id: '',
  ubicacion_serie_id: '',
  generic_customer_id: '',
  bonification_item_id: '',
  price_level_id: '',
  customer_category_id: '',
  department_id: '',
  class_id: '',
  currency_id: '',
  country_id: '',
  terms_id: '',
  tax_item_id: '',
  edoc_standard_id: '',
  receivables_account_id: '',
  entity_status_id: '',
  payment_method_id: '',
  default_zip_id: '',
  discount_item_id: '',
  default_salesrep_id: '',
  sync_mode: 'invoice_direct',
  so_custom_form_id: '',
});

const form = reactive(emptyForm());
let originalForm = emptyForm();

const fieldToColumn = {
  subsidiary_id: 'tiendacredencialerp_subsidiary_id',
  location_id: 'tiendacredencialerp_location_id',
  ubicacion_serie_id: 'tiendacredencialerp_ubicacion_serie_id',
  generic_customer_id: 'tiendacredencialerp_generic_customer_id',
  bonification_item_id: 'tiendacredencialerp_bonification_item_id',
  price_level_id: 'tiendacredencialerp_price_level_id',
  customer_category_id: 'tiendacredencialerp_customer_category_id',
  department_id: 'tiendacredencialerp_department_id',
  class_id: 'tiendacredencialerp_class_id',
  currency_id: 'tiendacredencialerp_currency_id',
  country_id: 'tiendacredencialerp_country_id',
  terms_id: 'tiendacredencialerp_terms_id',
  tax_item_id: 'tiendacredencialerp_tax_item_id',
  edoc_standard_id: 'tiendacredencialerp_edoc_standard_id',
  receivables_account_id: 'tiendacredencialerp_receivables_account_id',
  entity_status_id: 'tiendacredencialerp_entity_status_id',
  payment_method_id: 'tiendacredencialerp_payment_method_id',
  default_zip_id: 'tiendacredencialerp_default_zip_id',
  discount_item_id: 'tiendacredencialerp_discount_item_id',
  default_salesrep_id: 'tiendacredencialerp_default_salesrep_id',
  sync_mode: 'tiendacredencialerp_sync_mode',
  so_custom_form_id: 'tiendacredencialerp_so_custom_form_id',
};

// Only credential-level critical issues map to the individual field
// red borders; warnings (aspirational) don't paint inputs.
const missingFields = computed(() => {
  if (!validation.value) return new Set();
  const set = new Set();
  for (const issue of validation.value.issues || []) {
    if (issue.severity === 'warning') continue;
    if (issue.field) set.add(issue.field);
  }
  return set;
});

function missing(column) {
  return missingFields.value.has(column);
}

const criticalIssues = computed(() =>
  (validation.value?.issues || []).filter(i => i.severity !== 'warning')
);
const warningIssues = computed(() =>
  (validation.value?.issues || []).filter(i => i.severity === 'warning')
);

async function loadAll() {
  if (!tiendaId.value) return;
  loading.value = true;
  try {
    const [credResp, validateResp] = await Promise.all([
      netsuiteConfigApi.getCredentials(tiendaId.value).catch(() => null),
      netsuiteConfigApi.validate(tiendaId.value).catch(() => null),
    ]);

    const cred = credResp?.data || {};
    Object.keys(form).forEach((key) => {
      const column = fieldToColumn[key];
      const value = cred[column];
      form[key] = value === null || value === undefined ? '' : String(value);
    });
    // El modo de sync nunca es vacío: si la tienda no lo tiene aún, mostrar el
    // default POS (factura directa). Se normaliza antes de fijar originalForm
    // para que no aparezca como cambio pendiente.
    if (!form.sync_mode) form.sync_mode = 'invoice_direct';
    originalForm = { ...form };

    validation.value = validateResp?.data || null;
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!tiendaId.value) return;
  saving.value = true;
  try {
    // Send only the fields the operator changed.
    const payload = {};
    Object.keys(form).forEach((key) => {
      if (form[key] !== originalForm[key]) {
        payload[key] = form[key] === '' ? null : form[key];
      }
    });

    if (Object.keys(payload).length === 0) {
      flashSuccess('No hay cambios que guardar.');
      return;
    }

    await netsuiteConfigApi.saveCredentials(tiendaId.value, payload);
    flashSuccess('Configuración guardada.');
    await loadAll();
  } catch (err) {
    flashError(err?.response?.data?.message || err.message || 'Error al guardar');
  } finally {
    saving.value = false;
  }
}

function reset() {
  Object.keys(form).forEach((key) => { form[key] = originalForm[key]; });
}

function flashSuccess(text) {
  successMessage.value = text;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => { successMessage.value = ''; }, 3000);
}

function flashError(text) {
  errorMessage.value = text;
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => { errorMessage.value = ''; }, 5000);
}

onMounted(loadAll);
</script>
