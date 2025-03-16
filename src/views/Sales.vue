<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Historial de Ventas</h1>
        <div class="flex space-x-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Buscar por cliente o número..."
              class="p-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <select
            class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-cyan-500 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M18.4 8.64L18.57 8.8a2 2 0 0 1 0 2.83l-8.49 8.48a2 2 0 0 1-2.83 0l-.17-.17a2 2 0 0 1 0-2.83l8.49-8.48a2 2 0 0 1 2.83 0Z"></path>
            <path d="M15 8h5v5"></path>
            <path d="M18 11l-7 7"></path>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">Módulo en desarrollo</h2>
          <p class="text-gray-600 text-center max-w-md">
            El módulo de Historial de Ventas estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
