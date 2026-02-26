/**
 * QZ Tray Service
 * Manages WebSocket connection to QZ Tray desktop app for raw ESC/POS printing.
 * QZ Tray must be installed and running on the local machine.
 */

import qz from 'qz-tray'

let connected = false

/**
 * Unsigned mode: no certificate, no signature.
 * QZ Tray will show a trust dialog the first time asking the user to allow the connection.
 * Once trusted, subsequent connections are automatic.
 */
qz.security.setCertificatePromise(function (resolve) {
  resolve()
})

qz.security.setSignatureAlgorithm('SHA512')
qz.security.setSignaturePromise(function () {
  return function (resolve) {
    resolve()
  }
})

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
    console.error('[QZ Tray] Error de conexión:', err?.message || err)
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
