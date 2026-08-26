<script setup>
/**
 * Compartir un link de pago recién creado desde el POS.
 *
 * El vendedor toma el pedido en el mostrador o por teléfono y le manda el cobro
 * al cliente por WhatsApp. La venta se crea cuando el cliente paga, no ahora:
 * por eso este modal no toca la caja del turno ni imprime ticket.
 */
import { computed, ref } from 'vue';
import { formatCurrency } from '../utils/formatters.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  link: { type: Object, default: null },
  telefono: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const copiado = ref(false);

const mensaje = computed(() => {
  if (!props.link) return '';
  const saludo = props.link.mensaje ? `${props.link.mensaje}\n\n` : '';
  return `${saludo}Puedes pagar aquí: ${props.link.url}`;
});

const urlWhatsapp = computed(() => {
  const tel = (props.telefono || '').replace(/\D/g, '');
  const texto = encodeURIComponent(mensaje.value);
  // Sin teléfono, wa.me abre el selector de contactos, que es lo que el
  // vendedor necesita cuando la venta no tiene cliente asignado.
  return tel ? `https://wa.me/${tel}?text=${texto}` : `https://wa.me/?text=${texto}`;
});

const total = computed(() => props.link?.totales?.total ?? 0);

async function copiar() {
  if (!props.link) return;
  try {
    await navigator.clipboard.writeText(props.link.url);
    copiado.value = true;
    setTimeout(() => { copiado.value = false; }, 2000);
  } catch {
    copiado.value = false;
  }
}

function cerrar() {
  emit('update:modelValue', false);
}
</script>

<template>
  <div
    v-if="modelValue && link"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="cerrar"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Cobrar por WhatsApp</h2>
          <p class="mt-1 text-sm text-gray-500">
            La venta se registra cuando el cliente pague.
          </p>
        </div>
        <button class="p-1 text-gray-400 hover:text-gray-600" aria-label="Cerrar" @click="cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p class="text-3xl font-semibold text-gray-900">{{ formatCurrency(total) }}</p>

      <div class="mt-4">
        <label class="mb-1 block text-sm text-gray-600">Enlace</label>
        <div class="flex gap-2">
          <input
            :value="link.url"
            readonly
            class="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-xs text-gray-700"
          />
          <button
            class="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            @click="copiar"
          >
            {{ copiado ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
      </div>

      <a
        :href="urlWhatsapp"
        target="_blank"
        rel="noopener"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
      >
        Enviar por WhatsApp
      </a>

      <button
        class="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        @click="cerrar"
      >
        Listo
      </button>
    </div>
  </div>
</template>
