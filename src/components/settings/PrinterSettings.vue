<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Impresora Térmica</h1>

    <!-- Connection Status -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Estado de QZ Tray</h2>

      <div class="flex items-center gap-3 mb-4">
        <span
          class="inline-block w-3 h-3 rounded-full"
          :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
        ></span>
        <span class="text-gray-700">
          {{ isConnected ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>

      <div v-if="!isConnected && isEnabled" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p class="text-sm text-yellow-800 font-medium">QZ Tray no está ejecutándose</p>
            <p class="text-sm text-yellow-700 mt-1">
              Descarga e instala QZ Tray desde
              <a href="https://qz.io/download/" target="_blank" rel="noopener" class="underline font-medium">qz.io/download</a>
              y asegúrate de que esté corriendo.
            </p>
            <button
              @click="handleConnect"
              class="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Conectando...' : 'Reintentar conexión' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Enable/Disable Toggle -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Impresión Térmica</h2>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-700 font-medium">Activar impresión térmica</p>
          <p class="text-sm text-gray-500">
            Si está desactivada, se usará la impresión estándar del navegador
          </p>
        </div>
        <button
          @click="handleToggleEnabled"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="isEnabled ? 'bg-blue-600' : 'bg-gray-200'"
          :disabled="isLoading"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <!-- Printer Selection -->
    <div v-if="isEnabled" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Seleccionar Impresora</h2>

      <div class="flex gap-3 mb-4">
        <button
          @click="handleDetectPrinters"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          :disabled="isLoading || !isConnected"
        >
          <span v-if="isLoading">Buscando...</span>
          <span v-else>Detectar impresoras</span>
        </button>
      </div>

      <div v-if="printers.length === 0 && isConnected" class="text-sm text-gray-500 py-4">
        No se encontraron impresoras. Haz clic en "Detectar impresoras".
      </div>

      <div v-if="printers.length > 0" class="space-y-2">
        <label
          v-for="printer in printers"
          :key="printer"
          class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="selectedPrinter === printer
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:bg-gray-50'"
        >
          <input
            type="radio"
            name="printer"
            :value="printer"
            :checked="selectedPrinter === printer"
            @change="handleSelectPrinter(printer)"
            class="h-4 w-4 text-blue-600"
          />
          <div class="flex-1">
            <span class="text-sm text-gray-800">{{ printer }}</span>
          </div>
          <span
            v-if="selectedPrinter === printer"
            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
          >
            Seleccionada
          </span>
        </label>
      </div>
    </div>

    <!-- Test Print -->
    <div v-if="isEnabled && isConnected && selectedPrinter" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Prueba de Impresión</h2>
      <p class="text-sm text-gray-500 mb-4">
        Imprime un ticket de prueba para verificar que la configuración es correcta.
      </p>
      <button
        @click="handleTestPrint"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        :disabled="testPrinting"
      >
        {{ testPrinting ? 'Imprimiendo...' : 'Imprimir ticket de prueba' }}
      </button>
      <p v-if="testSuccess" class="text-sm text-green-600 mt-3">
        Ticket de prueba enviado correctamente.
      </p>
      <p v-if="testError" class="text-sm text-red-600 mt-3">
        {{ testError }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useThermalPrinter } from '../../composables/useThermalPrinter'

const {
  isConnected,
  isEnabled,
  printers,
  selectedPrinter,
  isLoading,
  error,
  tryConnect,
  detectPrinters,
  selectPrinter,
  setEnabled,
  printTestPage,
} = useThermalPrinter()

const testPrinting = ref(false)
const testSuccess = ref(false)
const testError = ref(null)

async function handleToggleEnabled() {
  await setEnabled(!isEnabled.value)
}

async function handleConnect() {
  await tryConnect()
}

async function handleDetectPrinters() {
  await detectPrinters()
}

function handleSelectPrinter(name) {
  selectPrinter(name)
}

async function handleTestPrint() {
  testPrinting.value = true
  testSuccess.value = false
  testError.value = null

  try {
    await printTestPage()
    testSuccess.value = true
  } catch (err) {
    testError.value = err.message || 'Error al imprimir ticket de prueba'
  } finally {
    testPrinting.value = false
  }
}
</script>
