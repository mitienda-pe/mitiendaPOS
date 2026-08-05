<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
    <div>
      <label class="block text-xs font-medium text-gray-700 mb-1">Departamento</label>
      <select
        v-model="codDpto"
        :disabled="loadingDepartamentos"
        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        @change="onDepartamentoChange"
      >
        <option value="">{{ loadingDepartamentos ? 'Cargando...' : 'Selecciona' }}</option>
        <option v-for="d in departamentos" :key="d.codigo" :value="String(d.codigo)">
          {{ d.nombre }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium text-gray-700 mb-1">Provincia</label>
      <select
        v-model="codProv"
        :disabled="!codDpto || loadingProvincias"
        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        @change="onProvinciaChange"
      >
        <option value="">{{ loadingProvincias ? 'Cargando...' : 'Selecciona' }}</option>
        <option v-for="p in provincias" :key="p.codigo" :value="p.codigo">
          {{ p.nombre }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-xs font-medium text-gray-700 mb-1">Distrito</label>
      <select
        v-model="ubigeoId"
        :disabled="!codProv || loadingDistritos"
        class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        @change="onDistritoChange"
      >
        <option value="">{{ loadingDistritos ? 'Cargando...' : 'Selecciona' }}</option>
        <option v-for="d in distritos" :key="d.ubigeo_id" :value="String(d.ubigeo_id)">
          {{ d.nombre }}
        </option>
      </select>
    </div>

    <p v-if="error" class="sm:col-span-3 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="sinCobertura" class="sm:col-span-3 text-xs text-amber-600">
      La tienda no tiene zonas de reparto configuradas.
    </p>
  </div>
</template>

<script setup>
/**
 * Cascada departamento → provincia → distrito, restringida a las zonas donde la
 * tienda reparte. No son listas geográficas completas: si un distrito no aparece,
 * es que la tienda no tiene cobertura ahí y el servidor rechazaría la venta.
 */
import { ref, watch, onMounted } from 'vue';
import { shippingApi } from '../services/shippingApi';

const props = defineProps({
  // { ubigeo_id, department, province, district } para precargar una dirección
  modelValue: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue']);

const departamentos = ref([]);
const provincias = ref([]);
const distritos = ref([]);

const codDpto = ref('');
const codProv = ref('');
const ubigeoId = ref('');

const loadingDepartamentos = ref(false);
const loadingProvincias = ref(false);
const loadingDistritos = ref(false);
const error = ref('');
const sinCobertura = ref(false);

async function loadDepartamentos() {
  loadingDepartamentos.value = true;
  error.value = '';
  try {
    departamentos.value = await shippingApi.getDepartamentos();
    sinCobertura.value = departamentos.value.length === 0;
  } catch (e) {
    error.value = 'No se pudieron cargar los departamentos.';
    console.error('[UbigeoSelector] departamentos:', e);
  } finally {
    loadingDepartamentos.value = false;
  }
}

async function loadProvincias() {
  if (!codDpto.value) {
    provincias.value = [];
    return;
  }
  loadingProvincias.value = true;
  try {
    provincias.value = await shippingApi.getProvincias(codDpto.value);
  } catch (e) {
    error.value = 'No se pudieron cargar las provincias.';
    console.error('[UbigeoSelector] provincias:', e);
  } finally {
    loadingProvincias.value = false;
  }
}

async function loadDistritos() {
  if (!codProv.value) {
    distritos.value = [];
    return;
  }
  loadingDistritos.value = true;
  try {
    distritos.value = await shippingApi.getDistritos(codProv.value);
  } catch (e) {
    error.value = 'No se pudieron cargar los distritos.';
    console.error('[UbigeoSelector] distritos:', e);
  } finally {
    loadingDistritos.value = false;
  }
}

function emitSelection() {
  if (!ubigeoId.value) {
    emit('update:modelValue', null);
    return;
  }

  const dpto = departamentos.value.find((d) => String(d.codigo) === codDpto.value);
  const prov = provincias.value.find((p) => p.codigo === codProv.value);
  const dist = distritos.value.find((d) => String(d.ubigeo_id) === ubigeoId.value);

  emit('update:modelValue', {
    ubigeo_id: Number(ubigeoId.value),
    department: dpto?.nombre || '',
    province: prov?.nombre || '',
    district: dist?.nombre || ''
  });
}

async function onDepartamentoChange() {
  codProv.value = '';
  ubigeoId.value = '';
  distritos.value = [];
  emitSelection();
  await loadProvincias();
}

async function onProvinciaChange() {
  ubigeoId.value = '';
  emitSelection();
  await loadDistritos();
}

function onDistritoChange() {
  emitSelection();
}

/**
 * Precarga desde una dirección guardada. La cascada se arma "hacia atrás" a
 * partir de los nombres, porque la libreta de direcciones guarda los textos y
 * el ubigeo_id, pero no los códigos intermedios.
 */
async function preload(value) {
  if (!value?.ubigeo_id || !value.department) return;

  const dpto = departamentos.value.find((d) => d.nombre === value.department);
  if (!dpto) return;

  codDpto.value = String(dpto.codigo);
  await loadProvincias();

  const prov = provincias.value.find((p) => p.nombre === value.province);
  if (!prov) return;

  codProv.value = prov.codigo;
  await loadDistritos();

  if (distritos.value.some((d) => String(d.ubigeo_id) === String(value.ubigeo_id))) {
    ubigeoId.value = String(value.ubigeo_id);
  }
}

onMounted(async () => {
  await loadDepartamentos();
  if (props.modelValue) {
    await preload(props.modelValue);
  }
});

// Precarga al seleccionar otra dirección guardada con el componente ya montado.
watch(
  () => props.modelValue?.ubigeo_id,
  async (newId) => {
    if (newId && String(newId) !== ubigeoId.value && departamentos.value.length) {
      await preload(props.modelValue);
    }
  }
);
</script>
