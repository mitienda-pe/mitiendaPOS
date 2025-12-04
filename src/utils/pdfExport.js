/**
 * PDF Export Utility
 * Provides functions to export shift reports to PDF files
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export shift report to PDF
 * @param {Object} shift - Shift data
 * @param {Array} movements - Array of movements
 * @param {Object} cashier - Optional cashier data from store
 */
export const exportShiftReportToPdf = (shift, movements, cashier = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Construir información del cajero
  let cajeroInfo = 'N/A';
  if (cashier && cashier.empleado_nombres && cashier.empleado_apellidos) {
    cajeroInfo = `${cashier.empleado_nombres} ${cashier.empleado_apellidos}`;
    if (cashier.netsuite_id || cashier.empleado_netsuite_id) {
      cajeroInfo += ` (NS: ${cashier.netsuite_id || cashier.empleado_netsuite_id})`;
    }
  } else if (shift.empleado_nombres && shift.empleado_apellidos) {
    cajeroInfo = `${shift.empleado_nombres} ${shift.empleado_apellidos}`;
    if (shift.empleado_netsuite_id) {
      cajeroInfo += ` (NS: ${shift.empleado_netsuite_id})`;
    }
  } else if (shift.usuario_email) {
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

  // === HEADER ===
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('REPORTE DE TURNO', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Turno #${shift.id}`, pageWidth / 2, 25, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, 32, { align: 'center' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // === INFORMACIÓN GENERAL ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Información General', 14, yPosition);
  yPosition += 8;

  const infoData = [
    ['Sucursal', sucursalInfo],
    ['Caja', shift.caja_numero || 'N/A'],
    ['Cajero', cajeroInfo],
    ['Estado', shift.estado === 'abierto' ? 'Abierto' : 'Cerrado'],
    ['Apertura', new Date(shift.fecha_apertura).toLocaleString('es-PE')],
    ['Cierre', shift.fecha_cierre ? new Date(shift.fecha_cierre).toLocaleString('es-PE') : 'N/A']
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Campo', 'Valor']],
    body: infoData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 12;

  // === RESUMEN FINANCIERO ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Resumen Financiero', 14, yPosition);
  yPosition += 8;

  const financialData = [
    ['Monto Inicial', `S/ ${shift.monto_inicial.toFixed(2)}`],
    ['Total Ventas', `S/ ${shift.total_ventas.toFixed(2)}`],
    ['Número de Ventas', `${shift.numero_ventas || 0} operaciones`]
  ];

  if (shift.estado === 'cerrado') {
    financialData.push(
      ['Monto Esperado', `S/ ${shift.monto_esperado.toFixed(2)}`],
      ['Monto Real', `S/ ${shift.monto_real.toFixed(2)}`],
      ['Diferencia', `S/ ${shift.diferencia.toFixed(2)}`]
    );
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Concepto', 'Monto']],
    body: financialData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 12;

  // === DESGLOSE POR MÉTODO DE PAGO ===
  if (shift.estado === 'cerrado') {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Desglose por Método de Pago', 14, yPosition);
    yPosition += 8;

    const paymentMethodsData = [];

    if (shift.total_efectivo > 0) {
      paymentMethodsData.push(['Efectivo', `S/ ${shift.total_efectivo.toFixed(2)}`]);
    }
    if (shift.total_tarjeta > 0) {
      paymentMethodsData.push(['Tarjeta', `S/ ${shift.total_tarjeta.toFixed(2)}`]);
    }
    if (shift.total_yape > 0) {
      paymentMethodsData.push(['Yape', `S/ ${shift.total_yape.toFixed(2)}`]);
    }
    if (shift.total_plin > 0) {
      paymentMethodsData.push(['Plin', `S/ ${shift.total_plin.toFixed(2)}`]);
    }
    if (shift.total_transferencia > 0) {
      paymentMethodsData.push(['Transferencia', `S/ ${shift.total_transferencia.toFixed(2)}`]);
    }

    if (paymentMethodsData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Método de Pago', 'Total']],
        body: paymentMethodsData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    }
  }

  // === MOVIMIENTOS ===
  if (movements && movements.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Movimientos del Turno', 14, yPosition);
    yPosition += 8;

    const movementsData = movements.map(movement => {
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

      return [
        time,
        tipo,
        movement.concepto || '',
        movement.metodo_pago || '-',
        amount
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Hora', 'Tipo', 'Concepto', 'Método', 'Monto']],
      body: movementsData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  }

  // === NOTAS ===
  if (shift.notas_apertura || shift.notas_cierre) {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Notas', 14, yPosition);
    yPosition += 8;

    const notesData = [];

    if (shift.notas_apertura) {
      notesData.push(['Apertura', shift.notas_apertura]);
    }

    if (shift.notas_cierre) {
      notesData.push(['Cierre', shift.notas_cierre]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Tipo', 'Nota']],
      body: notesData,
      theme: 'plain',
      headStyles: { fillColor: [107, 114, 128], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // === FOOTER ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // === SAVE ===
  const filename = `turno_${shift.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export default {
  exportShiftReportToPdf
};
