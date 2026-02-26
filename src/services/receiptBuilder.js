/**
 * Receipt Builder
 * Builds ESC/POS byte commands for thermal receipt printing using receipt-printer-encoder.
 * Mirrors the HTML ticket layout from PaymentModal.vue printTicketDirect().
 */

import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder'
import { COMPANY_CONFIG } from '@/config/companyConfig'
import { PRINTER_CONFIG } from '@/config/printerConfig'

/**
 * Build a complete receipt from order data.
 * @param {Object} orderData - The order data object
 * @param {Object} orderData.companyInfo - Company info (defaults to COMPANY_CONFIG)
 * @param {string} orderData.storeName - Store/branch name
 * @param {string} orderData.storeAddress - Store address
 * @param {string} orderData.storePhone - Store phone
 * @param {string|number} orderData.orderNumber - Order number
 * @param {Object} orderData.billingDoc - Billing document { serie, correlative, files }
 * @param {Array} orderData.items - Line items array
 * @param {Array} orderData.payments - Payments array
 * @param {Object} orderData.customer - Customer { name, document_number }
 * @param {number} orderData.subtotal - Subtotal (base gravada)
 * @param {number} orderData.tax - IGV amount
 * @param {number} orderData.total - Total amount
 * @param {number} orderData.roundingAmount - Rounding adjustment
 * @param {number} orderData.totalAfterRounding - Final total after rounding
 * @param {string} orderData.cajero - Cashier name
 * @param {string} orderData.createdAt - Date string
 * @returns {Uint8Array} ESC/POS byte commands
 */
export function buildReceipt(orderData) {
  const encoder = new ReceiptPrinterEncoder({
    language: 'esc-pos',
    columns: PRINTER_CONFIG.paperWidth,
    feedBeforeCut: PRINTER_CONFIG.feedLinesBeforeCut,
  })

  const company = orderData.companyInfo || COMPANY_CONFIG
  const W = PRINTER_CONFIG.paperWidth

  encoder.initialize()

  // --- Header: Company Info ---
  encoder
    .align('center')
    .bold(true)
    .line(company.legalName || 'TICKET DE VENTA')
    .bold(false)

  if (orderData.storeAddress) {
    encoder.line(orderData.storeAddress)
  }
  if (company.ruc) {
    encoder.line(`RUC: ${company.ruc}`)
  }
  if (orderData.storeName) {
    encoder.line(`TIENDA ${orderData.storeName.toUpperCase()}`)
  }
  if (orderData.storePhone) {
    encoder.line(`TLF.: ${orderData.storePhone}`)
  }

  encoder.line(repeat('-', W))

  // --- Document Type ---
  const billingDoc = orderData.billingDoc
  if (billingDoc?.serie) {
    const serie = String(billingDoc.serie).toUpperCase()
    let docType = 'COMPROBANTE ELECTRONICO'
    if (serie.startsWith('F')) docType = 'FACTURA ELECTRONICA'
    else if (serie.startsWith('B')) docType = 'BOLETA ELECTRONICA'

    encoder
      .bold(true)
      .line(docType)
      .line(`${billingDoc.serie}-${billingDoc.correlative}`)
      .bold(false)
  } else {
    encoder.bold(true).line(`Nro: ${orderData.orderNumber}`).bold(false)
  }

  encoder.line(repeat('-', W))

  // --- General Info ---
  encoder.align('left')
  encoder.line(`Fecha: ${formatDate(orderData.createdAt)}`)
  encoder.line(`Cliente: ${orderData.customer?.name || 'Cliente General'}`)
  if (orderData.customer?.document_number) {
    encoder.line(`Doc: ${orderData.customer.document_number}`)
  }

  encoder.line(repeat('-', W))

  // --- Products ---
  encoder.bold(true).line('PRODUCTOS').bold(false)
  encoder.line(repeat('-', W))

  const items = orderData.items || []
  for (const item of items) {
    const name = item.nombre || item.name || item.tittle || item.product_name || 'Producto'
    const price = parseFloat(item.precio || item.price || item.unit_price || 0)
    const quantity = parseFloat(item.quantity || item.cantidad || 1)
    const total =
      item.total !== undefined && item.total !== null
        ? parseFloat(item.total)
        : quantity * price
    const originalPrice = parseFloat(
      item.precio_original || item.original_price || item.precioOriginal || 0
    )
    const hasDiscount = originalPrice > price
    const discountPercent =
      item.discount_percent || item.promocion?.value || item.promotion?.value || null

    // Product name (truncated to fit)
    let nameStr = name
    if (discountPercent) nameStr += ` (-${discountPercent}%)`
    encoder.line(truncate(nameStr, W))

    // Quantity x price → total
    let qtyLine = `  ${quantity} x S/ ${formatPrice(price)}`
    if (hasDiscount) {
      qtyLine = `  ${quantity} x S/ ${formatPrice(price)}`
    }
    const totalStr = `S/ ${total.toFixed(2)}`
    encoder.line(padLine(qtyLine, totalStr, W))
  }

  encoder.line(repeat('-', W))

  // --- Totals ---
  encoder.line(padLine('OPERACIONES GRAVADAS:', `S/ ${num(orderData.subtotal)}`, W))
  encoder.line(padLine('IGV (18%):', `S/ ${num(orderData.tax)}`, W))

  const rounding = parseFloat(orderData.roundingAmount || 0)
  if (rounding !== 0) {
    encoder.line(padLine('Redondeo:', `S/ ${rounding.toFixed(2)}`, W))
  }

  const finalTotal = parseFloat(orderData.totalAfterRounding || orderData.total || 0)
  encoder.newline()
  encoder.bold(true)
  encoder.line(padLine('TOTAL GENERAL S/:', `S/ ${finalTotal.toFixed(2)}`, W))
  encoder.bold(false)

  // --- Payments ---
  const payments = orderData.payments || []
  if (payments.length > 0) {
    encoder.line(repeat('-', W))
    encoder.bold(true).line('PAGOS').bold(false)

    for (const p of payments) {
      const methodName = p.methodName || p.method_name || p.metodo || p.method || 'Pago'
      const amount = parseFloat(p.amount || p.monto || 0)
      encoder.line(padLine(methodName, `S/ ${amount.toFixed(2)}`, W))
    }
  }

  encoder.line(repeat('-', W))

  // --- Footer: SUNAT ---
  encoder.align('center')
  if (company.sunat?.authorizationText) {
    encoder.size('small')
    encoder.line(company.sunat.authorizationText)
  }
  if (company.sunat?.representationText) {
    encoder.size('small')
    encoder.line(company.sunat.representationText)
  }
  encoder.size('normal')

  // --- Website ---
  if (company.website) {
    encoder.newline()
    encoder.line('Para mas productos visita')
    encoder.bold(true).line(company.website).bold(false)
  }

  encoder.newline()
  encoder.bold(true).line('Gracias por su compra!').bold(false)
  encoder.line(formatDate(orderData.createdAt))
  if (orderData.cajero) {
    encoder.line(`Cajero: ${orderData.cajero}`)
  }

  encoder.align('left')

  // --- Cut ---
  if (PRINTER_CONFIG.autoCut) {
    encoder.newline().newline().newline()
    encoder.cut()
  }

  // --- Cash Drawer ---
  if (PRINTER_CONFIG.openCashDrawer) {
    encoder.pulse()
  }

  return encoder.encode()
}

/**
 * Build a simple test receipt
 * @returns {Uint8Array}
 */
export function buildTestReceipt() {
  const encoder = new ReceiptPrinterEncoder({
    language: 'esc-pos',
    columns: PRINTER_CONFIG.paperWidth,
  })

  const W = PRINTER_CONFIG.paperWidth

  encoder.initialize()
  encoder.align('center')
  encoder.bold(true).line('TICKET DE PRUEBA').bold(false)
  encoder.line(repeat('-', W))
  encoder.line(COMPANY_CONFIG.legalName)
  encoder.line(`RUC: ${COMPANY_CONFIG.ruc}`)
  encoder.line(repeat('-', W))
  encoder.line(`Fecha: ${formatDate(new Date().toISOString())}`)
  encoder.line('')
  encoder.line('La impresora termica esta')
  encoder.line('configurada correctamente.')
  encoder.line(repeat('-', W))
  encoder.bold(true).line('FIN DE PRUEBA').bold(false)
  encoder.newline().newline().newline()
  encoder.cut()

  return encoder.encode()
}

// --- Helpers ---

function repeat(char, count) {
  return char.repeat(count)
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str
}

function padLine(left, right, width) {
  const space = width - left.length - right.length
  if (space <= 0) return left + ' ' + right
  return left + ' '.repeat(space) + right
}

function num(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatPrice(p) {
  const n = parseFloat(p) || 0
  const r2 = Math.round(n * 100) / 100
  return Math.abs(n - r2) > 0.001 ? n.toFixed(3) : n.toFixed(2)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default {
  buildReceipt,
  buildTestReceipt,
}
