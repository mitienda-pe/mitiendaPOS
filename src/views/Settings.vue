<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>
        <nav class="space-y-2">
          <router-link
            to="/settings/branches"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Sucursales
          </router-link>

          <router-link
            to="/settings/users"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Usuarios
          </router-link>

          <router-link
            to="/settings/printer"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Impresora
          </router-link>

          <!-- Netsuite Group -->
          <div class="pt-2">
            <div class="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Netsuite
            </div>
            <div class="ml-4 space-y-1 mt-1">
              <router-link
                to="/settings/netsuite/preferences"
                class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                active-class="bg-blue-50 text-blue-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Configuración
              </router-link>

              <router-link
                to="/settings/netsuite/branches"
                class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                active-class="bg-blue-50 text-blue-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Sucursales
              </router-link>

              <router-link
                to="/settings/netsuite/users"
                class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                active-class="bg-blue-50 text-blue-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Usuarios
              </router-link>

              <router-link
                to="/settings/netsuite/cashier-accounts"
                class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                active-class="bg-blue-50 text-blue-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Cuentas por Caja
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- Back to menu button -->
      <div class="absolute bottom-0 left-0 right-0 p-6 border-t">
        <router-link
          to="/menu"
          class="flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver al Menú
        </router-link>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
// Settings layout with sidebar navigation
</script>
