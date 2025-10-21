# Flujo de Devoluciones y Notas de Crédito - MiTienda POS

## Marco Legal (SUNAT - Perú)

### Documentos Tributarios Válidos

1. **Boleta de Venta**: Ventas a consumidor final (DNI)
2. **Factura Electrónica**: Ventas a empresas (RUC)
3. **Nota de Crédito**: Anula/modifica boleta o factura
4. **Nota de Débito**: Incrementa monto de boleta o factura

### Reglas SUNAT para Notas de Crédito

✅ **Se DEBE emitir Nota de Crédito cuando:**
- Devolución total o parcial de productos
- Descuentos posteriores a la emisión
- Anulación de comprobante
- Corrección de errores (precio, cantidad, etc.)

❌ **NO se puede:**
- Eliminar un comprobante ya emitido sin nota de crédito
- Modificar directamente un comprobante electrónico
- Devolver dinero sin respaldo tributario

---

## Flujo Estándar en Retail (Procedimiento Internacional)

### Estados de una Venta

```
┌─────────────┐
│   BORRADOR  │ → Sin comprobante, editable libremente
└─────────────┘
       ↓ (emitir comprobante)
┌─────────────┐
│   EMITIDA   │ → Comprobante electrónico generado
└─────────────┘
       ↓ (devolución total)
┌─────────────┐
│   ANULADA   │ → Con Nota de Crédito
└─────────────┘
       ↓ (devolución parcial)
┌─────────────┐
│ PARCIALMENTE│ → Con Nota de Crédito parcial
│  DEVUELTA   │
└─────────────┘
```

### Casos de Uso Comunes

#### Caso 1: Cliente se arrepiente ANTES de emitir comprobante
**Escenario**: Venta pagada pero sin comprobante emitido
```
Estado: PAGADO (sin comprobante)
Acción:
  - Cancelar venta libremente
  - Devolver dinero
  - NO requiere nota de crédito
```

#### Caso 2: Cliente se arrepiente DESPUÉS de emitir comprobante
**Escenario**: Venta con boleta/factura ya emitida
```
Estado: EMITIDA
Acción:
  1. Generar Nota de Crédito (anula comprobante)
  2. Registrar devolución de productos al stock
  3. Devolver dinero al cliente
  4. Venta queda en estado ANULADA
```

#### Caso 3: Devolución parcial de productos
**Escenario**: Cliente devuelve 2 de 5 productos
```
Estado: EMITIDA
Acción:
  1. Generar Nota de Crédito PARCIAL (por monto de 2 productos)
  2. Devolver 2 productos al stock
  3. Devolver dinero proporcional
  4. Venta queda en estado PARCIALMENTE_DEVUELTA
  5. Comprobante original sigue válido por saldo
```

#### Caso 4: Pago incorrecto detectado después de emisión
**Escenario**: Se cobró S/ 100 pero eran S/ 90
```
Estado: EMITIDA
Acción:
  1. Generar Nota de Crédito por S/ 10
  2. Devolver S/ 10 al cliente
  3. Comprobante original sigue válido por S/ 90
```

---

## Cómo lo Manejan Otros Sistemas POS

### Sistema A: POS Retail Grande (Ej: Saga Falabella, Ripley)

**Flujo de Devolución:**
1. Cajero escanea código de barras del comprobante original
2. Sistema carga la venta original
3. Cajero selecciona productos a devolver
4. Sistema genera automáticamente:
   - Nota de Crédito (vinculada al comprobante original)
   - Devolución de stock
   - Vale de devolución (efectivo o saldo a favor)
5. Requiere autorización de supervisor con PIN

**Estados que manejan:**
- `DRAFT`: Venta en proceso
- `COMPLETED`: Venta finalizada, sin comprobante
- `INVOICED`: Con comprobante emitido
- `PARTIALLY_RETURNED`: Devolución parcial
- `RETURNED`: Devolución total
- `CANCELLED`: Cancelada antes de emitir

### Sistema B: POS Restaurantes (Ej: Rappi, Uber Eats)

**Flujo de Cancelación:**
1. Pedido puede cancelarse hasta que está "preparado"
2. Una vez preparado, requiere autorización gerente
3. Si ya se emitió comprobante → Nota de crédito automática
4. Reembolso según método de pago original

### Sistema C: Farmacias (Ej: Inkafarma, MiFarma)

**Flujo Estricto:**
1. Venta SIN receta → puede devolverse en 24h con comprobante
2. Venta CON receta → NO admite devolución (regulación)
3. Nota de crédito requiere:
   - Producto en empaque original
   - Comprobante original
   - Autorización de supervisor
   - Registro en libro de devoluciones

---

## Propuesta para MiTienda POS

### Estados del Carrito (ACTUALIZADO)

```
┌─────────────┐
│   ABIERTO   │ → Sin pagos, editable
└─────────────┘
       ↓
┌─────────────┐
│  BLOQUEADO  │ → Con pagos parciales
└─────────────┘
       ↓
┌─────────────┐
│   PAGADO    │ → Pago completo, sin comprobante
└─────────────┘
       ↓ (emitir comprobante)
┌─────────────┐
│   EMITIDA   │ → Con boleta/factura electrónica
└─────────────┘
       ↓ (devolución)
┌─────────────┐
│   ANULADA   │ → Con nota de crédito total
└─────────────┘
```

### Nuevas Reglas

| Estado | Quitar productos | Quitar pagos | Cancelar venta |
|--------|------------------|--------------|----------------|
| ABIERTO | ✅ Libre | ❌ No hay | ✅ Libre |
| BLOQUEADO | 🔐 Supervisor | 🔐 Supervisor | 🔐 Supervisor |
| PAGADO | 🔐 Supervisor | 🔐 Supervisor | 🔐 Supervisor |
| **EMITIDA** | ❌ Nota de Crédito | ❌ Nota de Crédito | ✅ Nota de Crédito Total |
| ANULADA | ❌ Bloqueado | ❌ Bloqueado | ❌ Ya anulada |

### Flujo de Devolución en MiTienda

#### Opción 1: Devolución Total (Más Simple - MVP)

```javascript
// Venta EMITIDA
{
  venta_id: 12345,
  status: 'EMITIDA',
  total: 150.00,
  comprobante: {
    tipo: 'BOLETA',
    serie: 'B001',
    numero: '00012345'
  }
}

// Acción: ANULAR VENTA
async function anularVenta(ventaId, supervisorAuth) {
  // 1. Validar que venta existe y está EMITIDA
  const venta = await ventasApi.getById(ventaId);
  if (venta.status !== 'EMITIDA') {
    throw new Error('Solo se pueden anular ventas con comprobante emitido');
  }

  // 2. Generar Nota de Crédito en SUNAT
  const notaCredito = await sunatApi.emitirNotaCredito({
    comprobante_referencia: {
      tipo: venta.comprobante.tipo,
      serie: venta.comprobante.serie,
      numero: venta.comprobante.numero
    },
    motivo: '01', // Anulación de operación
    descripcion: 'Devolución total de productos',
    total: venta.total
  });

  // 3. Devolver productos al stock
  for (const item of venta.items) {
    await inventarioApi.incrementarStock(item.producto_id, item.cantidad);
  }

  // 4. Registrar devolución de dinero
  await cajaTurnoApi.registrarDevolucion({
    turno_id: getCurrentTurnoId(),
    venta_id: ventaId,
    monto: venta.total,
    metodo: venta.metodo_pago_original // Devolver por mismo método
  });

  // 5. Actualizar estado de venta
  await ventasApi.update(ventaId, {
    status: 'ANULADA',
    nota_credito_id: notaCredito.id,
    anulada_por: supervisorAuth.employeeId,
    fecha_anulacion: new Date()
  });

  return {
    success: true,
    notaCredito
  };
}
```

#### Opción 2: Devolución Parcial (Completo)

```javascript
async function devolverProductos(ventaId, productosDevueltos, supervisorAuth) {
  const venta = await ventasApi.getById(ventaId);

  // Calcular monto a devolver
  const montoDevolucion = productosDevueltos.reduce((sum, p) => {
    return sum + (p.precio * p.cantidad);
  }, 0);

  // Generar Nota de Crédito PARCIAL
  const notaCredito = await sunatApi.emitirNotaCredito({
    comprobante_referencia: {
      tipo: venta.comprobante.tipo,
      serie: venta.comprobante.serie,
      numero: venta.comprobante.numero
    },
    motivo: '07', // Devolución parcial
    items: productosDevueltos,
    total: montoDevolucion
  });

  // Devolver stock
  for (const item of productosDevueltos) {
    await inventarioApi.incrementarStock(item.producto_id, item.cantidad);
  }

  // Devolver dinero
  await cajaTurnoApi.registrarDevolucion({
    turno_id: getCurrentTurnoId(),
    venta_id: ventaId,
    monto: montoDevolucion
  });

  // Actualizar venta
  await ventasApi.update(ventaId, {
    status: 'PARCIALMENTE_DEVUELTA',
    notas_credito: [...venta.notas_credito, notaCredito.id]
  });

  return { success: true, notaCredito };
}
```

---

## Método de Pago: Nota de Crédito

**Caso de uso**: Cliente tiene una nota de crédito previa y quiere usarla para pagar una nueva compra.

### Tabla de Base de Datos

```sql
CREATE TABLE notas_credito (
    nota_credito_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT UNSIGNED NOT NULL,

    -- Comprobante original que se está anulando/modificando
    venta_original_id BIGINT UNSIGNED NOT NULL,
    comprobante_tipo VARCHAR(20) NOT NULL COMMENT 'BOLETA, FACTURA',
    comprobante_serie VARCHAR(10) NOT NULL,
    comprobante_numero VARCHAR(20) NOT NULL,

    -- Datos de la Nota de Crédito
    nota_serie VARCHAR(10) NOT NULL,
    nota_numero VARCHAR(20) NOT NULL,
    nota_tipo ENUM('TOTAL', 'PARCIAL') DEFAULT 'TOTAL',
    nota_motivo VARCHAR(2) NOT NULL COMMENT 'Código SUNAT: 01=Anulación, 07=Devolución, etc.',
    nota_descripcion TEXT,

    -- Montos
    nota_subtotal DECIMAL(10,2) NOT NULL,
    nota_igv DECIMAL(10,2) NOT NULL,
    nota_total DECIMAL(10,2) NOT NULL,

    -- Saldo disponible (puede usarse en compras futuras)
    saldo_disponible DECIMAL(10,2) NOT NULL,
    saldo_usado DECIMAL(10,2) DEFAULT 0,

    -- Estado
    estado ENUM('ACTIVA', 'USADA', 'EXPIRADA', 'ANULADA') DEFAULT 'ACTIVA',
    fecha_emision DATETIME NOT NULL,
    fecha_expiracion DATE NULL COMMENT 'Opcional: 30 días, 90 días, etc.',

    -- Cliente
    cliente_id INT UNSIGNED NOT NULL,
    cliente_documento VARCHAR(20),
    cliente_nombre VARCHAR(255),

    -- Auditoría
    emitida_por INT UNSIGNED NOT NULL COMMENT 'ID del empleado',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- SUNAT
    sunat_cdr TEXT COMMENT 'Constancia de Recepción',
    sunat_hash VARCHAR(100),

    INDEX idx_tienda_id (tienda_id),
    INDEX idx_venta_original (venta_original_id),
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_saldo (saldo_disponible),

    FOREIGN KEY (venta_original_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla de Uso de Notas de Crédito

```sql
CREATE TABLE notas_credito_uso (
    uso_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nota_credito_id BIGINT UNSIGNED NOT NULL,
    venta_id BIGINT UNSIGNED NOT NULL COMMENT 'Venta donde se usó',
    monto_usado DECIMAL(10,2) NOT NULL,
    fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_nota_credito (nota_credito_id),
    INDEX idx_venta (venta_id),

    FOREIGN KEY (nota_credito_id) REFERENCES notas_credito(nota_credito_id) ON DELETE RESTRICT,
    FOREIGN KEY (venta_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Usar Nota de Crédito como Pago

```javascript
// En PaymentModal.vue
const paymentMethods = [
  { id: 'efectivo', name: 'Efectivo', icon: '💵' },
  { id: 'tarjeta', name: 'Tarjeta', icon: '💳' },
  { id: 'yape', name: 'Yape', icon: '📱' },
  { id: 'plin', name: 'Plin', icon: '📱' },
  { id: 'nota_credito', name: 'Nota de Crédito', icon: '📄' } // NUEVO
];

// Al seleccionar "Nota de Crédito"
async function useNotaCredito() {
  // 1. Buscar notas de crédito del cliente
  const notasDisponibles = await notasCreditoApi.buscarPorCliente(
    selectedCustomer.value.id
  );

  // 2. Mostrar modal de selección
  showNotasCreditoModal.value = true;
  notasCreditoDisponibles.value = notasDisponibles;
}

// 3. Cliente selecciona nota de crédito
function seleccionarNotaCredito(nota) {
  const montoAUsar = Math.min(nota.saldo_disponible, remainingAmount.value);

  // Agregar como pago
  cartStore.addPayment({
    method: 'nota_credito',
    methodName: `Nota de Crédito ${nota.nota_serie}-${nota.nota_numero}`,
    amount: montoAUsar,
    reference: nota.nota_credito_id,
    metadata: {
      nota_credito_id: nota.nota_credito_id,
      saldo_antes: nota.saldo_disponible,
      saldo_despues: nota.saldo_disponible - montoAUsar
    }
  });
}
```

---

## Interfaz de Usuario - Flujo de Devolución

### Botón "Devoluciones" en Menú

```vue
<!-- Menu.vue -->
<router-link to="/devoluciones">
  <div class="card">
    <svg><!-- Icono de devolución --></svg>
    <h3>Devoluciones</h3>
    <p>Procesar devoluciones y notas de crédito</p>
  </div>
</router-link>
```

### Vista de Devoluciones

```vue
<!-- views/Devoluciones.vue -->
<template>
  <div class="container">
    <h1>Procesar Devolución</h1>

    <!-- Paso 1: Buscar venta original -->
    <div v-if="step === 1">
      <h2>Buscar venta a devolver</h2>
      <input
        v-model="searchQuery"
        placeholder="Escanear código de barras del comprobante o buscar por N°"
      />
      <!-- Lista de ventas encontradas -->
    </div>

    <!-- Paso 2: Seleccionar productos a devolver -->
    <div v-if="step === 2">
      <h2>Seleccionar productos a devolver</h2>
      <div v-for="item in ventaOriginal.items" :key="item.id">
        <input
          type="checkbox"
          v-model="item.devolver"
        />
        <span>{{ item.nombre }}</span>
        <input
          v-if="item.devolver"
          type="number"
          v-model="item.cantidadDevolver"
          :max="item.cantidad"
        />
      </div>
    </div>

    <!-- Paso 3: Confirmar y autorizar -->
    <div v-if="step === 3">
      <h2>Resumen de devolución</h2>
      <p>Monto a devolver: {{ formatCurrency(montoDevolucion) }}</p>
      <p>Método de devolución:</p>
      <select v-model="metodoDevolucion">
        <option value="efectivo">Efectivo</option>
        <option value="nota_credito">Generar Nota de Crédito</option>
        <option value="mismo_metodo">Mismo método de pago original</option>
      </select>

      <button @click="procesarDevolucion">
        Procesar Devolución (Requiere PIN Supervisor)
      </button>
    </div>
  </div>
</template>
```

---

## Motivos de Nota de Crédito (SUNAT)

| Código | Descripción |
|--------|-------------|
| 01 | Anulación de la operación |
| 02 | Anulación por error en el RUC |
| 03 | Corrección por error en la descripción |
| 04 | Descuento global |
| 05 | Descuento por ítem |
| 06 | Devolución total |
| 07 | Devolución por ítem |
| 08 | Bonificación |
| 09 | Disminución en el valor |
| 13 | Ajustes de operaciones de exportación |

---

## Recomendación Final

### Para MVP (Fase 1):

✅ **Implementar ahora:**
1. Estado `EMITIDA` en ventas
2. Anulación total con Nota de Crédito
3. PIN supervisor para anulaciones
4. Tabla `notas_credito`
5. Método de pago "Nota de Crédito"

❌ **Postponer para Fase 2:**
1. Devoluciones parciales (más complejo)
2. Múltiples notas de crédito por venta
3. Tracking de saldo de notas de crédito
4. Expiración automática de notas

### Actualización de Estados del Carrito

```javascript
// cart.js - ACTUALIZADO
state: () => ({
  status: 'ABIERTO', // ABIERTO, BLOQUEADO, PAGADO, EMITIDA, ANULADA
  comprobanteEmitido: null, // Datos del comprobante si fue emitido
  notasCreditoAplicadas: [] // Notas de crédito usadas en esta venta
})

// Nuevo action
async emitirComprobante(tipoComprobante) {
  if (this.status !== 'PAGADO') {
    throw new Error('La venta debe estar pagada');
  }

  // Llamar a API de facturación electrónica
  const comprobante = await facturacionApi.emitir({
    tipo: tipoComprobante, // 'BOLETA' o 'FACTURA'
    items: this.items,
    pagos: this.payments,
    cliente: this.customer
  });

  this.comprobanteEmitido = comprobante;
  this.status = 'EMITIDA';

  return comprobante;
}

// Nuevo action
async anularVenta(supervisorAuth, motivo) {
  if (this.status !== 'EMITIDA') {
    throw new Error('Solo se pueden anular ventas con comprobante emitido');
  }

  // Generar nota de crédito
  const notaCredito = await notasCreditoApi.emitir({
    ventaOriginalId: this.currentSaleId,
    comprobanteReferencia: this.comprobanteEmitido,
    motivo,
    total: this.total,
    supervisorAuth
  });

  this.status = 'ANULADA';

  return notaCredito;
}
```

---

## Siguiente Paso

¿Quieres que implemente:

**Opción A**: Estados del carrito SIN notas de crédito primero (más rápido)
**Opción B**: Estados completos CON soporte de notas de crédito (más completo)
**Opción C**: Solo documentar y continuar con estados básicos del carrito

Tu decides según la prioridad y tiempo disponible.
