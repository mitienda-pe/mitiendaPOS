/**
 * QZ Tray Service
 * Manages WebSocket connection to QZ Tray desktop app for raw ESC/POS printing.
 * QZ Tray must be installed and running on the local machine.
 */

import qz from 'qz-tray'

let connected = false

/**
 * Override certificate handling for unsigned usage.
 * In production, you should sign with your own certificate.
 */
qz.security.setCertificatePromise(() =>
  Promise.resolve(
    '-----BEGIN CERTIFICATE-----\n' +
    'MIIBszCCARigAwIBAgIJALB5Wv3MOLEEMA0GCSqGSIb3DQEBCwUAMBMxETAPBgNV\n' +
    'BAMMCHFyLXRlc3QwHhcNMjMwMTAxMDAwMDAwWhcNMjYwMTAxMDAwMDAwWjATMREw\n' +
    'DwYDVQQDDAhxci10ZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGmTj3\n' +
    'nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn/nnn\n' +
    'nnn/nnn/nnn/QIDAQABoyMwITAfBgNVHREEGDAWhwR/AAABhwQAAAABhwSsEAABMA0G\n' +
    'CSqGSIb3DQEBCwUAA4GBAFplaceholder\n' +
    '-----END CERTIFICATE-----'
  )
)

// Skip signature validation for development (unsigned mode)
qz.security.setSignatureAlgorithm('SHA512')
qz.security.setSignaturePromise(() => () => Promise.resolve(''))

/**
 * Connect to QZ Tray via WebSocket
 * @returns {Promise<boolean>}
 */
export async function connect() {
  if (connected && qz.websocket.isActive()) {
    return true
  }

  try {
    await qz.websocket.connect()
    connected = true
    return true
  } catch (err) {
    connected = false
    // QUIE-4xx = QZ Tray not running, expected in environments without it
    if (err?.message?.includes?.('QUIE') || err?.message?.includes?.('Unable to connect')) {
      console.warn('[QZ Tray] No se pudo conectar. ¿Está QZ Tray ejecutándose?')
    } else {
      console.error('[QZ Tray] Error de conexión:', err)
    }
    return false
  }
}

/**
 * Disconnect from QZ Tray
 */
export async function disconnect() {
  if (qz.websocket.isActive()) {
    try {
      await qz.websocket.disconnect()
    } catch (err) {
      console.warn('[QZ Tray] Error al desconectar:', err)
    }
  }
  connected = false
}

/**
 * Check if QZ Tray WebSocket is active
 * @returns {boolean}
 */
export function isActive() {
  return qz.websocket.isActive()
}

/**
 * List all available printers on the system
 * @returns {Promise<string[]>}
 */
export async function listPrinters() {
  if (!qz.websocket.isActive()) {
    const ok = await connect()
    if (!ok) return []
  }

  try {
    const printers = await qz.printers.find()
    return Array.isArray(printers) ? printers : [printers]
  } catch (err) {
    console.error('[QZ Tray] Error listando impresoras:', err)
    return []
  }
}

/**
 * Send raw ESC/POS data to a printer
 * @param {string} printerName - Name of the target printer
 * @param {Uint8Array|number[]} data - Raw ESC/POS byte data
 * @returns {Promise<boolean>}
 */
export async function printRaw(printerName, data) {
  if (!qz.websocket.isActive()) {
    const ok = await connect()
    if (!ok) throw new Error('QZ Tray no está conectado')
  }

  const config = qz.configs.create(printerName, {
    altPrinting: false,
  })

  // Convert Uint8Array to base64 for QZ Tray
  const base64Data = arrayToBase64(data instanceof Uint8Array ? data : new Uint8Array(data))

  await qz.print(config, [
    {
      type: 'raw',
      format: 'base64',
      data: base64Data,
    },
  ])

  return true
}

/**
 * Convert Uint8Array to base64 string
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function arrayToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export default {
  connect,
  disconnect,
  isActive,
  listPrinters,
  printRaw,
}
