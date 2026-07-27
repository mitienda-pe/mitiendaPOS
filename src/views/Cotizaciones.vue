<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { cotizacionesApi } from '../services/cotizacionesApi';
import { useToast } from '../composables/useToast';
import ToastNotification from '../components/ToastNotification.vue';
import { formatCurrency } from '../utils/formatters.js';

const router = useRouter();
const { showToast } = useToast();

const cotizaciones = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, limit: 20, pages: 1, total: 0 });
const pdfBusyId = ref(null);

const ESTADO_LABEL = {
  borrador: 'Borrador',
  convertida: 'Convertida',
  vencida: 'Vencida',
  anulada: 'Anulada'
};
const ESTADO_CLASS = {
  borrador: 'bg-amber-100 text-amber-700',
  convertida: 'bg-emerald-100 text-emerald-700',
  vencida: 'bg-gray-100 text-gray-600',
  anulada: 'bg-red-100 text-red-700'
};

const load = async (page = 1) => {
  loading.value = true;
  try {
    const resp = await cotizacionesApi.list({ page, limit: 20 });
    cotizaciones.value = resp.data || [];
    if (resp.pagination) pagination.value = resp.pagination;
  } catch (e) {
    showToast('error', 'No se pudieron cargar las cotizaciones');
  } finally {
    loading.value = false;
  }
};

// Retomar / convertir: carga la cotización en el POS. Ahí el cajero puede editar
// y cobrar; al cobrar se crea la venta (descuenta stock) y se sella la conversión.
const retomar = (row) => {
  router.push({ path: '/pos', query: { cotizacion: row.id } });
};

const generarPdf = async (row) => {
  pdfBusyId.value = row.id;
  try {
    // Si ya está listo, abrir directamente.
    if (row.pdf_status === 'done' && row.pdf_url) {
      window.open(row.pdf_url, '_blank');
      return;
    }
    await cotizacionesApi.generatePdf(row.id);
    showToast('info', 'Generando PDF…');

    // Polling hasta 30s.
    const start = Date.now();
    let done = null;
    while (Date.now() - start < 30000) {
      await new Promise(r => setTimeout(r, 2000));
      const resp = await cotizacionesApi.get(row.id);
      const q = resp.data;
      if (q.pdf_status === 'done' && q.pdf_url) { done = q; break; }
      if (q.pdf_status === 'failed') throw new Error('La generación del PDF falló');
    }
    if (done) {
      row.pdf_status = 'done';
      row.pdf_url = done.pdf_url;
      window.open(done.pdf_url, '_blank');
    } else {
      showToast('warning', 'El PDF está tardando; intenta de nuevo en unos segundos');
    }
  } catch (e) {
    showToast('error', e.message || 'No se pudo generar el PDF');
  } finally {
    pdfBusyId.value = null;
  }
};

const copiarLink = async (row) => {
  if (!row.token) {
    showToast('error', 'Esta cotización no tiene enlace público');
    return;
  }
  const url = cotizacionesApi.publicUrl(row.token);
  try {
    await navigator.clipboard.writeText(url);
    showToast('success', 'Enlace copiado al portapapeles');
  } catch {
    // Fallback: abrir en nueva pestaña si no hay permiso de portapapeles.
    window.open(url, '_blank');
  }
};

const anular = async (row) => {
  if (!confirm(`¿Anular la cotización ${row.codigo}?`)) return;
  try {
    await cotizacionesApi.remove(row.id);
    showToast('success', 'Cotización anulada');
    await load(pagination.value.page);
  } catch (e) {
    showToast('error', e.message || 'No se pudo anular');
  }
};

onMounted(() => load());
</script>

<template>
  <div class="p-4 sm:p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Cotizaciones</h1>
        <p class="text-sm text-gray-500">Proformas sin descontar stock. Comparte, retoma y convierte en venta.</p>
      </div>
      <button @click="router.push('/pos')"
        class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
        Nueva venta
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-400">Cargando…</div>

    <div v-else-if="!cotizaciones.length" class="text-center py-16">
      <p class="text-gray-500">Aún no tienes cotizaciones.</p>
      <p class="text-sm text-gray-400 mt-1">Arma un carrito en el POS y usa “Guardar cotización”.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="row in cotizaciones" :key="row.id"
        class="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-800">{{ row.codigo }}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-medium" :class="ESTADO_CLASS[row.estado] || 'bg-gray-100 text-gray-600'">
              {{ ESTADO_LABEL[row.estado] || row.estado }}
            </span>
          </div>
          <div class="text-sm text-gray-600 truncate">{{ row.cliente || 'Cliente General' }}</div>
          <div class="text-xs text-gray-400">
            Total: <strong class="text-gray-700">{{ formatCurrency(row.totales?.total || 0) }}</strong>
            <span v-if="row.valida_hasta"> · Válida hasta {{ row.valida_hasta }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 shrink-0">
          <button v-if="row.estado === 'borrador'" @click="retomar(row)"
            class="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
            Retomar / Convertir
          </button>
          <button @click="generarPdf(row)" :disabled="pdfBusyId === row.id"
            class="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {{ pdfBusyId === row.id ? 'Generando…' : 'PDF' }}
          </button>
          <button @click="copiarLink(row)"
            class="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            Copiar link
          </button>
          <button v-if="row.estado !== 'convertida'" @click="anular(row)"
            class="text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
            Anular
          </button>
        </div>
      </div>

      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 pt-3">
        <button :disabled="pagination.page <= 1" @click="load(pagination.page - 1)"
          class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40">Anterior</button>
        <span class="px-3 py-1.5 text-sm text-gray-500">{{ pagination.page }} / {{ pagination.pages }}</span>
        <button :disabled="pagination.page >= pagination.pages" @click="load(pagination.page + 1)"
          class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40">Siguiente</button>
      </div>
    </div>

    <ToastNotification />
  </div>
</template>
