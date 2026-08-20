<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Impresora Térmica</h1>

    <!-- ===== Android: RawBT ===== -->
    <template v-if="rawbtSupported">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Impresión térmica en Android</h2>

        <p class="text-sm text-gray-700 mb-4">
          Estás usando el POS en un dispositivo Android. Aquí no corre QZ Tray (es un programa de
          escritorio), así que la impresión térmica se hace con <strong>RawBT</strong>: una app
          gratuita que recibe el ticket en formato ESC/POS y lo manda a tu impresora por Bluetooth,
          USB o Wi-Fi, <strong>sin el cuadro de diálogo de impresión</strong>.
        </p>

        <div class="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p class="text-gray-700 font-medium">Imprimir con RawBT</p>
            <p class="text-sm text-gray-500">
              Si está desactivada, se usará la impresión estándar del navegador
            </p>
          </div>
          <button
            @click="handleToggleRawbt"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="rawbtEnabled ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="rawbtEnabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <p class="text-sm text-yellow-800">
            <strong>Importante:</strong> RawBT no le avisa al POS si el ticket salió o no. Antes de
            usarlo en caja, imprime un ticket de prueba desde aquí. Si RawBT no está instalado, al
            imprimir se abrirá su página en Play Store en vez de salir el ticket.
          </p>
        </div>
      </div>

      <!-- Cómo configurarlo -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <button
          @click="showRawbtInfo = !showRawbtInfo"
          class="w-full flex items-center justify-between text-left"
        >
          <span class="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <svg class="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cómo instalar y configurar RawBT
          </span>
          <svg
            class="h-5 w-5 text-gray-400 transition-transform"
            :class="showRawbtInfo ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-show="showRawbtInfo" class="mt-4 space-y-4 text-sm text-gray-700">
          <ol class="list-decimal list-inside space-y-1.5">
            <li>
              Instala
              <a :href="RAWBT_PLAY_URL" target="_blank" rel="noopener" class="text-primary-600 underline font-medium">RawBT</a>
              desde Play Store.
            </li>
            <li>
              Si tu impresora es Bluetooth, emparéjala primero en
              <strong>Ajustes → Bluetooth</strong> del dispositivo.
            </li>
            <li>
              Abre RawBT y elige tu impresora en <strong>Configuración → Dispositivo</strong>
              (Bluetooth, USB OTG o red).
            </li>
            <li>
              En RawBT indica el <strong>ancho de papel</strong> que usas (58&nbsp;mm o 80&nbsp;mm) y
              activa el corte automático si tu impresora lo soporta.
            </li>
            <li>Vuelve aquí, activa <strong>Imprimir con RawBT</strong> e imprime un ticket de prueba.</li>
          </ol>

          <div class="bg-primary-50 border-l-4 border-primary-400 p-4">
            <p class="text-primary-700">
              La primera vez que el POS mande un ticket, Android te preguntará con qué app abrirlo:
              elige <strong>RawBT</strong> y marca <strong>Siempre</strong> para que no vuelva a
              preguntar.
            </p>
          </div>

          <p>
            <a :href="RAWBT_PLAY_URL" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Instalar RawBT
            </a>
          </p>
        </div>
      </div>
    </template>

    <!-- ===== Escritorio: QZ Tray ===== -->
    <!-- ¿Qué es QZ Tray? -->
    <div v-if="!rawbtSupported" class="bg-white rounded-lg shadow p-6 mb-6">
      <button
        @click="showQzInfo = !showQzInfo"
        class="w-full flex items-center justify-between text-left"
      >
        <span class="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <svg class="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ¿Qué es QZ Tray y por qué lo necesito?
        </span>
        <svg
          class="h-5 w-5 text-gray-400 transition-transform"
          :class="showQzInfo ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-show="showQzInfo" class="mt-4 space-y-4 text-sm text-gray-700">
        <p>
          <strong>QZ Tray</strong> es un pequeño programa gratuito que se instala en la computadora
          donde está conectada tu impresora térmica. Actúa como puente entre el POS (que corre en el
          navegador) y la impresora, permitiendo enviar los tickets directamente en formato ESC/POS
          <strong>sin el cuadro de diálogo de impresión del navegador</strong> y con el formato correcto
          de rollo térmico.
        </p>

        <div class="bg-primary-50 border-l-4 border-primary-400 p-4">
          <p class="font-medium text-primary-800 mb-1">¿Cuándo lo necesito?</p>
          <p class="text-primary-700">
            Solo si vas a imprimir en una impresora térmica de tickets (58mm / 80mm). Si imprimes en
            una impresora normal desde el navegador, puedes dejar la impresión térmica desactivada.
          </p>
        </div>

        <div>
          <p class="font-medium text-gray-800 mb-2">Cómo instalarlo y configurarlo</p>
          <ol class="list-decimal list-inside space-y-1.5">
            <li>
              Descarga QZ Tray desde
              <a href="https://qz.io/download/" target="_blank" rel="noopener" class="text-primary-600 underline font-medium">qz.io/download</a>
              (disponible para Windows, macOS y Linux) e instálalo en la computadora donde está la impresora.
            </li>
            <li>Ábrelo. Quedará corriendo en segundo plano; verás su ícono en la bandeja del sistema (junto al reloj).</li>
            <li>La primera vez que el POS intente conectarse, QZ Tray mostrará un aviso de confianza: haz clic en <strong>Permitir / Allow</strong> (marca "Recordar" para no repetirlo).</li>
            <li>Vuelve a esta pantalla: el estado debe cambiar a <strong>Conectado</strong>.</li>
            <li>Activa <strong>impresión térmica</strong>, pulsa <strong>Detectar impresoras</strong>, selecciona la tuya e imprime un ticket de prueba.</li>
          </ol>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p class="text-yellow-800">
            <strong>Importante:</strong> QZ Tray debe estar siempre abierto mientras usas el POS. Si lo
            cierras o reinicias la computadora sin abrirlo, la impresión térmica no funcionará y verás el
            estado "Desconectado".
          </p>
        </div>

        <p>
          <a href="https://qz.io/download/" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar QZ Tray
          </a>
        </p>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="!rawbtSupported" class="bg-white rounded-lg shadow p-6 mb-6">
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
    <div v-if="!rawbtSupported" class="bg-white rounded-lg shadow p-6 mb-6">
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
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="isEnabled ? 'bg-primary-600' : 'bg-gray-200'"
          :disabled="isLoading"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <!-- Printer Selection (solo QZ: en RawBT la impresora se elige en la app) -->
    <div v-if="!rawbtSupported && isEnabled" class="bg-white rounded-lg shadow p-6 mb-6">
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
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50'"
        >
          <input
            type="radio"
            name="printer"
            :value="printer"
            :checked="selectedPrinter === printer"
            @change="handleSelectPrinter(printer)"
            class="h-4 w-4 text-primary-600"
          />
          <div class="flex-1">
            <span class="text-sm text-gray-800">{{ printer }}</span>
          </div>
          <span
            v-if="selectedPrinter === printer"
            class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
          >
            Seleccionada
          </span>
        </label>
      </div>
    </div>

    <!-- Ancho de papel: aplica a ambos drivers y al ticket HTML del navegador -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-1">Ancho de papel</h2>
      <p class="text-sm text-gray-500 mb-4">
        Debe coincidir con el rollo que carga tu impresora. Si no coincide, el ticket sale cortado
        por un lado o con mucho espacio en blanco.
      </p>

      <div class="grid grid-cols-2 gap-3">
        <label
          v-for="format in paperFormats"
          :key="format.id"
          class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="paperFormat === format.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50'"
        >
          <input
            type="radio"
            name="paper-format"
            :value="format.id"
            :checked="paperFormat === format.id"
            @change="handleSelectPaperFormat(format.id)"
            class="h-4 w-4 text-primary-600"
          />
          <div>
            <span class="text-sm font-medium text-gray-800">{{ format.label }}</span>
            <span class="block text-xs text-gray-500">{{ format.columns }} caracteres</span>
          </div>
        </label>
      </div>

      <p v-if="rawbtSupported" class="text-sm text-gray-500 mt-4">
        Configura el <strong>mismo</strong> ancho dentro de la app RawBT: aquí se decide cómo se
        arma el ticket, allá cómo se imprime.
      </p>
    </div>

    <!-- Test Print -->
    <div v-if="activeDriver === 'rawbt' || (canPrint && selectedPrinter)" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Prueba de Impresión</h2>
      <p class="text-sm text-gray-500 mb-4">
        Imprime un ticket de prueba para verificar que la configuración es correcta.
      </p>
      <button
        @click="handleTestPrint"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        :disabled="testPrinting"
      >
        {{ testPrinting ? 'Imprimiendo...' : 'Imprimir ticket de prueba' }}
      </button>
      <p v-if="testSuccess" class="text-sm text-green-600 mt-3">
        {{ activeDriver === 'rawbt'
          ? 'Ticket enviado a RawBT. Verifica que haya salido en la impresora.'
          : 'Ticket de prueba enviado correctamente.' }}
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
  rawbtEnabled,
  rawbtSupported,
  paperFormat,
  paperFormats,
  activeDriver,
  canPrint,
  tryConnect,
  detectPrinters,
  selectPrinter,
  setEnabled,
  setRawbtEnabled,
  setPaperFormat,
  printTestPage,
} = useThermalPrinter()

const RAWBT_PLAY_URL = 'https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter'

const showQzInfo = ref(false)
const showRawbtInfo = ref(false)
const testPrinting = ref(false)
const testSuccess = ref(false)
const testError = ref(null)

async function handleToggleEnabled() {
  await setEnabled(!isEnabled.value)
}

function handleSelectPaperFormat(id) {
  setPaperFormat(id)
}

function handleToggleRawbt() {
  setRawbtEnabled(!rawbtEnabled.value)
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
