<template>
  <div v-if="modelValue" class="fixed z-20 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Envío a domicilio</h3>
            <button @click="close" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Direcciones guardadas del cliente -->
          <div v-if="savedAddresses.length" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Direcciones guardadas</label>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <button
                v-for="addr in savedAddresses"
                :key="addr.id"
                type="button"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg border-2 transition-all',
                  selectedAddressId === addr.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
                @click="selectSavedAddress(addr)"
              >
                <div class="font-medium text-sm text-gray-900">{{ addr.address }}</div>
                <div class="text-xs text-gray-500">
                  {{ [addr.district, addr.province, addr.department].filter(Boolean).join(' / ') }}
                </div>
              </button>
            </div>
          </div>

          <!-- Destino -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Distrito de entrega *</label>
            <UbigeoSelector v-model="ubigeo" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1">Dirección *</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Av. Larco 123"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Interior / Dpto.</label>
              <input
                v-model="form.interior"
                type="text"
                placeholder="401"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="sm:col-span-3">
              <label class="block text-xs font-medium text-gray-700 mb-1">Referencia</label>
              <input
                v-model="form.reference"
                type="text"
                placeholder="Frente al parque"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <!-- Quién recibe -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">Quién recibe</label>
              <label class="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" v-model="sameAsCustomer" @change="applySameAsCustomer" />
                Igual que el cliente
              </label>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                v-model="form.receiver_first_name"
                type="text"
                placeholder="Nombres"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                v-model="form.receiver_last_name"
                type="text"
                placeholder="Apellidos"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                v-model="form.receiver_phone"
                type="tel"
                placeholder="Teléfono *"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              El teléfono es obligatorio: el repartidor lo necesita para coordinar la entrega.
            </p>
          </div>

          <!-- Tipo de servicio -->
          <div v-if="serviceOptions.length" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de envío</label>
            <div class="space-y-2">
              <button
                v-for="opt in serviceOptions"
                :key="opt.service_type_code"
                type="button"
                :disabled="opt.disponible === false"
                :class="[
                  'w-full flex justify-between items-center px-3 py-2 rounded-lg border-2 transition-all',
                  selectedServiceCode === opt.service_type_code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300',
                  opt.disponible === false ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                @click="selectService(opt)"
              >
                <span class="text-sm font-medium text-gray-900">
                  {{ opt.service_type_nombre }}
                  <span v-if="opt.mensaje_corte" class="block text-xs font-normal text-amber-600">
                    {{ opt.mensaje_corte }}
                  </span>
                </span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ opt.envio_gratis ? 'GRATIS' : formatCurrency(opt.precio) }}
                </span>
              </button>
            </div>
          </div>

          <!-- Fecha de reparto -->
          <div v-if="fechasDisponibles.length" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de reparto</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                v-model="form.fecha_reparto"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                @change="form.hora_reparto = ''"
              >
                <option value="">Sin fecha programada</option>
                <option v-for="f in fechasDisponibles" :key="f.fecha" :value="f.fecha">
                  {{ f.dia_nombre }} {{ f.fecha }}
                </option>
              </select>
              <select
                v-model="form.hora_reparto"
                :disabled="!form.fecha_reparto"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="">Sin horario</option>
                <option v-for="h in horariosDeFechaSeleccionada" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>
          </div>

          <!-- Cotización -->
          <div class="mb-4 p-3 rounded-lg" :class="quoteError ? 'bg-red-50' : 'bg-gray-50'">
            <div v-if="quoting" class="text-sm text-gray-600">Cotizando envío...</div>
            <div v-else-if="quoteError" class="text-sm text-red-700">{{ quoteError }}</div>
            <div v-else-if="quote" class="flex justify-between items-center">
              <span class="text-sm text-gray-700">Costo de envío</span>
              <span class="text-lg font-semibold text-gray-900">
                <template v-if="quote.free">
                  <span class="text-green-600">GRATIS</span>
                </template>
                <template v-else>{{ formatCurrency(quote.cost) }}</template>
              </span>
            </div>
            <div v-else class="text-sm text-gray-500">
              Selecciona el distrito para cotizar el envío.
            </div>
          </div>

          <div v-if="validationError" class="mb-3 text-sm text-red-600">{{ validationError }}</div>

          <p class="text-xs text-gray-500 mb-4">
            La tarifa la confirma el servidor al registrar la venta; si cambió el tarifario,
            el monto del ticket puede diferir del cotizado aquí.
          </p>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-2">
          <button
            type="button"
            :disabled="!canConfirm"
            class="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            @click="confirm"
          >
            Confirmar envío
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
            @click="close"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Captura del destino de un pedido a domicilio tomado en el mostrador.
 *
 * A diferencia de la tienda virtual, acá los datos los escribe el vendedor con el
 * cliente delante. Por eso se ofrecen primero las direcciones ya guardadas del
 * cliente: lo normal es que un cliente recurrente pida el envío a la misma
 * dirección, y volver a tipearla es la parte lenta de la venta.
 */
import { ref, computed, watch } from 'vue';
import { shippingApi } from '../services/shippingApi';
import { formatCurrency } from '../utils/formatters';
import UbigeoSelector from './UbigeoSelector.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  customer: { type: Object, default: null },
  // Total de productos sin envío: define si aplica el envío gratis por umbral.
  itemsTotal: { type: Number, default: 0 },
  // Dirección ya confirmada, para reabrir el modal en modo edición.
  initialAddress: { type: Object, default: null },
  initialQuote: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const emptyForm = () => ({
  customer_address_id: null,
  address: '',
  interior: '',
  reference: '',
  receiver_first_name: '',
  receiver_last_name: '',
  receiver_phone: '',
  fecha_reparto: '',
  hora_reparto: ''
});

const form = ref(emptyForm());
const ubigeo = ref(null);
const savedAddresses = ref([]);
const selectedAddressId = ref(null);
const sameAsCustomer = ref(false);

const serviceOptions = ref([]);
const selectedServiceCode = ref(null);
const fechasDisponibles = ref([]);

const quote = ref(null);
const quoting = ref(false);
const quoteError = ref('');
const validationError = ref('');

const horariosDeFechaSeleccionada = computed(() => {
  const f = fechasDisponibles.value.find((x) => x.fecha === form.value.fecha_reparto);
  return f?.horarios || [];
});

const canConfirm = computed(
  () =>
    !!ubigeo.value?.ubigeo_id &&
    form.value.address.trim() !== '' &&
    form.value.receiver_phone.trim() !== '' &&
    !!quote.value &&
    !quoting.value
);

function close() {
  emit('update:modelValue', false);
}

function selectSavedAddress(addr) {
  selectedAddressId.value = addr.id;
  form.value.customer_address_id = addr.id;
  form.value.address = addr.address || '';
  form.value.interior = addr.interior || '';
  form.value.reference = addr.reference || '';
  if (addr.phone) form.value.receiver_phone = addr.phone;

  ubigeo.value = {
    ubigeo_id: Number(addr.ubigeo_id),
    department: addr.department || '',
    province: addr.province || '',
    district: addr.district || ''
  };
}

function applySameAsCustomer() {
  if (!sameAsCustomer.value || !props.customer) return;
  const c = props.customer;
  form.value.receiver_first_name = c.nombres || c.first_name || c.name || '';
  form.value.receiver_last_name = c.apellidos || c.last_name || c.lastname || '';
  form.value.receiver_phone = c.telefono || c.phone || form.value.receiver_phone;
}

function selectService(opt) {
  if (opt.disponible === false) return;
  selectedServiceCode.value = opt.service_type_code;
  quote.value = {
    cost: opt.envio_gratis ? 0 : parseFloat(opt.precio || 0),
    free: !!opt.envio_gratis,
    service_type_code: opt.service_type_code,
    service_type_name: opt.service_type_nombre
  };
  loadFechas();
}

async function runQuote() {
  if (!ubigeo.value?.ubigeo_id) {
    quote.value = null;
    serviceOptions.value = [];
    return;
  }

  quoting.value = true;
  quoteError.value = '';
  serviceOptions.value = [];

  try {
    const result = await shippingApi.quote(ubigeo.value.ubigeo_id, props.itemsTotal);

    if (!result?.success) {
      quote.value = null;
      quoteError.value = result?.mensaje || 'No hay cobertura de reparto para este destino.';
      return;
    }

    if (result.service_types_enabled) {
      serviceOptions.value = result.opciones || [];
      // Preselecciona el primer servicio disponible; si ninguno lo está, el
      // vendedor ve el motivo (hora de corte) en cada opción.
      const primero = serviceOptions.value.find((o) => o.disponible !== false);
      if (primero) {
        selectService(primero);
      } else {
        quote.value = null;
        quoteError.value = 'No hay servicios de envío disponibles a esta hora para este destino.';
      }
      return;
    }

    quote.value = {
      cost: parseFloat(result.costo_envio || 0),
      free: !!result.envio_gratis,
      service_type_code: null,
      service_type_name: null
    };
    selectedServiceCode.value = null;
    await loadFechas();
  } catch (e) {
    console.error('[DeliveryModal] quote:', e);
    quote.value = null;
    quoteError.value = 'No se pudo cotizar el envío. Reintenta.';
  } finally {
    quoting.value = false;
  }
}

async function loadFechas() {
  if (!ubigeo.value?.ubigeo_id) return;
  try {
    const result = await shippingApi.getFechas(ubigeo.value.ubigeo_id, selectedServiceCode.value);
    fechasDisponibles.value = result?.mostrar_fecha ? result.fechas_disponibles || [] : [];
  } catch (e) {
    // La programación de fecha es opcional: si falla, la venta sigue sin fecha.
    console.error('[DeliveryModal] fechas:', e);
    fechasDisponibles.value = [];
  }
}

async function loadSavedAddresses() {
  const customerId = props.customer?.id || props.customer?.tiendacliente_id;
  if (!customerId) {
    savedAddresses.value = [];
    return;
  }
  try {
    const all = await shippingApi.getCustomerAddresses(customerId);
    // La dirección "Fiscal" es el domicilio SUNAT del RUC, no un destino de reparto.
    savedAddresses.value = all.filter((a) => (a.label || '').toLowerCase() !== 'fiscal');
  } catch (e) {
    console.error('[DeliveryModal] direcciones guardadas:', e);
    savedAddresses.value = [];
  }
}

function confirm() {
  validationError.value = '';

  if (!canConfirm.value) {
    validationError.value = 'Completa el distrito, la dirección y el teléfono de contacto.';
    return;
  }

  emit('confirm', {
    address: {
      ...form.value,
      address: form.value.address.trim(),
      ubigeo_id: ubigeo.value.ubigeo_id,
      department: ubigeo.value.department,
      province: ubigeo.value.province,
      district: ubigeo.value.district
    },
    quote: { ...quote.value }
  });

  emit('update:modelValue', false);
}

// Recotiza al cambiar el destino o el monto del carrito (el umbral de envío
// gratis depende del total, así que agregar productos puede volverlo gratis).
watch(() => ubigeo.value?.ubigeo_id, runQuote);
watch(() => props.itemsTotal, () => {
  if (ubigeo.value?.ubigeo_id) runQuote();
});

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;

    validationError.value = '';
    await loadSavedAddresses();

    if (props.initialAddress) {
      form.value = { ...emptyForm(), ...props.initialAddress };
      selectedAddressId.value = props.initialAddress.customer_address_id ?? null;
      ubigeo.value = {
        ubigeo_id: props.initialAddress.ubigeo_id,
        department: props.initialAddress.department || '',
        province: props.initialAddress.province || '',
        district: props.initialAddress.district || ''
      };
      selectedServiceCode.value = props.initialQuote?.service_type_code ?? null;
      // Se recotiza siempre: la tarifa guardada pudo quedar obsoleta.
      await runQuote();
      return;
    }

    form.value = emptyForm();
    ubigeo.value = null;
    quote.value = null;
    quoteError.value = '';
    selectedAddressId.value = null;
    selectedServiceCode.value = null;
    serviceOptions.value = [];
    fechasDisponibles.value = [];
    sameAsCustomer.value = false;
  }
);
</script>
