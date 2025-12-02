/**
 * Utilidades de formateo para el POS
 */

/**
 * Formatear moneda (Soles peruanos)
 * Soporta hasta 8 decimales para máxima precisión en cálculos de IGV
 *
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado con símbolo de moneda
 */
export function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'S/ 0.00'
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8 // Permite hasta 8 decimales para máxima precisión
  }).format(amount)
}

/**
 * Formatear número con separadores de miles
 *
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export function formatNumber(num) {
  if (isNaN(num) || num === null || num === undefined) {
    return '0'
  }

  return new Intl.NumberFormat('es-PE').format(num)
}

/**
 * Formatear fecha (DD/MM/YYYY)
 *
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatDate(date) {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsedDate)
}

/**
 * Formatear fecha y hora (DD/MM/YYYY HH:mm)
 *
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
export function formatDateTime(date) {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(parsedDate)
}
