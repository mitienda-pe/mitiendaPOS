<template>
  <div class="bg-white rounded-lg shadow p-3 sm:p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Top cajeros</h2>
    <div v-if="!data || data.length === 0" class="h-32 flex items-center justify-center text-gray-400 text-sm">
      Sin ventas registradas a cajeros en este período
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            <th class="pb-2 pr-2">Cajero</th>
            <th class="pb-2 px-2 text-right">Ventas</th>
            <th class="pb-2 pl-2 text-right">Monto total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in data" :key="c.empleado_id" class="hover:bg-gray-50">
            <td class="py-2 pr-2 font-medium text-gray-900">{{ c.nombre }}</td>
            <td class="py-2 px-2 text-right text-gray-700">{{ c.orders }}</td>
            <td class="py-2 pl-2 text-right font-medium text-gray-900">
              S/ {{ c.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] }
});
</script>
