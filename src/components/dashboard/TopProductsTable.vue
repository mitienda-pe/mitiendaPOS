<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Top 10 productos vendidos</h2>
    <div v-if="!data || data.length === 0" class="h-32 flex items-center justify-center text-gray-400 text-sm">
      Sin productos vendidos en este período
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            <th class="pb-2 pr-2">Producto</th>
            <th class="pb-2 px-2 text-right">Unidades</th>
            <th class="pb-2 px-2 text-right">Ventas netas</th>
            <th class="pb-2 pl-2 text-right">Stock</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in data" :key="p.id" class="hover:bg-gray-50">
            <td class="py-2 pr-2">
              <div class="font-medium text-gray-900 truncate max-w-xs">{{ p.name }}</div>
              <div v-if="p.sku" class="text-xs text-gray-500">{{ p.sku }}</div>
            </td>
            <td class="py-2 px-2 text-right text-gray-700">{{ p.units }}</td>
            <td class="py-2 px-2 text-right font-medium text-gray-900">
              S/ {{ p.net_sales.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </td>
            <td class="py-2 pl-2 text-right">
              <span :class="p.stock <= 0 ? 'text-red-600 font-semibold' : 'text-gray-700'">
                {{ p.stock }}
              </span>
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
