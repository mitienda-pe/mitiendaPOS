<template>
  <div v-if="data && data.length > 0" class="bg-white rounded-lg shadow p-3 sm:p-6 border-l-4 border-red-500">
    <h2 class="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      Productos con stock bajo
    </h2>
    <ul class="divide-y divide-gray-100">
      <li
        v-for="p in data"
        :key="p.id"
        class="py-2 flex items-center justify-between text-sm"
      >
        <div class="min-w-0">
          <div class="font-medium text-gray-900 truncate">{{ p.name }}</div>
          <div v-if="p.sku" class="text-xs text-gray-500">{{ p.sku }}</div>
        </div>
        <span
          class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
          :class="p.stock <= 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
        >
          {{ p.stock }} en stock
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] }
});
</script>
