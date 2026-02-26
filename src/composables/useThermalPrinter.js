/**
 * useThermalPrinter composable
 * Orchestrates QZ Tray connection, printer selection, and ESC/POS receipt printing.
 * Provides graceful fallback: returns false from printReceipt() if unavailable,
 * so callers can fall through to window.print().
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { connect, disconnect, isActive, listPrinters, printRaw } from '@/services/qzTrayService'
import { buildReceipt, buildTestReceipt } from '@/services/receiptBuilder'
import { STORAGE_KEYS } from '@/config/printerConfig'

// Shared state across all component instances
const isConnected = ref(false)
const isEnabled = ref(false)
const printers = ref([])
const selectedPrinter = ref('')
const isLoading = ref(false)
const error = ref(null)

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

    initialized = true

    // Try connecting if enabled
    if (isEnabled.value) {
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

    if (value) {
      await tryConnect()
    } else {
      await tryDisconnect()
    }
  }

  /**
   * Print a receipt via ESC/POS.
   * Returns true if printed successfully, false if unavailable (caller should fallback).
   *
   * @param {Object} orderData - Order data matching receiptBuilder.buildReceipt() format
   * @returns {Promise<boolean>}
   */
  async function printReceipt(orderData) {
    if (!isEnabled.value) return false

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

    // Actions
    tryConnect,
    tryDisconnect,
    detectPrinters,
    selectPrinter,
    setEnabled,
    printReceipt,
    printTestPage,
    startConnectionCheck,
    stopConnectionCheck,
  }
}
