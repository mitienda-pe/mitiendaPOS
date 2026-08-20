/**
 * useThermalPrinter composable
 * Orquesta la impresión ESC/POS sobre dos drivers, según la plataforma:
 *
 *   - QZ Tray  (escritorio): WebSocket a localhost, con conexión y lista de
 *     impresoras. Confirma la impresión.
 *   - RawBT    (Android): intent `rawbt:` desde el navegador. No hay conexión ni
 *     lista de impresoras —la impresora se configura dentro de la app— y no hay
 *     confirmación: solo sabemos que el intent se disparó.
 *
 * Cada driver tiene su propio interruptor porque en una tablet QZ Tray no existe
 * y en escritorio RawBT tampoco. `canPrint` es el gate que deben consultar los
 * llamadores; si es false, caen al window.print() del navegador.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { connect, disconnect, isActive, listPrinters, printRaw } from '@/services/qzTrayService'
import * as rawbt from '@/services/rawbtService'
import { buildReceipt, buildTestReceipt } from '@/services/receiptBuilder'
import { STORAGE_KEYS, PAPER_FORMATS, DEFAULT_PAPER_FORMAT, getPaperFormat } from '@/config/printerConfig'

// Shared state across all component instances
const isConnected = ref(false)
const isEnabled = ref(false)
const printers = ref([])
const selectedPrinter = ref('')
const isLoading = ref(false)
const error = ref(null)

// RawBT (Android)
const rawbtEnabled = ref(false)
const rawbtSupported = ref(false)

// Ancho de rollo ('58' | '80'). Aplica a los dos drivers y también al ticket
// HTML que se imprime por el navegador cuando no hay impresión térmica.
const paperFormat = ref(DEFAULT_PAPER_FORMAT)

let initialized = false
let connectionCheckInterval = null

export function useThermalPrinter() {
  /**
   * Initialize: load persisted settings from localStorage
   */
  function init() {
    if (initialized) return

    // Restore persisted settings
    const savedPrinter = localStorage.getItem(STORAGE_KEYS.selectedPrinter)
    if (savedPrinter) selectedPrinter.value = savedPrinter

    const savedEnabled = localStorage.getItem(STORAGE_KEYS.thermalEnabled)
    isEnabled.value = savedEnabled === 'true'

    paperFormat.value = getPaperFormat().id

    rawbtSupported.value = rawbt.isSupported()
    if (rawbtSupported.value) {
      rawbtEnabled.value = localStorage.getItem(STORAGE_KEYS.rawbtEnabled) === 'true'
    }

    initialized = true

    // Try connecting if enabled. En Android no tiene sentido: QZ Tray es una app
    // de escritorio y el intento solo deja un WebSocket fallando cada arranque.
    if (isEnabled.value && !rawbtSupported.value) {
      tryConnect()
    }
  }

  /**
   * Try to connect to QZ Tray
   */
  async function tryConnect() {
    error.value = null
    isLoading.value = true
    try {
      const ok = await connect()
      isConnected.value = ok
      if (ok) {
        await detectPrinters()
      }
    } catch (err) {
      isConnected.value = false
      error.value = 'No se pudo conectar a QZ Tray'
      console.warn('[useThermalPrinter] Connection failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Disconnect from QZ Tray
   */
  async function tryDisconnect() {
    await disconnect()
    isConnected.value = false
  }

  /**
   * Detect available printers
   */
  async function detectPrinters() {
    error.value = null
    try {
      const found = await listPrinters()
      printers.value = found

      // If saved printer is no longer available, clear selection
      if (selectedPrinter.value && !found.includes(selectedPrinter.value)) {
        console.warn(
          `[useThermalPrinter] Saved printer "${selectedPrinter.value}" not found in system`
        )
      }

      return found
    } catch (err) {
      error.value = 'Error al detectar impresoras'
      console.error('[useThermalPrinter] detectPrinters error:', err)
      return []
    }
  }

  /**
   * Select a printer and persist choice
   */
  function selectPrinter(name) {
    selectedPrinter.value = name
    localStorage.setItem(STORAGE_KEYS.selectedPrinter, name)
  }

  /**
   * Toggle thermal printing on/off
   */
  async function setEnabled(value) {
    isEnabled.value = value
    localStorage.setItem(STORAGE_KEYS.thermalEnabled, String(value))

    if (value && !rawbtSupported.value) {
      await tryConnect()
    } else if (!value) {
      await tryDisconnect()
    }
  }

  /**
   * Toggle RawBT (Android) on/off
   */
  function setRawbtEnabled(value) {
    rawbtEnabled.value = value
    localStorage.setItem(STORAGE_KEYS.rawbtEnabled, String(value))
  }

  /**
   * Cambiar el ancho de rollo. receiptBuilder y los tickets HTML lo releen en
   * cada impresión, así que no hace falta recargar el POS.
   */
  function setPaperFormat(id) {
    if (!PAPER_FORMATS[id]) return
    paperFormat.value = id
    localStorage.setItem(STORAGE_KEYS.paperWidth, id)
  }

  /**
   * Driver activo, o null si hay que caer al window.print() del navegador.
   * RawBT manda sobre QZ: si el cajero lo activó, está en una tablet.
   */
  const activeDriver = computed(() => {
    if (rawbtSupported.value && rawbtEnabled.value) return 'rawbt'
    if (isEnabled.value && isConnected.value) return 'qz'
    return null
  })

  /** Gate para los llamadores: ¿hay impresión térmica disponible? */
  const canPrint = computed(() => activeDriver.value !== null)

  /**
   * Print a receipt via ESC/POS.
   * Returns true if printed successfully, false if unavailable (caller should fallback).
   *
   * @param {Object} orderData - Order data matching receiptBuilder.buildReceipt() format
   * @returns {Promise<boolean>}
   */
  async function printReceipt(orderData) {
    const driver = activeDriver.value
    if (!driver) return false

    if (driver === 'rawbt') {
      try {
        // OJO: RawBT no devuelve resultado. true = "el intent se disparó".
        // Si la app no está instalada, Chrome abre Play Store y no hay fallback.
        rawbt.printRaw(buildReceipt(orderData))
        return true
      } catch (err) {
        console.error('[useThermalPrinter] RawBT print failed:', err)
        error.value = `Error de impresión: ${err.message}`
        return false
      }
    }

    // Check connection
    if (!isActive()) {
      const ok = await connect()
      isConnected.value = ok
      if (!ok) return false
    }

    if (!selectedPrinter.value) {
      console.warn('[useThermalPrinter] No printer selected')
      return false
    }

    try {
      const data = buildReceipt(orderData)
      await printRaw(selectedPrinter.value, data)
      return true
    } catch (err) {
      console.error('[useThermalPrinter] Print failed:', err)
      error.value = `Error de impresión: ${err.message}`
      return false
    }
  }

  /**
   * Print a test page
   * @returns {Promise<boolean>}
   */
  async function printTestPage() {
    if (activeDriver.value === 'rawbt') {
      rawbt.printRaw(buildTestReceipt())
      return true
    }

    if (!isActive()) {
      const ok = await connect()
      isConnected.value = ok
      if (!ok) throw new Error('QZ Tray no está conectado')
    }

    if (!selectedPrinter.value) {
      throw new Error('No hay impresora seleccionada')
    }

    const data = buildTestReceipt()
    await printRaw(selectedPrinter.value, data)
    return true
  }

  /**
   * Check connection status periodically
   */
  function startConnectionCheck() {
    if (connectionCheckInterval) return
    connectionCheckInterval = setInterval(() => {
      isConnected.value = isActive()
    }, 5000)
  }

  function stopConnectionCheck() {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
    }
  }

  // Auto-init on first use
  init()

  return {
    // State
    isConnected,
    isEnabled,
    printers,
    selectedPrinter,
    isLoading,
    error,
    rawbtEnabled,
    rawbtSupported,
    paperFormat,
    paperFormats: PAPER_FORMATS,
    activeDriver,
    canPrint,

    // Actions
    tryConnect,
    tryDisconnect,
    detectPrinters,
    selectPrinter,
    setEnabled,
    setRawbtEnabled,
    setPaperFormat,
    printReceipt,
    printTestPage,
    startConnectionCheck,
    stopConnectionCheck,
  }
}
