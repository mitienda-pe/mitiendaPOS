# Plan de Gestión de Usuarios, Cajas y Turnos - Sistema POS

## 📋 Análisis de Problemáticas

### 1. **Separación de Usuarios**
**Problema:** Usuarios de mitienda.pe vs usuarios del POS

**Preocupaciones:**
- Seguridad: No dar acceso a mitienda.pe a todos los cajeros
- Privacidad: Los cajeros no deberían ver toda la información del negocio
- Control: Necesidad de gestionar permisos específicos del POS

**Propuesta:**
```
┌─────────────────────────────────────┐
│   USUARIOS MITIENDA.PE (actual)     │
│   - Administrador                   │
│   - Acceso completo a todo          │
└─────────────────────────────────────┘
              │
              ├─ Crea/Gestiona
              ↓
┌─────────────────────────────────────┐
│   USUARIOS POS (nuevo sistema)      │
│   - Cajero 1, Cajero 2, etc         │
│   - Solo acceso al POS              │
│   - PIN de 4-6 dígitos              │
│   - Sin acceso a mitienda.pe        │
└─────────────────────────────────────┘
```

### 2. **Control de Horarios**
**Problema:** Cajero registrando ventas fuera de horario

**Soluciones posibles:**

**Opción A: Restricción por Turno**
- Solo se puede vender si hay turno abierto
- El turno tiene fecha/hora de apertura y cierre
- No se pueden hacer ventas fuera del turno

**Opción B: Restricción por Horario de Tienda**
- Configurar horarios por sucursal (ej: 8am-10pm)
- El sistema bloquea ventas fuera de horario
- Excepciones requieren PIN de supervisor

**Opción C: Ambas** (recomendado)
- Turno debe estar abierto Y dentro de horario
- Máxima seguridad

### 3. **Control de Cajas**
**Problema:** Dos cajeros abriendo turno en la misma caja

**Solución:**
```sql
-- Estructura propuesta:
Tabla: cajas_registradoras
- id
- sucursal_id
- numero_caja (ej: "CAJA 1", "CAJA 2")
- nombre (ej: "Caja Principal", "Caja Express")
- estado: activo/inactivo
- ip_address (opcional, para validar desde qué PC)

Tabla: turnos_caja
- id
- caja_id (FK a cajas_registradoras)
- usuario_pos_id (FK al nuevo sistema de usuarios)
- fecha_apertura
- fecha_cierre (NULL si está abierto)
- monto_inicial
- monto_esperado
- monto_real
- estado: abierto/cerrado
```

**Validaciones al abrir turno:**
1. ✅ La caja debe existir
2. ✅ La caja debe estar activa
3. ✅ La caja NO debe tener otro turno abierto
4. ✅ El usuario no debe tener otro turno abierto en otra caja
5. ✅ Debe estar dentro del horario de la tienda (opcional)

---

## 🎯 Propuesta de Arquitectura

### **Sistema de Usuarios POS**

#### Tabla: `usuarios_pos`
```sql
CREATE TABLE usuarios_pos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT,
    nombre VARCHAR(100),
    pin VARCHAR(255), -- encriptado, 4-6 dígitos
    rol ENUM('cajero', 'supervisor', 'gerente'),
    activo BOOLEAN DEFAULT 1,
    horario_acceso JSON, -- {"lunes": {"inicio": "08:00", "fin": "22:00"}, ...}
    created_by INT, -- usuario mitienda.pe que lo creó
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);
```

**Ejemplo de horario_acceso JSON:**
```json
{
  "lunes": {"inicio": "08:00", "fin": "22:00", "activo": true},
  "martes": {"inicio": "08:00", "fin": "22:00", "activo": true},
  "miercoles": {"inicio": "08:00", "fin": "22:00", "activo": true},
  "jueves": {"inicio": "08:00", "fin": "22:00", "activo": true},
  "viernes": {"inicio": "08:00", "fin": "22:00", "activo": true},
  "sabado": {"inicio": "09:00", "fin": "20:00", "activo": true},
  "domingo": {"inicio": "00:00", "fin": "00:00", "activo": false}
}
```

#### Tabla: `cajas_registradoras`
```sql
CREATE TABLE cajas_registradoras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT,
    numero INT, -- 1, 2, 3, etc
    nombre VARCHAR(100), -- "Caja Principal", "Caja Express"
    descripcion TEXT,
    activa BOOLEAN DEFAULT 1,
    ip_permitida VARCHAR(45) NULL, -- opcional, para restringir por PC
    ubicacion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    UNIQUE KEY unique_caja_sucursal (sucursal_id, numero)
);
```

#### Tabla: `turnos_caja` (ajustar existente)
```sql
CREATE TABLE turnos_caja (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caja_id INT, -- FK a cajas_registradoras
    usuario_pos_id INT, -- FK a usuarios_pos
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    monto_inicial DECIMAL(10,2),
    monto_esperado DECIMAL(10,2), -- calculado
    monto_real DECIMAL(10,2) NULL,
    diferencia DECIMAL(10,2), -- calculado
    notas_apertura TEXT,
    notas_cierre TEXT,
    estado ENUM('abierto', 'cerrado') DEFAULT 'abierto',
    FOREIGN KEY (caja_id) REFERENCES cajas_registradoras(id),
    FOREIGN KEY (usuario_pos_id) REFERENCES usuarios_pos(id)
);
```

---

## 🔐 Flujo de Autenticación

```
1. Login en mitienda.pe (usuario administrador)
   ↓
2. Seleccionar sucursal/tienda
   ↓
3. Ir al POS
   ↓
4. Modal: "Identificarse como cajero"
   - Seleccionar usuario POS (dropdown)
   - Ingresar PIN (4-6 dígitos)
   ↓
5. Abrir turno de caja
   - Seleccionar caja disponible (dropdown)
   - Solo muestra cajas SIN turno abierto
   - Ingresar monto inicial
   ↓
6. Trabajar en POS
   - Todas las ventas se asocian al turno activo
   - Se registra usuario_pos_id en cada venta
   ↓
7. Cerrar turno
   - Ingresar monto real
   - Sistema calcula diferencia
   - Sistema calcula monto esperado automáticamente
```

---

## 🛡️ Controles de Seguridad

### 1. **Restricción de Horarios**

**Pseudocódigo:**
```javascript
function validarHorarioPermitido(usuarioPOS, sucursal) {
  const ahora = new Date();
  const hora = ahora.getHours();
  const minuto = ahora.getMinutes();
  const dia = obtenerDiaSemana(ahora); // "lunes", "martes", etc

  // Verificar horario de usuario
  const horarioUsuario = usuarioPOS.horario_acceso[dia];
  if (!horarioUsuario.activo) {
    return { permitido: false, razon: 'Usuario no tiene acceso este día' };
  }

  const horaActual = `${hora}:${minuto}`;
  if (horaActual < horarioUsuario.inicio || horaActual > horarioUsuario.fin) {
    return {
      permitido: false,
      razon: `Fuera del horario permitido (${horarioUsuario.inicio} - ${horarioUsuario.fin})`
    };
  }

  // Verificar horario de tienda (opcional)
  const horarioTienda = sucursal.horario[dia];
  if (!horarioTienda.activo) {
    return { permitido: false, razon: 'Tienda cerrada este día' };
  }

  if (horaActual < horarioTienda.inicio || horaActual > horarioTienda.fin) {
    return {
      permitido: false,
      razon: `Tienda cerrada (${horarioTienda.inicio} - ${horarioTienda.fin})`
    };
  }

  return { permitido: true };
}
```

### 2. **Control de Turnos**

**Pseudocódigo:**
```javascript
async function abrirTurno(cajaId, usuarioId, montoInicial) {
  // 1. Validar caja existe y está activa
  const caja = await getCaja(cajaId);
  if (!caja) {
    throw new Error('Caja no encontrada');
  }
  if (!caja.activa) {
    throw new Error('Caja inactiva');
  }

  // 2. Validar caja disponible
  const turnoAbierto = await checkTurnoAbiertoCaja(cajaId);
  if (turnoAbierto) {
    throw new Error(`Esta caja ya tiene un turno abierto por ${turnoAbierto.usuario_nombre}`);
  }

  // 3. Validar usuario no tiene otro turno
  const usuarioConTurno = await checkUsuarioConTurno(usuarioId);
  if (usuarioConTurno) {
    throw new Error(`Ya tienes un turno abierto en ${usuarioConTurno.caja_nombre}`);
  }

  // 4. Validar horario (opcional)
  const usuario = await getUsuarioPOS(usuarioId);
  const sucursal = await getSucursal(caja.sucursal_id);
  const validacion = validarHorarioPermitido(usuario, sucursal);
  if (!validacion.permitido) {
    throw new Error(validacion.razon);
  }

  // 5. Validar IP si la caja tiene restricción (opcional)
  if (caja.ip_permitida && caja.ip_permitida !== request.ip) {
    throw new Error('Esta caja solo puede abrirse desde su terminal asignada');
  }

  // 6. Abrir turno
  const turno = await crearTurno({
    caja_id: cajaId,
    usuario_pos_id: usuarioId,
    monto_inicial: montoInicial,
    estado: 'abierto'
  });

  return turno;
}
```

### 3. **Auditoría**

```sql
CREATE TABLE auditoria_pos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_pos_id INT,
    accion ENUM('login', 'logout', 'abrir_turno', 'cerrar_turno', 'venta', 'anulacion', 'descuento', 'cambio'),
    detalles JSON,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_pos_id) REFERENCES usuarios_pos(id)
);
```

**Ejemplo de registro:**
```json
{
  "usuario_pos_id": 5,
  "accion": "venta",
  "detalles": {
    "venta_id": 1234,
    "turno_id": 45,
    "monto": 150.50,
    "items": 5,
    "forma_pago": "efectivo"
  },
  "ip_address": "192.168.1.100",
  "timestamp": "2025-01-22 15:30:45"
}
```

---

## 🤔 Preguntas para Definir

### 1. **Usuarios por Sucursal**
¿Quieres que cada sucursal tenga sus propias cajas y usuarios?
- ✅ **Sí:** Usuario del POS solo puede trabajar en su sucursal asignada
- ❌ **No:** Un usuario puede trabajar en cualquier sucursal

**Impacto:**
- Si SÍ: Agregar validación `usuario.sucursal_id == caja.sucursal_id`
- Si NO: Usuario puede seleccionar cualquier caja de cualquier sucursal

---

### 2. **Permisos de Supervisor**
¿Necesitas que un supervisor pueda abrir/cerrar turnos de otros cajeros?

**Casos de uso:**
- Gerente puede cerrar turno si cajero olvidó hacerlo
- Supervisor puede ver turnos de todos los cajeros
- Supervisor puede anular ventas (requiere PIN)

**Implementación:**
```javascript
// Validar permisos según rol
if (accion === 'cerrar_turno_otro_usuario') {
  if (usuario.rol !== 'supervisor' && usuario.rol !== 'gerente') {
    throw new Error('No tienes permisos para cerrar turnos de otros usuarios');
  }
}
```

---

### 3. **Restricción de Horarios**
¿Quieres limitar ventas por horario de tienda o solo por turno?

**Opción 1: Solo Turno Abierto** (más flexible)
- ✅ Cajero puede vender mientras tenga turno abierto
- ✅ Útil para tiendas 24/7 o con horarios variables
- ❌ Menos control sobre horarios de trabajo

**Opción 2: Turno + Horario de Tienda** (más restrictivo)
- ✅ Máximo control
- ✅ No se puede vender fuera de horario aunque haya turno
- ❌ Menos flexible para excepciones

**Opción 3: Turno + Horario con Excepciones**
- ✅ Normal: requiere turno + horario
- ✅ Excepción: supervisor puede autorizar con PIN
- ✅ Balance entre control y flexibilidad

---

### 4. **Método de Autenticación de Cajeros**
¿PIN de 4 dígitos es suficiente para cajeros?

**Opción A: PIN 4-6 dígitos**
- ✅ Más simple y rápido
- ✅ Fácil de recordar
- ✅ Común en sistemas POS
- ❌ Menos seguro

**Opción B: Usuario/Contraseña**
- ✅ Más seguro
- ❌ Más lento
- ❌ Cajeros pueden olvidar contraseñas

**Recomendación:** PIN de 4-6 dígitos + política de cambio periódico

---

### 5. **Restricción por IP**
¿Las cajas deben estar asociadas a IPs específicas?

**Escenario:**
- "CAJA 1" solo se puede abrir desde PC 192.168.1.100
- "CAJA 2" solo se puede abrir desde PC 192.168.1.101

**Ventajas:**
- ✅ Mayor seguridad
- ✅ Evita que cajeros abran turno desde cualquier dispositivo
- ✅ Control de ubicación física

**Desventajas:**
- ❌ Menos flexibilidad
- ❌ Problema si cambia la IP o se mueve el equipo
- ❌ Más configuración inicial

---

### 6. **Reportes de Productividad**
¿Quieres reportes de productividad por cajero?

**Métricas posibles:**
- Ventas por cajero (monto total, cantidad de tickets)
- Ticket promedio por cajero
- Tiempo promedio de atención
- Diferencias en cuadres (faltantes/sobrantes)
- Horarios de trabajo efectivos
- Productos más vendidos por cajero

**Implementación:**
```sql
-- Reporte de ventas por cajero
SELECT
    u.nombre as cajero,
    COUNT(v.id) as total_tickets,
    SUM(v.monto_total) as monto_vendido,
    AVG(v.monto_total) as ticket_promedio,
    DATE(v.fecha) as fecha
FROM ventas v
JOIN turnos_caja t ON v.turno_id = t.id
JOIN usuarios_pos u ON t.usuario_pos_id = u.id
WHERE DATE(v.fecha) = CURDATE()
GROUP BY u.id, DATE(v.fecha)
ORDER BY monto_vendido DESC;
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────┐
│  ADMINISTRADOR (mitienda.pe)            │
│  - Login con usuario/contraseña         │
│  - Selecciona tienda/sucursal           │
└─────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  GESTIÓN (admin puede crear/editar)     │
│  - Crear usuarios POS                   │
│  - Crear cajas registradoras            │
│  - Configurar horarios                  │
└─────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  CAJERO entra al POS                    │
│  - Selecciona su usuario                │
│  - Ingresa PIN                          │
└─────────────────────────────────────────┘
                  │
                  ├─ Validar PIN
                  ├─ Validar horario usuario
                  ↓
┌─────────────────────────────────────────┐
│  ABRIR TURNO                            │
│  - Selecciona caja disponible           │
│  - Ingresa monto inicial                │
└─────────────────────────────────────────┘
                  │
                  ├─ Validar caja sin turno abierto
                  ├─ Validar usuario sin otro turno
                  ├─ Validar horario tienda (opcional)
                  ├─ Validar IP (opcional)
                  ↓
┌─────────────────────────────────────────┐
│  TRABAJAR EN POS                        │
│  - Realizar ventas                      │
│  - Cada venta asociada a turno          │
│  - Auditoría de todas las acciones      │
└─────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  CERRAR TURNO                           │
│  - Contar dinero en caja                │
│  - Ingresar monto real                  │
│  - Sistema calcula diferencia           │
│  - Imprimir reporte de cierre           │
└─────────────────────────────────────────┘
```

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos (Backend)
1. Crear tabla `usuarios_pos`
2. Crear tabla `cajas_registradoras`
3. Modificar tabla `turnos_caja` (agregar `caja_id`)
4. Crear tabla `auditoria_pos`
5. Crear endpoints API para gestión

### Fase 2: Gestión de Cajas y Usuarios (Frontend)
1. Módulo de gestión de cajas (CRUD)
2. Módulo de gestión de usuarios POS (CRUD)
3. Interfaz para asignar horarios

### Fase 3: Autenticación de Cajeros
1. Modal de identificación de cajero (PIN)
2. Validación de horarios
3. Almacenar usuario activo en sesión

### Fase 4: Control de Turnos
1. Modal de apertura: dropdown de cajas disponibles
2. Validaciones al abrir turno
3. Modificar flujo de ventas para asociar a turno y usuario

### Fase 5: Reportes y Auditoría
1. Reporte de productividad por cajero
2. Historial de turnos con filtros
3. Dashboard de auditoría

---

## 📝 Notas Adicionales

- Considerar encriptación de PINs con bcrypt
- Implementar sistema de recuperación de PIN (solo admin)
- Agregar logs de todos los cambios en usuarios y cajas
- Considerar notificaciones cuando hay diferencias grandes en cuadres
- Pensar en sistema de alertas para patrones sospechosos (muchas anulaciones, descuentos, etc.)

---

**Documento creado:** 2025-01-22
**Última actualización:** 2025-01-22
**Estado:** Planificación - Pendiente de aprobación
