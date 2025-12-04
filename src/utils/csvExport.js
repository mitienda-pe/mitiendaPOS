/**
 * CSV Export Utility
 * Provides functions to export data to CSV files
 */

/**
 * Convert JSON data to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Array of column definitions {key, label}
 * @returns {string} CSV formatted string
 */
export const jsonToCsv = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.label).join(',');

  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle numbers with formatting
      if (typeof value === 'number' && col.format === 'currency') {
        value = value.toFixed(2);
      }

      // Handle dates
      if (col.format === 'date' && value) {
        value = new Date(value).toLocaleString('es-PE');
      }

      // Handle time
      if (col.format === 'time' && value) {
        value = new Date(value).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Escape commas and quotes in string values
      value = String(value);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCsv = (csvContent, filename) => {
  // Add BOM for proper Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export shift report to CSV
 * @param {Object} shift - Shift data
 * @param {Array} movements - Array of movements
 * @param {Object} cashier - Optional cashier data from store
 */
export const exportShiftReportToCsv = (shift, movements, cashier = null) => {
  const filename = `turno_${shift.id}_${new Date().toISOString().split('T')[0]}.csv`;

  // Construir información del cajero con todos los campos disponibles
  let cajeroInfo = 'N/A';

  // Prioridad 1: Datos del cajero pasados explícitamente (desde el store)
  if (cashier && cashier.empleado_nombres && cashier.empleado_apellidos) {
    cajeroInfo = `Cajero: ${cashier.empleado_nombres} ${cashier.empleado_apellidos}`;
    if (cashier.netsuite_id) {
      cajeroInfo += ` - ID NetSuite: ${cashier.netsuite_id}`;
    } else if (cashier.empleado_netsuite_id) {
      cajeroInfo += ` - ID NetSuite: ${cashier.empleado_netsuite_id}`;
    }
  }
  // Prioridad 2: Datos del empleado en el objeto shift (desde backend)
  else if (shift.empleado_nombres && shift.empleado_apellidos) {
    cajeroInfo = `Cajero: ${shift.empleado_nombres} ${shift.empleado_apellidos}`;
    if (shift.empleado_netsuite_id) {
      cajeroInfo += ` - ID NetSuite: ${shift.empleado_netsuite_id}`;
    }
  }
  // Prioridad 3: Email del usuario (fallback)
  else if (shift.usuario_email) {
    cajeroInfo = shift.usuario_email;
  }

  // Construir información de la sucursal
  let sucursalInfo = 'N/A';

  // Prioridad 1: Datos del cashier store (si está disponible)
  if (cashier?.sucursal?.nombre) {
    sucursalInfo = cashier.sucursal.nombre;
  } else if (cashier?.sucursal?.tiendadireccion_nombresucursal) {
    sucursalInfo = cashier.sucursal.tiendadireccion_nombresucursal;
  }
  // Prioridad 2: Datos del shift desde el backend
  else if (shift.tiendadireccion_nombresucursal) {
    sucursalInfo = shift.tiendadireccion_nombresucursal;
  } else if (shift.sucursal_nombre) {
    sucursalInfo = shift.sucursal_nombre;
  } else if (shift.tienda_nombre) {
    sucursalInfo = shift.tienda_nombre;
  }

  // Create shift summary section
  const summaryData = [
    ['RESUMEN DEL TURNO'],
    [''],
    ['Sucursal', sucursalInfo],
    ['Caja', shift.caja_numero || 'N/A'],
    ['Estado', shift.estado === 'abierto' ? 'Abierto' : 'Cerrado'],
    ['Fecha Apertura', new Date(shift.fecha_apertura).toLocaleString('es-PE')],
    ['Fecha Cierre', shift.fecha_cierre ? new Date(shift.fecha_cierre).toLocaleString('es-PE') : 'N/A'],
    ['Usuario', cajeroInfo],
    [''],
    ['RESUMEN FINANCIERO'],
    [''],
    ['Monto Inicial', `S/ ${shift.monto_inicial.toFixed(2)}`],
    ['Total Ventas', `S/ ${shift.total_ventas.toFixed(2)}`],
    ['Número de Ventas', shift.numero_ventas || 0],
  ];

  // Add scorecards section (available for both open and closed shifts)
  summaryData.push(
    [''],
    ['SCORECARDS'],
    [''],
    ['💵 Pagos Efectivo', `S/ ${(shift.total_efectivo || 0).toFixed(2)}`],
    ['💳 Pagos con Tarjeta', `S/ ${(shift.total_tarjeta || 0).toFixed(2)}`],
    ['🎯 Esperado en Caja', `S/ ${((shift.monto_inicial || 0) + (shift.total_efectivo || 0)).toFixed(2)}`]
  );

  // Add closed shift data
  if (shift.estado === 'cerrado') {
    summaryData.push(
      [''],
      ['CIERRE DE TURNO'],
      [''],
      ['Monto Esperado', `S/ ${shift.monto_esperado.toFixed(2)}`],
      ['Monto Real', `S/ ${shift.monto_real.toFixed(2)}`],
      ['Diferencia', `S/ ${shift.diferencia.toFixed(2)}`],
      [''],
      ['DESGLOSE POR MÉTODO DE PAGO'],
      [''],
      ['Efectivo', `S/ ${(shift.total_efectivo || 0).toFixed(2)}`],
      ['Tarjeta', `S/ ${(shift.total_tarjeta || 0).toFixed(2)}`],
      ['Yape', `S/ ${(shift.total_yape || 0).toFixed(2)}`],
      ['Plin', `S/ ${(shift.total_plin || 0).toFixed(2)}`],
      ['Transferencia', `S/ ${(shift.total_transferencia || 0).toFixed(2)}`]
    );
  }

  // Add movements section
  summaryData.push(
    [''],
    [''],
    ['MOVIMIENTOS DEL TURNO'],
    [''],
    ['Hora', 'Tipo', 'Concepto', 'Método de Pago', 'Monto']
  );

  // Format movements
  movements.forEach(movement => {
    const time = new Date(movement.fecha_registro).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const tipo = {
      'venta': 'Venta',
      'entrada': 'Ingreso',
      'salida': 'Retiro',
      'ajuste': 'Ajuste'
    }[movement.tipo] || movement.tipo;

    const sign = (movement.tipo === 'entrada' || movement.tipo === 'venta') ? '+' :
                 (movement.tipo === 'salida' ? '-' : '');

    const amount = `${sign}S/ ${parseFloat(movement.monto).toFixed(2)}`;

    summaryData.push([
      time,
      tipo,
      movement.concepto || '',
      movement.metodo_pago || '-',
      amount
    ]);
  });

  // Add notes if available
  if (shift.notas_apertura || shift.notas_cierre) {
    summaryData.push(
      [''],
      [''],
      ['NOTAS']
    );

    if (shift.notas_apertura) {
      summaryData.push(
        [''],
        ['Notas de Apertura', shift.notas_apertura]
      );
    }

    if (shift.notas_cierre) {
      summaryData.push(
        [''],
        ['Notas de Cierre', shift.notas_cierre]
      );
    }
  }

  // Convert to CSV format
  const csvContent = summaryData.map(row =>
    row.map(cell => {
      const value = String(cell || '');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  ).join('\n');

  downloadCsv(csvContent, filename);
};

export default {
  jsonToCsv,
  downloadCsv,
  exportShiftReportToCsv
};
