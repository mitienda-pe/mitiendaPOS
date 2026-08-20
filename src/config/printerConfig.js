/**
 * Configuración de impresora térmica
 */

export const PRINTER_CONFIG = {
  // Codificación de caracteres para soporte español (ñ, á, é, etc.)
  encoding: 'cp858',

  // Corte automático después de imprimir
  autoCut: true,

  // Abrir cajón de dinero al imprimir
  openCashDrawer: false,

  // Líneas en blanco antes del corte
  feedLinesBeforeCut: 4,
}

/**
 * Anchos de rollo soportados.
 * `columns` es el ancho en caracteres del ESC/POS; `mm` es el que va al CSS del
 * ticket HTML cuando se imprime por el navegador. Los dos tienen que moverse
 * juntos o el ticket sale cortado por un lado y bien por el otro.
 */
export const PAPER_FORMATS = {
  58: { id: '58', label: '58 mm', mm: 58, columns: 32 },
  80: { id: '80', label: '80 mm', mm: 80, columns: 48 },
}

export const DEFAULT_PAPER_FORMAT = '80'

// Keys de localStorage
export const STORAGE_KEYS = {
  selectedPrinter: 'pos_thermal_printer_name',
  thermalEnabled: 'pos_thermal_printer_enabled',
  // RawBT (Android): driver alterno a QZ Tray, con su propio interruptor porque
  // en una tablet QZ Tray no existe y su estado "Desconectado" no aplica.
  rawbtEnabled: 'pos_rawbt_enabled',
  paperWidth: 'pos_thermal_paper_width',
}

/**
 * Ancho de rollo configurado. Se lee en cada impresión —no se cachea— para que
 * cambiarlo en Configuración surta efecto sin recargar el POS.
 * @returns {{id: string, label: string, mm: number, columns: number}}
 */
export function getPaperFormat() {
  let saved = null
  try {
    saved = localStorage.getItem(STORAGE_KEYS.paperWidth)
  } catch {
    // localStorage bloqueado (modo privado): usamos el default.
  }
  return PAPER_FORMATS[saved] || PAPER_FORMATS[DEFAULT_PAPER_FORMAT]
}
