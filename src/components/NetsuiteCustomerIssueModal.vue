<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-hidden flex flex-col">
      <div class="bg-orange-500 text-white px-6 py-4 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="text-xl font-bold">Cliente con inconsistencia</h3>
          <p class="text-sm opacity-90">Datos en NetSuite impedirán la sincronización</p>
        </div>
      </div>

      <div class="px-6 py-4 space-y-3">
        <div v-if="customer" class="bg-gray-50 border border-gray-200 rounded p-3">
          <p class="text-sm text-gray-700"><span class="font-semibold">Cliente:</span> {{ customer.name }}</p>
          <p class="text-sm text-gray-700"><span class="font-semibold">Tipo actual:</span> {{ customer.document_type_name }}</p>
        </div>

        <div
          v-for="(issue, idx) in issues"
          :key="idx"
          class="bg-red-50 border border-red-200 rounded p-3"
        >
          <p class="text-sm text-red-800">{{ issue.message }}</p>
          <div v-if="issue.can_auto_fix" class="mt-2 text-xs text-gray-600">
            Se puede corregir automáticamente: <span class="font-semibold">{{ fixLabel(issue.fix_action) }}</span>
          </div>
        </div>

        <div v-if="fixable.length > 0" class="bg-blue-50 border border-blue-200 rounded p-3">
          <p class="text-sm text-blue-900">
            ¿Desea corregir los datos del cliente en NetSuite y continuar con la venta?
          </p>
        </div>
      </div>

      <div class="bg-gray-50 px-6 py-3 flex justify-end gap-2">
        <button
          @click="close"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
          :disabled="fixing"
        >
          Cancelar venta
        </button>
        <button
          v-if="fixable.length > 0"
          @click="applyFix"
          class="px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
          :disabled="fixing"
        >
          {{ fixing ? 'Corrigiendo...' : 'Corregir y continuar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { customersApi } from '../services/customersApi';

const props = defineProps({
  isVisible: Boolean,
  customer: Object,
  issues: { type: Array, default: () => [] },
  documentNumber: String,
});

const emit = defineEmits(['close', 'fixed']);

const fixing = ref(false);

const fixable = computed(() =>
  (props.issues || []).filter(i => i.can_auto_fix && i.fix_action)
);

const fixLabel = (action) => {
  const map = {
    update_document_type: 'Actualizar tipo de documento',
    set_legal_entity: 'Marcar como persona jurídica',
    set_natural_person: 'Marcar como persona natural',
  };
  return map[action] || action;
};

const close = () => emit('close');

const applyFix = async () => {
  if (!props.customer?.netsuite_id) {
    alert('No se puede corregir: falta ID del cliente en NetSuite');
    return;
  }

  fixing.value = true;
  try {
    // Prioritize the most comprehensive fix (set_legal_entity / set_natural_person)
    // over simple document type update.
    const priority = ['set_legal_entity', 'set_natural_person', 'update_document_type'];
    const chosen = priority.map(p => fixable.value.find(f => f.fix_action === p)).find(Boolean)
      || fixable.value[0];

    const result = await customersApi.netSuiteFix(
      props.customer.netsuite_id,
      chosen.fix_action,
      props.documentNumber
    );

    if (result.success) {
      emit('fixed');
    } else {
      alert('Error corrigiendo cliente: ' + (result.error || 'desconocido'));
    }
  } catch (e) {
    alert('Error: ' + e.message);
  } finally {
    fixing.value = false;
  }
};
</script>
