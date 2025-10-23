<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Historial de Turnos</h1>
      <router-link
        to="/menu"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al Menú
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="8" r="6"/>
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
        <path d="M7 6h1v4"/>
        <path d="m16.71 13.88.7.71-2.82 2.82"/>
      </svg>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Historial de Turnos de Caja</h2>
      <p class="text-gray-600 max-w-md mx-auto">
        Consulta el historial completo de turnos, montos y cuadres de caja.
      </p>
      <div class="mt-6 inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
        <p class="text-sm font-medium">🚧 Próximamente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Shifts history placeholder
</script>
