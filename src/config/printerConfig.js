/**
 * Configuración de impresora térmica
 */

export const PRINTER_CONFIG = {
  // Ancho de papel en caracteres (80mm = 48 chars, 58mm = 32 chars)
  paperWidth: 48,

  // Codificación de caracteres para soporte español (ñ, á, é, etc.)
  encoding: 'cp858',

  // Corte automático después de imprimir
  autoCut: true,

  // Abrir cajón de dinero al imprimir
  openCashDrawer: false,

  // Líneas en blanco antes del corte
  feedLinesBeforeCut: 4,
}

// Keys de localStorage
export const STORAGE_KEYS = {
  selectedPrinter: 'pos_thermal_printer_name',
  thermalEnabled: 'pos_thermal_printer_enabled',
}
