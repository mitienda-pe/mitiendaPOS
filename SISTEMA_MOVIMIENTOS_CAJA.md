# Sistema de Movimientos de Caja

## 📋 Problema Identificado

Cuando se realiza una venta en efectivo, el turno de caja **NO se actualiza** con el monto de la venta. Al intentar cerrar el turno, solo aparece el monto inicial, sin las ventas realizadas.

### Ejemplo del problema:
```
1. Apertura de turno: S/ 500
2. Venta en efectivo: S/ 100
3. Al cerrar turno muestra:
   - Efectivo esperado: S/ 500 ❌ (debería ser S/ 600)
   - Total ventas: S/ 0 ❌ (debería ser S/ 100)
```

## 🔧 Solución Requerida

### Backend (API)

#### 1. Nueva tabla: `turnocaja_movimientos`

```sql
CREATE TABLE `turnocaja_movimientos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turnocaja_id` INT UNSIGNED NOT NULL,
  `tienda_id` INT UNSIGNED NOT NULL,
  `tipo` ENUM('entrada', 'salida', 'venta', 'ajuste') NOT NULL,
  `metodo_pago` VARCHAR(50) NULL COMMENT 'efectivo, tarjeta, yape, plin, transferencia, qr',
  `monto` DECIMAL(10,2) NOT NULL,
  `concepto` VARCHAR(200) NOT NULL,
  `referencia` VARCHAR(100) NULL COMMENT 'ID de venta, comprobante, etc.',
  `notas` TEXT NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `eliminado` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_turnocaja` (`turnocaja_id`),
  KEY `idx_tienda` (`tienda_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha` (`fecha_registro`),
  CONSTRAINT `fk_movimiento_turno` FOREIGN KEY (`turnocaja_id`)
    REFERENCES `turnocaja` (`turnocaja_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movimiento_tienda` FOREIGN KEY (`tienda_id`)
    REFERENCES `tiendas` (`tienda_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. Tipos de movimientos:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **venta** | Venta registrada (automático) | S/ 100 en efectivo |
| **entrada** | Ingreso manual de dinero | Fondo adicional, devolución |
| **salida** | Retiro de dinero | Para banco, préstamo, gastos |
| **ajuste** | Corrección de diferencias | Faltante detectado, billete falso |

#### 3. Nuevo endpoint: `POST /api/v1/cash-register-shifts/movements`

```json
{
  "turnocaja_id": 45,
  "tipo": "venta",
  "metodo_pago": "efectivo",
  "monto": 150.50,
  "concepto": "Venta POS",
  "referencia": "VENTA-2025-001234",
  "notas": "Cliente: Juan Pérez"
}
```

#### 4. Actualizar endpoint `close` para calcular totales

Cuando se cierre el turno, debe sumar TODOS los movimientos:

```php
// En CashRegisterShift.php - close()

// 1. Obtener el turno
$shift = $model->find($id);

// 2. Calcular totales desde movimientos
$movimientosModel = new TurnoCajaMovimientosModel();
$totales = $movimientosModel->getTotalesPorTurno($id);

// 3. Actualizar campos del turno
$updateData = [
    'turnocaja_monto_real' => $montoReal,
    'turnocaja_fecha_cierre' => date('Y-m-d H:i:s'),
    'turnocaja_estado' => 'cerrado',
    'turnocaja_notas_cierre' => $notasCierre,

    // Totales calculados
    'turnocaja_total_efectivo' => $totales['efectivo'],
    'turnocaja_total_tarjeta' => $totales['tarjeta'],
    'turnocaja_total_yape' => $totales['yape'],
    'turnocaja_total_plin' => $totales['plin'],
    'turnocaja_total_transferencia' => $totales['transferencia'],
    'turnocaja_total_ventas' => $totales['total']
];

// 4. Calcular efectivo esperado
$efectivoEsperado = $shift['turnocaja_monto_inicial'] + $totales['efectivo'];
$diferencia = $montoReal - $efectivoEsperado;

$updateData['turnocaja_monto_esperado'] = $efectivoEsperado;
$updateData['turnocaja_diferencia'] = $diferencia;
```

### Frontend (POS)

#### 1. Modificar `POS.vue` - Registrar venta como movimiento

```javascript
// En handlePaymentCompleted() después de registrar la venta

const handlePaymentCompleted = async () => {
  try {
    // 1. Guardar la venta (ya existe)
    const ventaId = await guardarVenta();

    // 2. Registrar movimientos de caja por cada pago
    for (const payment of cartStore.payments) {
      await shiftsApi.registerMovement({
        tipo: 'venta',
        metodo_pago: payment.method,
        monto: payment.amount,
        concepto: `Venta ${documentType}`,
        referencia: `VENTA-${ventaId}`,
        notas: `Cliente: ${customer?.name || 'Público General'}`
      });
    }

    // 3. Actualizar turno activo en el store
    await shiftStore.fetchActiveShift();

  } catch (error) {
    console.error('Error al completar venta:', error);
  }
};
```

#### 2. Nuevo archivo: `src/services/cashMovementsApi.js`

```javascript
import { apiRequest } from './api';

export const cashMovementsApi = {
  // Registrar movimiento de caja
  async registerMovement(data) {
    return await apiRequest('/cash-register-shifts/movements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Obtener movimientos del turno actual
  async getShiftMovements(shiftId) {
    return await apiRequest(`/cash-register-shifts/${shiftId}/movements`, {
      method: 'GET'
    });
  },

  // Registrar entrada manual
  async registerIncome(monto, concepto, notas = '') {
    return await this.registerMovement({
      tipo: 'entrada',
      metodo_pago: 'efectivo',
      monto,
      concepto,
      notas
    });
  },

  // Registrar salida manual
  async registerWithdrawal(monto, concepto, notas = '') {
    return await this.registerMovement({
      tipo: 'salida',
      metodo_pago: 'efectivo',
      monto,
      concepto,
      notas
    });
  }
};
```

## 📊 Flujo completo

### Apertura de turno
```
1. POST /api/v1/cash-register-shifts/open
   {
     "monto_inicial": 500,
     "caja_numero": "CAJA-01",
     "notas_apertura": "Turno mañana"
   }

2. Backend crea registro en `turnocaja`:
   - turnocaja_id: 45
   - turnocaja_monto_inicial: 500
   - turnocaja_estado: 'abierto'
```

### Durante el turno - Venta 1 (Efectivo S/ 150)
```
1. POS registra venta

2. POST /api/v1/cash-register-shifts/movements
   {
     "turnocaja_id": 45,
     "tipo": "venta",
     "metodo_pago": "efectivo",
     "monto": 150,
     "concepto": "Venta POS",
     "referencia": "VENTA-001"
   }

3. Backend inserta en `turnocaja_movimientos`
```

### Durante el turno - Venta 2 (Tarjeta S/ 200)
```
POST /api/v1/cash-register-shifts/movements
{
  "turnocaja_id": 45,
  "tipo": "venta",
  "metodo_pago": "tarjeta",
  "monto": 200,
  "concepto": "Venta POS",
  "referencia": "VENTA-002"
}
```

### Durante el turno - Retiro para banco (S/ 300)
```
POST /api/v1/cash-register-shifts/movements
{
  "turnocaja_id": 45,
  "tipo": "salida",
  "metodo_pago": "efectivo",
  "monto": 300,
  "concepto": "Retiro para depósito bancario",
  "notas": "Banco BCP - cuenta 123456789"
}
```

### Cierre de turno
```
1. Backend calcula totales desde movimientos:
   - Efectivo ventas: S/ 150
   - Tarjeta ventas: S/ 200
   - Salidas efectivo: S/ 300
   - Total ventas: S/ 350

2. Efectivo esperado:
   - Inicial: S/ 500
   - + Ventas efectivo: S/ 150
   - - Salidas: S/ 300
   - = Esperado: S/ 350

3. Cajero cuenta: S/ 350 ✓ Cuadrado perfecto

4. POST /api/v1/cash-register-shifts/close/45
   {
     "monto_real": 350,
     "notas_cierre": "Todo correcto"
   }

5. Backend actualiza turnocaja:
   - turnocaja_total_efectivo: 150
   - turnocaja_total_tarjeta: 200
   - turnocaja_total_ventas: 350
   - turnocaja_monto_esperado: 350
   - turnocaja_monto_real: 350
   - turnocaja_diferencia: 0
   - turnocaja_estado: 'cerrado'
```

## 🎯 Beneficios

1. ✅ **Trazabilidad completa** - Cada peso registrado
2. ✅ **Auditoría detallada** - Histórico de todos los movimientos
3. ✅ **Cálculo automático** - No hay que sumar manualmente
4. ✅ **Soporte multi-método** - Efectivo, tarjeta, Yape, etc.
5. ✅ **Detección de diferencias** - Alertas de faltantes/sobrantes
6. ✅ **Reportes precisos** - Por cajero, por método, por fecha

## 📝 Tareas Pendientes

### Backend
- [ ] Crear migración para tabla `turnocaja_movimientos`
- [ ] Crear modelo `TurnoCajaMovimientosModel`
- [ ] Agregar endpoint `POST /movements`
- [ ] Agregar endpoint `GET /{shift_id}/movements`
- [ ] Modificar método `close()` para calcular totales
- [ ] Agregar método `getTotalesPorTurno()` en modelo

### Frontend
- [ ] Crear `cashMovementsApi.js`
- [ ] Integrar registro de movimientos en `POS.vue`
- [ ] Crear componente `CashMovementModal` para entradas/salidas manuales
- [ ] Agregar botones "Ingreso" y "Retiro" en menú de turno
- [ ] Mostrar lista de movimientos en arqueo de cierre
- [ ] Agregar vista de historial de movimientos

## 🔄 Migración de datos existentes

Si ya hay turnos cerrados sin movimientos, crear script de migración:

```sql
-- Convertir ventas existentes en movimientos
INSERT INTO turnocaja_movimientos
  (turnocaja_id, tienda_id, tipo, metodo_pago, monto, concepto, referencia, usuario_id, fecha_registro)
SELECT
  t.turnocaja_id,
  t.tienda_id,
  'venta',
  'efectivo',
  t.turnocaja_total_efectivo,
  'Migración histórica - Efectivo',
  CONCAT('TURNO-', t.turnocaja_id),
  t.usuario_id,
  t.turnocaja_fecha_cierre
FROM turnocaja t
WHERE t.turnocaja_estado = 'cerrado'
  AND t.turnocaja_total_efectivo > 0
  AND NOT EXISTS (
    SELECT 1 FROM turnocaja_movimientos m
    WHERE m.turnocaja_id = t.turnocaja_id
  );
```
