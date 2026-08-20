/**
 * RawBT Service
 * Envía ESC/POS crudo a la app RawBT (Android) mediante el esquema de intents.
 *
 * A diferencia de QZ Tray —que es una app de escritorio y expone un WebSocket en
 * localhost— RawBT no tiene canal de ida y vuelta: el navegador dispara un intent
 * y la app imprime. No hay confirmación ni estado de "conectado". Por eso este
 * servicio no puede reportar éxito real: solo si logró disparar el intent.
 *
 * Formato del URI (el mismo que usa escpos-php de mike42):
 *   intent:base64,<datos>#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;
 *
 * Si RawBT no está instalado, Chrome abre la ficha de Play Store del paquete,
 * que es un fallo autoexplicativo para el cajero.
 */

const RAWBT_PACKAGE = 'ru.a402d.rawbtprinter'

// Los tickets de texto pesan unos pocos KB. Un URI muy por encima de eso indica
// que algo se fue de madre (p.ej. un logo raster) y Chrome lo truncaría en
// silencio, así que preferimos fallar con un mensaje claro.
const MAX_URI_LENGTH = 512 * 1024

/**
 * ¿Estamos en un entorno donde RawBT puede existir? (Android)
 * @returns {boolean}
 */
export function isSupported() {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

/**
 * Codifica bytes a base64 por bloques.
 * String.fromCharCode(...bytes) revienta la pila con arreglos grandes.
 * @param {Uint8Array|number[]} bytes
 * @returns {string}
 */
function toBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < arr.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

/**
 * Arma el URI de intent para RawBT.
 * @param {Uint8Array|number[]} bytes - Comandos ESC/POS crudos
 * @returns {string}
 */
export function buildIntentUri(bytes) {
  return `intent:base64,${toBase64(bytes)}#Intent;scheme=rawbt;package=${RAWBT_PACKAGE};end;`
}

/**
 * Envía ESC/POS crudo a RawBT.
 *
 * Debe llamarse dentro del manejador de un toque del usuario: Chrome exige gesto
 * para lanzar un intent externo. Devolver true significa "el intent se disparó",
 * NO "el papel salió".
 *
 * @param {Uint8Array|number[]} bytes - Comandos ESC/POS crudos
 * @returns {boolean}
 */
export function printRaw(bytes) {
  if (!isSupported()) {
    throw new Error('RawBT solo está disponible en Android')
  }

  const uri = buildIntentUri(bytes)

  if (uri.length > MAX_URI_LENGTH) {
    throw new Error('El ticket es demasiado grande para enviarlo a RawBT')
  }

  // Un <a> sintético conserva el gesto del usuario mejor que asignar
  // window.location dentro de una cadena de promesas.
  try {
    const link = document.createElement('a')
    link.href = uri
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.warn('[rawbtService] Fallback a window.location:', err)
    window.location.href = uri
  }

  return true
}

export default {
  isSupported,
  buildIntentUri,
  printRaw,
}
