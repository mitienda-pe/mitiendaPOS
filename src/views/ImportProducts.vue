<template>
  <div class="max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Importar productos (CSV)</h1>
        <p class="text-sm text-gray-500 mt-1">Da de alta o actualiza tu catálogo en lote. Se emparejan por SKU.</p>
      </div>
      <router-link to="/inventory" class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200">
        ← Inventario
      </router-link>
    </div>

    <div v-if="message" :class="['rounded-md px-4 py-3 text-sm mb-4', messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700']">
      {{ message }}
    </div>

    <!-- Paso 1: cargar -->
    <section v-if="step === 'upload'" class="space-y-5">
      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">1. Prepara tu archivo</h2>
        <p class="text-sm text-gray-600 mb-3">
          Columnas: <strong>nombre</strong> y <strong>precio</strong> (con IGV) son obligatorias.
          Opcionales: sku, stock, codigo_barras, afectacion_igv, afectacion_isc, categoria, marca, stock_ilimitado.
        </p>
        <ul class="text-xs text-gray-500 list-disc pl-5 space-y-1 mb-4">
          <li><strong>precio</strong>: precio final con IGV (se calcula el valor sin IGV automáticamente).</li>
          <li><strong>afectacion_igv</strong>: <code>gravado</code> (default), <code>exonerado</code> o <code>inafecto</code>.</li>
          <li><strong>afectacion_isc</strong>: opcional; se guarda pero aún no afecta los comprobantes.</li>
          <li>Si el <strong>sku</strong> ya existe, se actualiza precio y stock; si no, se crea.</li>
        </ul>
        <button class="btn-secondary" @click="downloadTemplate">Descargar plantilla CSV</button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">2. Sucursal y archivo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="form-label">Sucursal del stock</label>
            <select v-model="branchId" class="input-field">
              <option :value="null">Solo stock general</option>
              <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">El stock del CSV se asigna a esta sucursal.</p>
          </div>
          <div>
            <label class="form-label">Archivo CSV</label>
            <input type="file" accept=".csv,text/csv" class="block w-full text-sm text-gray-700" @change="onFileChange" />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button class="btn-primary" :disabled="!file || loading" @click="runPreview">
            {{ loading ? 'Analizando...' : 'Previsualizar' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Paso 2: preview -->
    <section v-else-if="step === 'preview'" class="space-y-4">
      <div class="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 text-sm">
        <span class="text-gray-600">Total: <strong>{{ resumen.total }}</strong></span>
        <span class="text-green-700">A crear: <strong>{{ resumen.crear }}</strong></span>
        <span class="text-blue-700">A actualizar: <strong>{{ resumen.actualizar }}</strong></span>
        <span class="text-red-700">Con error: <strong>{{ resumen.errores }}</strong></span>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Línea</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Afectación IGV</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Acción</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Detalle</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="r in filas" :key="r.linea">
              <td class="px-3 py-2 text-gray-500">{{ r.linea }}</td>
              <td class="px-3 py-2 text-gray-700">{{ r.sku || '—' }}</td>
              <td class="px-3 py-2 text-gray-800">{{ r.nombre }}</td>
              <td class="px-3 py-2">
                <span v-if="r.afectacion_label" :class="afectacionClass(r.afectacion)">{{ r.afectacion_label }}</span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-3 py-2"><span :class="accionClass(r.accion)">{{ accionLabel(r.accion) }}</span></td>
              <td class="px-3 py-2 text-gray-500">{{ r.mensaje }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between">
        <button class="btn-secondary" :disabled="loading" @click="reset">Cancelar</button>
        <button class="btn-primary" :disabled="loading || (resumen.crear + resumen.actualizar) === 0" @click="runConfirm">
          {{ loading ? 'Importando...' : `Confirmar (${resumen.crear + resumen.actualizar})` }}
        </button>
      </div>
    </section>

    <!-- Paso 3: resultados -->
    <section v-else-if="step === 'done'" class="space-y-4">
      <div class="bg-white rounded-lg shadow-sm p-5 text-center">
        <div class="flex justify-center mb-3">
          <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
        <p class="text-gray-800 font-medium">Importación completada</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ resumen.creados }} creados · {{ resumen.actualizados }} actualizados · {{ resumen.errores }} con error
        </p>
      </div>

      <div v-if="errorRows.length" class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <p class="px-4 py-2 text-sm font-medium text-gray-700 border-b">Filas con error</p>
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="r in errorRows" :key="r.linea">
              <td class="px-3 py-2 text-gray-500">Línea {{ r.linea }}</td>
              <td class="px-3 py-2 text-gray-700">{{ r.sku || r.nombre }}</td>
              <td class="px-3 py-2 text-red-600">{{ r.mensaje }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end gap-3">
        <button class="btn-secondary" @click="reset">Importar otro archivo</button>
        <router-link to="/inventory" class="btn-primary">Ir a Inventario</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { inventoryApi } from '../services/inventoryApi';
import { branchesApi } from '../services/branchesApi';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const step = ref('upload');
const loading = ref(false);
const message = ref('');
const messageType = ref('error');
const file = ref(null);
const branchId = ref(null);
const branches = ref([]);
const filas = ref([]);
const resumen = reactive({ total: 0, crear: 0, actualizar: 0, errores: 0, creados: 0, actualizados: 0 });

const showMessage = (text, type = 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => { message.value = ''; }, 5000);
};

const accionLabel = (a) => ({ crear: 'Crear', actualizar: 'Actualizar', creado: 'Creado', actualizado: 'Actualizado', error: 'Error' }[a] || a);
const accionClass = (a) => {
  if (a === 'error') return 'text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs';
  if (a === 'actualizar' || a === 'actualizado') return 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs';
  return 'text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs';
};

// afectacion: 1=Gravado, 2=Exonerado, 3=Inafecto
const afectacionClass = (a) => {
  if (a === 2) return 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs';
  if (a === 3) return 'text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs';
  return 'text-gray-600 bg-gray-50 px-2 py-0.5 rounded text-xs';
};

const errorRows = ref([]);

const onFileChange = (e) => { file.value = e.target.files?.[0] || null; };

const loadBranches = async () => {
  try {
    const tiendaId = authStore.selectedStore?.id;
    if (!tiendaId) return;
    const res = await branchesApi.getAll(tiendaId);
    const list = res?.data ?? res ?? [];
    branches.value = (Array.isArray(list) ? list : []).map((b) => ({
      id: b.tiendadireccion_id ?? b.id,
      name: b.tiendadireccion_nombresucursal ?? b.nombre ?? `Sucursal ${b.tiendadireccion_id ?? b.id}`,
    }));
    if (branches.value.length === 1) branchId.value = branches.value[0].id;
  } catch (e) {
    // sin sucursales: se importa solo stock general
  }
};

const downloadTemplate = () => {
  const headers = ['sku', 'nombre', 'precio', 'stock', 'codigo_barras', 'afectacion_igv', 'afectacion_isc', 'categoria', 'marca', 'stock_ilimitado'];
  const examples = [
    ['ABC-001', 'Polo de algodón talla M', '39.90', '50', '7501234567890', 'gravado', '', 'Ropa', 'Marca X', 'no'],
    ['SERV-01', 'Servicio de delivery', '10.00', '', '', 'gravado', '', 'Servicios', '', 'si'],
  ];
  const csv = [headers, ...examples].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_productos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const runPreview = async () => {
  if (!file.value) return;
  loading.value = true;
  message.value = '';
  try {
    const data = await inventoryApi.importCatalog(file.value, { tiendadireccionId: branchId.value, confirm: false });
    filas.value = data?.filas ?? [];
    Object.assign(resumen, { total: 0, crear: 0, actualizar: 0, errores: 0 }, data?.resumen ?? {});
    step.value = 'preview';
  } catch (e) {
    showMessage(e?.response?.data?.messages?.error || e?.response?.data?.message || 'No se pudo leer el archivo. Revisa el formato.');
  } finally {
    loading.value = false;
  }
};

const runConfirm = async () => {
  loading.value = true;
  message.value = '';
  try {
    const data = await inventoryApi.importCatalog(file.value, { tiendadireccionId: branchId.value, confirm: true });
    Object.assign(resumen, { creados: 0, actualizados: 0, errores: 0 }, data?.resumen ?? {});
    errorRows.value = (data?.filas ?? []).filter((r) => r.accion === 'error');
    step.value = 'done';
  } catch (e) {
    showMessage(e?.response?.data?.message || 'No se pudo completar la importación.');
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  step.value = 'upload';
  file.value = null;
  filas.value = [];
  errorRows.value = [];
};

onMounted(loadBranches);
</script>
