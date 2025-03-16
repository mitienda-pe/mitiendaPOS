<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
    
    <!-- Tarjetas de resumen -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <!-- Ventas del día -->
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Ventas del día</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">S/ 2,450.50</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>12%</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos vendidos -->
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Productos vendidos</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">78</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>8%</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Clientes nuevos -->
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Clientes nuevos</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">12</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>5%</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos con bajo stock -->
      <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="13" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Productos con bajo stock</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">5</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>2</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico de ventas por día -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Ventas de los últimos 7 días</h2>
        <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div class="w-full h-full p-4 flex items-end justify-between space-x-2">
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 40%"></div>
              <span class="text-xs mt-1">Lun</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 60%"></div>
              <span class="text-xs mt-1">Mar</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 75%"></div>
              <span class="text-xs mt-1">Mié</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 50%"></div>
              <span class="text-xs mt-1">Jue</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 85%"></div>
              <span class="text-xs mt-1">Vie</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 90%"></div>
              <span class="text-xs mt-1">Sáb</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="bg-blue-500 w-10 rounded-t-lg" style="height: 30%"></div>
              <span class="text-xs mt-1">Dom</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de productos más vendidos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Productos más vendidos</h2>
        <div class="h-64 bg-gray-100 rounded-lg p-4">
          <div class="space-y-4">
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">Producto A</span>
              <div class="flex-1 ml-2">
                <div class="h-4 bg-green-500 rounded-full" style="width: 85%"></div>
              </div>
              <span class="ml-2 text-sm font-medium">85%</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">Producto B</span>
              <div class="flex-1 ml-2">
                <div class="h-4 bg-green-500 rounded-full" style="width: 70%"></div>
              </div>
              <span class="ml-2 text-sm font-medium">70%</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">Producto C</span>
              <div class="flex-1 ml-2">
                <div class="h-4 bg-green-500 rounded-full" style="width: 60%"></div>
              </div>
              <span class="ml-2 text-sm font-medium">60%</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">Producto D</span>
              <div class="flex-1 ml-2">
                <div class="h-4 bg-green-500 rounded-full" style="width: 45%"></div>
              </div>
              <span class="ml-2 text-sm font-medium">45%</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">Producto E</span>
              <div class="flex-1 ml-2">
                <div class="h-4 bg-green-500 rounded-full" style="width: 30%"></div>
              </div>
              <span class="ml-2 text-sm font-medium">30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// En una implementación real, aquí se cargarían los datos desde la API
</script>
