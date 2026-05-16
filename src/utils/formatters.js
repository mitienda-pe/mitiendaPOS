/**
 * Utilidades de formateo para el POS
 */

// Config de moneda y locale a nivel módulo. Se inicializa con defaults PE y se
// actualiza al login del cajero (cuando ya conocemos la tienda) mediante
// `setCurrencyConfig()`. Mantener un single-source aquí permite que las miles
// de llamadas `formatCurrency(price)` distribuidas no necesiten conocer la
// config — algo crítico en POS donde cada milisegundo de UX importa.
const currencyConfig = {
  locale: 'es-PE',
  currency: 'PEN',
  symbol: 'S/',
  decimals: 2,
}

/**
 * Setea la config de moneda/locale global para todos los formatters.
 * Llamar después del login del cajero pasando el countryConfig de la tienda.
 *
 * @param {{ locale?: string, currency?: string, symbol?: string, decimals?: number }} config
 */
export function setCurrencyConfig(config) {
  if (config.locale) currencyConfig.locale = config.locale
  if (config.currency) currencyConfig.currency = config.currency
  if (config.symbol) currencyConfig.symbol = config.symbol
  if (typeof config.decimals === 'number') currencyConfig.decimals = config.decimals
}

/**
 * Formatear moneda. Por default usa la config global (Soles PE).
 *
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado con símbolo de moneda
 */
export function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currencyConfig.symbol} 0.${'0'.repeat(currencyConfig.decimals)}`
  }

  return new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.currency,
    minimumFractionDigits: currencyConfig.decimals,
    maximumFractionDigits: currencyConfig.decimals + 1
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

  return new Intl.NumberFormat(currencyConfig.locale).format(num)
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
