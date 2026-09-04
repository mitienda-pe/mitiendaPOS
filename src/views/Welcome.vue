<template>
  <div class="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Marca -->
      <div class="text-center">
        <img src="@/assets/logo-mitiendapos.svg" alt="MiTiendaPOS" class="h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-extrabold text-white">
          La caja para tu tienda
        </h1>
        <p class="mt-2 text-gray-300">
          Vende en local, cobra y emite comprobantes con el inventario
          sincronizado con tu tienda online.
        </p>
      </div>

      <!-- Accesos -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
        <router-link
          to="/cashier-login"
          class="w-full flex items-center justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          Soy cajero
        </router-link>
        <p class="text-xs text-gray-500 text-center -mt-2">
          Ingresa con el ID de tu tienda y tu PIN
        </p>

        <router-link
          to="/login"
          class="w-full flex items-center justify-center py-3 px-4 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          Ingresar como administrador
        </router-link>

        <div class="pt-2 border-t border-gray-200 text-center">
          <router-link
            to="/register"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            ¿No tienes cuenta? Crea una gratis
          </router-link>
        </div>
      </div>

      <!-- Salida al landing y versión -->
      <div class="text-center space-y-3">
        <a
          :href="landingUrl"
          target="_blank"
          rel="noopener"
          class="text-gray-300 hover:text-white font-medium transition-colors inline-flex items-center"
        >
          Conoce MiTienda POS
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </a>
        <p class="text-xs text-gray-400">MiTienda POS v{{ currentVersion }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppVersion } from '../composables/useVersionCheck';

// La página de marketing es canónica en el landing (Nuxt, SSR y multipaís).
// Desde aquí solo enlazamos: no duplicamos el contenido en el bundle del POS.
const landingUrl = 'https://mitienda.pe/punto-de-venta';

const { currentVersion } = useAppVersion();
</script>
