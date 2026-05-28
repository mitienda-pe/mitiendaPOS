<template>
  <div class="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
    <div class="py-4 sm:py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Sincronización NetSuite</h1>
        <p class="mt-1 text-sm text-gray-500">
          Acciones manuales reservadas a administradores. Los syncs automáticos siguen corriendo en cron.
        </p>
      </div>

      <!-- Resumen de la última acción -->
      <div
        v-if="lastResult"
        :class="[
          'rounded-md p-4 mb-6',
          lastResult.severity === 'success' && 'bg-green-50 text-green-800',
          lastResult.severity === 'warn' && 'bg-yellow-50 text-yellow-800',
          lastResult.severity === 'error' && 'bg-red-50 text-red-800',
        ]"
      >
        <p class="text-sm font-medium">{{ lastResult.title }}</p>
        <p class="text-sm mt-1">{{ lastResult.message }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Stock -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center mb-3">
              <div class="bg-blue-100 rounded-lg p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Stock</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">
              Actualiza el stock de TODOS los productos desde NetSuite. Tarda 30-90 segundos.
            </p>
            <button
              type="button"
              :disabled="busy"
              :class="[
                'w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors',
                busy ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
              ]"
              @click="onSyncStock"
            >
              {{ syncing === 'stock' ? 'Sincronizando…' : 'Sincronizar stock' }}
            </button>
          </div>
        </div>

        <!-- Precios -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center mb-3">
              <div class="bg-green-100 rounded-lg p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-12V6m0 12v-2m9-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Precios</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">
              Actualiza los precios de los productos desde NetSuite. Tarda 60-120 segundos.
            </p>
            <button
              type="button"
              :disabled="busy"
              :class="[
                'w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors',
                busy ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700',
              ]"
              @click="onSyncPrices"
            >
              {{ syncing === 'prices' ? 'Sincronizando…' : 'Sincronizar precios' }}
            </button>
          </div>
        </div>

        <!-- Productos nuevos -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center mb-3">
              <div class="bg-primary-100 rounded-lg p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Productos nuevos</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">
              Detecta items vendibles que existen en NetSuite y no están en la tienda. Pide confirmación antes de crear.
            </p>
            <button
              type="button"
              :disabled="busy"
              :class="[
                'w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors',
                busy ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700',
              ]"
              @click="onPreviewProducts"
            >
              {{ syncing === 'products-preview' ? 'Consultando…' : 'Importar productos' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de productos -->
      <div
        v-if="showImportPreview"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="!importExecuting && (showImportPreview = false)"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Productos nuevos detectados</h3>
            <button
              v-if="!importExecuting"
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="showImportPreview = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-auto px-6 py-4">
            <div v-if="importPreviewError" class="rounded-md bg-red-50 p-4 text-sm text-red-800 mb-4">
              {{ importPreviewError }}
            </div>

            <div v-else-if="importPreviewData">
              <div class="flex flex-wrap gap-2 text-xs mb-4">
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Items NetSuite: {{ importPreviewData.data.total_from_netsuite }}
                </span>
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Candidatos: {{ importPreviewData.data.total_candidates }}
                </span>
                <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  Ya en MiTienda: {{ importPreviewData.data.skipped.length }}
                </span>
              </div>

              <div v-if="previewCandidates.length === 0" class="text-center py-6 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                No hay productos nuevos en NetSuite para importar.
              </div>

              <div v-else class="overflow-x-auto -mx-2">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-xs uppercase text-gray-600">
                    <tr>
                      <th class="px-3 py-2 text-left">Item.ID</th>
                      <th class="px-3 py-2 text-left">SKU NS</th>
                      <th class="px-3 py-2 text-left">Título</th>
                      <th class="px-3 py-2 text-right">Precio</th>
                      <th class="px-3 py-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="item in previewCandidates" :key="item.netsuite_item_id">
                      <td class="px-3 py-2 font-mono text-xs">{{ item.netsuite_item_id }}</td>
                      <td class="px-3 py-2 font-mono text-xs">{{ item.source?.ns_sku || '—' }}</td>
                      <td class="px-3 py-2">{{ item.preview?.producto_titulo || '—' }}</td>
                      <td class="px-3 py-2 text-right font-semibold">S/ {{ Number(item.preview?.producto_precio || 0).toFixed(2) }}</td>
                      <td class="px-3 py-2 text-right">{{ item.preview?.producto_stock || 0 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              :disabled="importExecuting"
              @click="showImportPreview = false"
            >
              Cancelar
            </button>
            <button
              v-if="previewCandidates.length > 0"
              type="button"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
                importExecuting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700',
              ]"
              :disabled="importExecuting"
              @click="onConfirmImport"
            >
              {{ importExecuting ? 'Importando…' : `Importar ${previewCandidates.length} producto${previewCandidates.length === 1 ? '' : 's'}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { netsuiteStockApi } from '../services/netsuiteStockApi';

const router = useRouter();
const authStore = useAuthStore();

// Reservado solo a administradores (token sin empleado_id).
// Si un cajero llega acá, lo devolvemos a la home.
onMounted(() => {
  if (!authStore.isAdminToken) {
    router.replace('/menu');
  }
});

const syncing = ref(null); // 'stock' | 'prices' | 'products-preview' | 'products-execute' | null
const busy = computed(() => syncing.value !== null);

const lastResult = ref(null);

const showImportPreview = ref(false);
const importPreviewData = ref(null);
const importPreviewError = ref(null);
const importExecuting = ref(false);

const previewCandidates = computed(() =>
  (importPreviewData.value?.data?.items || []).filter(i => i.status === 'dry_run')
);

async function onSyncStock() {
  syncing.value = 'stock';
  lastResult.value = null;
  try {
    const res = await netsuiteStockApi.syncTiendaStock(false);
    const stats = res?.data?.stats || res?.data || {};
    const updated = stats.updated_count ?? stats.updated ?? 0;
    const errors = stats.errors_count ?? (Array.isArray(stats.errors) ? stats.errors.length : 0);
    lastResult.value = {
      severity: errors > 0 ? 'warn' : 'success',
      title: 'Stock sincronizado',
      message: `${updated} producto(s) actualizado(s)${errors > 0 ? `, ${errors} error(es)` : ''}.`,
    };
  } catch (err) {
    lastResult.value = {
      severity: 'error',
      title: 'Error sincronizando stock',
      message: err?.message || 'Error inesperado',
    };
  } finally {
    syncing.value = null;
  }
}

async function onSyncPrices() {
  syncing.value = 'prices';
  lastResult.value = null;
  try {
    const res = await netsuiteStockApi.syncTiendaPrices(false);
    const stats = res?.data || {};
    const updated = stats.updated_count ?? 0;
    const errors = Array.isArray(stats.errors) ? stats.errors.length : 0;
    lastResult.value = {
      severity: errors > 0 ? 'warn' : 'success',
      title: 'Precios sincronizados',
      message: `${updated} producto(s) actualizado(s)${errors > 0 ? `, ${errors} error(es)` : ''}.`,
    };
  } catch (err) {
    lastResult.value = {
      severity: 'error',
      title: 'Error sincronizando precios',
      message: err?.message || 'Error inesperado',
    };
  } finally {
    syncing.value = null;
  }
}

async function onPreviewProducts() {
  syncing.value = 'products-preview';
  lastResult.value = null;
  importPreviewData.value = null;
  importPreviewError.value = null;
  showImportPreview.value = true;
  try {
    const res = await netsuiteStockApi.syncTiendaProducts(true);
    importPreviewData.value = res;
  } catch (err) {
    importPreviewError.value = err?.message || 'Error consultando productos nuevos';
  } finally {
    syncing.value = null;
  }
}

async function onConfirmImport() {
  importExecuting.value = true;
  syncing.value = 'products-execute';
  try {
    const res = await netsuiteStockApi.syncTiendaProducts(false);
    const data = res?.data || {};
    const created = data.created ?? 0;
    const errors = data.errors ?? 0;
    const skipped = (data.skipped_duplicate ?? 0) + (data.skipped_missing_data ?? 0);
    lastResult.value = {
      severity: errors > 0 ? 'warn' : 'success',
      title: 'Productos importados',
      message: `${created} producto(s) creado(s)${skipped > 0 ? `, ${skipped} omitido(s)` : ''}${errors > 0 ? `, ${errors} error(es)` : ''}.`,
    };
    showImportPreview.value = false;
    importPreviewData.value = null;
  } catch (err) {
    lastResult.value = {
      severity: 'error',
      title: 'Error importando productos',
      message: err?.message || 'Error inesperado',
    };
  } finally {
    importExecuting.value = false;
    syncing.value = null;
  }
}
</script>
