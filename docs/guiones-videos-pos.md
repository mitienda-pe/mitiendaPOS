# Guiones — Videos instructivos Punto de Venta MiTienda

Serie mínima de **10 videos** orientada a la operación esencial. Los textos entre comillas
("…") corresponden a etiquetas reales de la interfaz.

Convenciones de cada guion:
- **🖱️ Acción:** lo que se hace/clic en pantalla (para quien graba).
- **🎙️ Narración:** voz en off (es-PE).

Idioma: español (es-PE). Color de marca: turquesa `#00b2a6`.

---

## Parte A — Puesta en marcha (administrador)

### Video 1 — Acceso y configuración inicial
**Objetivo:** ingresar como administrador y dejar listo lo mínimo para vender.
**Duración:** ~4 min · **Requisitos:** credenciales de administrador.

1. **Apertura**
   - 🎙️ "Bienvenido al Punto de Venta de MiTienda. En este primer video aprenderás a ingresar y a dejar tu tienda lista para vender."
2. **Login**
   - 🖱️ Mostrar la pantalla de login. Escribir "Email" y "Contraseña". Clic en **"Iniciar Sesión"**.
   - 🎙️ "Ingresa con tu correo y contraseña de administrador, y presiona Iniciar Sesión."
3. **Selección de tienda** (solo si gestionas más de una)
   - 🖱️ En "Selecciona tu Tienda", elegir la tienda.
   - 🎙️ "Si administras varias tiendas, elige con cuál vas a trabajar. Si tienes una sola, este paso se omite automáticamente."
4. **Recorrido del menú**
   - 🖱️ Mostrar el "Menú Principal" y señalar: Punto de Venta, Mi Turno, Inventario, Ventas, Documentos, Clientes, Configuración.
   - 🎙️ "Este es el menú principal. Desde aquí accedes a las ventas, el inventario, tus turnos de caja y la configuración."
5. **Configurar el negocio**
   - 🖱️ Entrar a **"Configuración"** → "Preferencias" (datos del negocio).
   - 🎙️ "En Configuración encontrarás los datos de tu negocio. Revísalos antes de empezar."
6. **Métodos de pago**
   - 🖱️ En "Configuración" → "Métodos de pago", activar los que se usarán (efectivo, tarjeta, Yape, Plin, transferencia, QR).
   - 🎙️ "Activa los métodos de pago que aceptarás. Solo los activos aparecerán al momento de cobrar."
7. **Cierre**
   - 🎙️ "Nota: tu tienda ya viene con una sucursal por defecto, así que puedes vender de inmediato. Crear sucursales adicionales es opcional y lo vemos en un video aparte."

---

### Video 2 — Crear cajeros
**Objetivo:** crear un empleado tipo cajero con su PIN de acceso.
**Duración:** ~3 min · **Requisitos:** sesión de administrador o supervisor.

1. **Intro**
   - 🎙️ "Cada cajero ingresa al Punto de Venta con su propio PIN. Vamos a crear uno."
2. **Ir a usuarios**
   - 🖱️ "Configuración" → "Usuarios" ("Empleados Punto de Venta").
   - 🎙️ "En Configuración, entra a la sección de empleados del Punto de Venta."
3. **Nuevo empleado**
   - 🖱️ Clic en el botón de agregar empleado. Llenar Nombres, Apellidos, DNI y Email.
   - 🎙️ "Crea un nuevo empleado e ingresa sus datos: nombres, apellidos, DNI y correo."
4. **Rol y PIN**
   - 🖱️ Elegir rol: "Cajero" (o "Supervisor"). Definir el PIN (campo de 4 dígitos, placeholder "0000"). Asignar sucursal si corresponde.
   - 🎙️ "Asígnale el rol de Cajero y un PIN de 4 dígitos. Este PIN es con el que ingresará al Punto de Venta, así que anótalo y compártelo de forma segura."
5. **Activo y guardar**
   - 🖱️ Verificar "Empleado activo". Guardar.
   - 🎙️ "Asegúrate de que quede como empleado activo y guarda. Para dar de baja a alguien, basta con desactivarlo aquí."
6. **Cierre**
   - 🎙️ "Diferencia clave: el Cajero solo vende; el Supervisor además puede autorizar operaciones especiales con su PIN."

---

### Video 3 — Cargar productos
**Objetivo:** crear un producto vendible.
**Duración:** ~4 min · **Requisitos:** sesión de administrador o supervisor.

1. **Intro**
   - 🎙️ "Para poder vender necesitas productos en tu catálogo. Vamos a crear uno."
2. **Ir a inventario**
   - 🖱️ Menú → "Inventario". Clic en el botón de crear producto.
   - 🎙️ "Entra a Inventario y crea un nuevo producto."
3. **Datos básicos**
   - 🖱️ Llenar "Nombre del producto *", "SKU" y "Código de barras" (o usar el ícono para escanear).
   - 🎙️ "Escribe el nombre del producto. El SKU y el código de barras son opcionales, pero te ayudan a encontrarlo y escanearlo en caja."
4. **Precio y stock**
   - 🖱️ Llenar "Precio (S/) *" y "Stock". Elegir "Categoría".
   - 🎙️ "Define el precio de venta y la cantidad en stock. Puedes clasificarlo en una categoría para encontrarlo más rápido."
5. **Costo (solo admin)**
   - 🖱️ Llenar "Costo de compra (S/)"; mostrar el margen estimado que aparece.
   - 🎙️ "Si eres administrador, puedes registrar el costo de compra. El sistema calcula tu margen estimado. Este dato nunca se muestra al cliente."
6. **Imagen y guardar**
   - 🖱️ Subir imagen (opcional). Guardar.
   - 🎙️ "Agrega una foto si quieres y guarda. ¡Tu producto ya está listo para venderse!"
7. **Cierre**
   - 🎙️ "Para cargar muchos productos a la vez existe la importación por archivo, y para manejar lotes lo vemos en los videos opcionales."

---

## Parte B — Operación diaria (cajero)

### Video 4 — Iniciar el día: login del cajero y abrir turno de caja
**Objetivo:** que el cajero ingrese y abra su turno para poder vender.
**Duración:** ~4 min · **Requisitos:** un cajero creado (Video 2) y su PIN.

1. **Intro**
   - 🎙️ "Empieza tu día en dos pasos: ingresar con tu PIN y abrir el turno de caja."
2. **Login del cajero**
   - 🖱️ Pantalla de cajero. Ingresar "Número de tu tienda" y el PIN de 4 dígitos ("••••").
   - 🎙️ "Ingresa el número de tu tienda y tu PIN de 4 dígitos. Como cajero, entras directo a tu tienda, sin selección de tienda."
3. **¿Por qué abrir turno?**
   - 🖱️ Intentar entrar a "Punto de Venta" sin turno → mostrar el redireccionamiento/aviso.
   - 🎙️ "El Punto de Venta necesita un turno de caja activo. Sin turno abierto, no podrás registrar ventas."
4. **Abrir turno**
   - 🖱️ Abrir el modal "Abrir Turno de Caja". Elegir "Sucursal *" y "Número de Caja *".
   - 🎙️ "Abre tu turno: elige la sucursal y el número de caja física que vas a usar."
5. **Monto inicial**
   - 🖱️ Ingresar el monto inicial (placeholder "0.00"). Confirmar.
   - 🎙️ "Registra el efectivo con el que inicias en caja. Este será el punto de partida para el arqueo al cierre. Confirma y ¡listo para vender!"
6. **Cierre**
   - 🎙️ "Tu turno quedó abierto. Lo puedes revisar en cualquier momento desde 'Mi Turno'."

---

### Video 5 — Realizar una venta y cobrar
**Objetivo:** registrar una venta completa de principio a fin.
**Duración:** ~6 min · **Requisitos:** turno abierto (Video 4) y productos cargados (Video 3).

1. **Intro**
   - 🎙️ "Este es el corazón del Punto de Venta: registrar una venta y cobrarla."
2. **Iniciar venta / elegir comprobante**
   - 🖱️ En "Iniciar Nueva Venta", elegir "Boleta" o "Factura". Para boleta sin datos: "Para consumidor final".
   - 🎙️ "Inicia una nueva venta y elige el tipo de comprobante: boleta para consumidor final, o factura si el cliente necesita sustento con RUC."
3. **Agregar productos**
   - 🖱️ Usar el buscador "Escanear código de barras o buscar producto…". Escanear o tocar el producto en "Lista de Productos". Filtrar por "Categoría" / "Todas las categorías".
   - 🎙️ "Busca por nombre, escanea el código de barras, o tócalo en la lista. Cada producto se agrega al resumen de la orden."
4. **Ajustar cantidades**
   - 🖱️ En "Resumen de la Orden", ajustar "Cantidad" de una línea.
   - 🎙️ "Puedes ajustar las cantidades o quitar productos directamente desde el resumen."
5. **Cliente (opcional / según comprobante)**
   - 🖱️ Clic en "Seleccionar Cliente". Buscar por "DNI" o "RUC"; el sistema consulta RENIEC/SUNAT y autocompleta "Nombres/Apellidos" o "Razón Social".
   - 🎙️ "Si necesitas identificar al cliente, búscalo por DNI o RUC: el sistema consulta RENIEC o SUNAT y completa sus datos automáticamente. Para una factura, el RUC es obligatorio."
6. **Revisar totales**
   - 🖱️ Señalar "Subtotal", "IGV (18%)" y "Total".
   - 🎙️ "Revisa el subtotal, el IGV y el total antes de cobrar."
7. **Cobrar**
   - 🖱️ Abrir el cobro ("Total a pagar"). Elegir "Método de pago" (efectivo, tarjeta, Yape, Plin, transferencia, QR). Clic en "Añadir Pago".
   - 🎙️ "Pasa a cobrar. Elige el método de pago. En efectivo, ingresa con cuánto paga el cliente."
8. **Vuelto y redondeo**
   - 🖱️ Mostrar "Redondeo", "Cambio:" y "Desglose del vuelto:".
   - 🎙️ "El sistema calcula el vuelto y aplica el redondeo cuando corresponde, mostrándote cómo entregar el cambio."
9. **Confirmar**
   - 🖱️ Confirmar hasta "Pago Completado" / "¡Gracias por su compra!".
   - 🎙️ "Confirma el pago. La venta queda registrada. En el siguiente video vemos el comprobante y la impresión."
10. **Cierre**
    - 🎙️ "Recuerda: puedes agregar un cliente o no, según el tipo de comprobante que estés emitiendo."

---

### Video 6 — Comprobantes e impresión del ticket
**Objetivo:** emitir el comprobante electrónico e imprimir/enviar el ticket.
**Duración:** ~5 min · **Requisitos:** una venta registrada (Video 5); impresora térmica con QZ Tray (opcional).

1. **Intro**
   - 🎙️ "Tras cobrar, toca emitir el comprobante electrónico y entregar el ticket."
2. **Emisión automática vs. manual**
   - 🎙️ "Según la configuración de tu tienda, el comprobante se emite automáticamente al confirmar el pago, o manualmente con un botón."
3. **Emisión manual**
   - 🖱️ Ir a la venta (menú "Ventas" → detalle) y clic en "Emitir comprobante".
   - 🎙️ "En modo manual, abre el detalle de la venta y presiona 'Emitir comprobante'."
4. **Formato del documento**
   - 🖱️ En el modal de comprobante, elegir "A4 (Estándar)" o "Ticket (80mm) - Impresora térmica". Mostrar "Requisitos para Factura".
   - 🎙️ "Elige el formato: A4 para impresión estándar, o ticket de 80 milímetros para impresora térmica."
5. **Configurar impresora (una vez)**
   - 🖱️ "Configuración" → "Impresora" (QZ Tray).
   - 🎙️ "Para imprimir tickets térmicos, configura tu impresora con QZ Tray una sola vez desde Configuración."
6. **Imprimir / reimprimir**
   - 🖱️ Imprimir el ticket; mostrar el botón "Reimprimir" en el detalle de la venta.
   - 🎙️ "Imprime el ticket. Si se traba la impresora o el cliente pide otra copia, usa 'Reimprimir'."
7. **Enviar por email**
   - 🖱️ Usar "Enviar por Email" / reenvío del comprobante.
   - 🎙️ "También puedes enviar el comprobante al correo del cliente."
8. **Cierre**
   - 🎙️ "Todos los comprobantes emitidos quedan archivados en la sección 'Documentos', que veremos más adelante."

---

### Video 7 — Cerrar turno de caja
**Objetivo:** hacer el arqueo y cerrar el turno.
**Duración:** ~4 min · **Requisitos:** turno abierto con ventas.

1. **Intro**
   - 🎙️ "Al terminar tu jornada, cierras el turno y haces el arqueo de caja."
2. **Abrir cierre**
   - 🖱️ Ir a "Mi Turno" y abrir el cierre ("Resumen del Turno").
   - 🎙️ "Desde 'Mi Turno', inicia el cierre. Verás el resumen completo del turno."
3. **Resumen del turno**
   - 🖱️ Señalar "Monto Inicial", "Total Ventas", "Número de ventas", desglose por método (Efectivo, Tarjeta, Yape, Plin, Transferencia) y "Redondeos del turno".
   - 🎙️ "El sistema te muestra cuánto vendiste y cómo se distribuyó entre efectivo, tarjeta, Yape, Plin y transferencias."
4. **Arqueo de efectivo**
   - 🖱️ Comparar "Efectivo Esperado en Caja" con el efectivo real contado (ingresarlo).
   - 🎙️ "Cuenta el efectivo físico de tu caja e ingrésalo. El sistema lo compara con lo esperado y calcula la diferencia."
5. **Notas y PIN**
   - 🖱️ Escribir notas ("Ej: Observaciones, incidencias, billetes dañados…"). Ingresar PIN ("••••") si se solicita.
   - 🎙️ "Anota cualquier incidencia. Confirma con tu PIN para cerrar el turno."
6. **Cierre**
   - 🎙️ "El turno queda cerrado. Puedes consultar el historial de turnos cuando lo necesites."

---

## Parte C — Casos frecuentes y consultas

### Video 8 — Situaciones especiales en la venta
**Objetivo:** manejar pagos parciales, ventas guardadas y promociones.
**Duración:** ~6 min · **Requisitos:** turno abierto; PIN de supervisor para algunos pasos.

1. **Intro**
   - 🎙️ "No todas las ventas son directas. Veamos tres casos comunes."
2. **Pago parcial / carrito bloqueado**
   - 🖱️ Agregar un primer pago menor al total → el carrito pasa a estado bloqueado. Mostrar "Saldo pendiente:".
   - 🎙️ "Si el cliente abona solo una parte, registras un pago parcial y queda un saldo pendiente. La venta se bloquea para proteger el cobro."
3. **Editar un carrito bloqueado (PIN supervisor)**
   - 🖱️ Intentar editar → aparece el modal de autorización de supervisor. Ingresar PIN.
   - 🎙️ "Para modificar una venta ya bloqueada se necesita la autorización de un supervisor con su PIN."
4. **Ventas guardadas**
   - 🖱️ Guardar una venta en curso; luego abrir el listado de ventas guardadas y retomarla. Mostrar la opción de fusionar.
   - 🎙️ "¿El cliente dejó la compra a medias o atiendes a otro? Guarda la venta y retómala después. Incluso puedes fusionar varias ventas guardadas en una sola."
5. **Promociones y bonificaciones**
   - 🖱️ Menú → "Descuentos y Promociones". Mostrar una bonificación; al vender, agregar el producto en bonificación (advertencia si no hay stock).
   - 🎙️ "Si tienes promociones activas, puedes sumar productos en bonificación a la venta. El sistema te avisa si no hay stock disponible para la bonificación."
6. **Cierre**
   - 🎙️ "Con esto cubres las situaciones del día a día que se salen de la venta simple."

---

### Video 9 — Movimientos de efectivo del turno
**Objetivo:** registrar entradas y salidas de efectivo durante el turno.
**Duración:** ~3 min · **Requisitos:** turno abierto.

1. **Intro**
   - 🎙️ "A veces entra o sale dinero de la caja por motivos distintos a una venta. Eso se registra como movimiento de efectivo."
2. **Ir a Mi Turno**
   - 🖱️ Menú → "Mi Turno".
   - 🎙️ "Desde 'Mi Turno' gestionas los movimientos de efectivo del turno actual."
3. **Registrar movimiento**
   - 🖱️ Registrar una entrada (ej. fondo adicional) y una salida (ej. pago a proveedor / retiro), con su monto y motivo.
   - 🎙️ "Registra cada entrada o salida con su monto y el motivo. Por ejemplo: un retiro a la caja fuerte o un pago menor."
4. **Impacto en el arqueo**
   - 🎙️ "Estos movimientos se reflejan en el efectivo esperado, para que el arqueo al cierre cuadre con la realidad."
5. **Cierre**
   - 🎙️ "Registra los movimientos en el momento en que ocurren: así evitas descuadres al cerrar."

---

### Video 10 — Consultas e historial
**Objetivo:** consultar ventas, documentos emitidos y el dashboard.
**Duración:** ~4 min · **Requisitos:** ventas y documentos previos.

1. **Intro**
   - 🎙️ "Por último, cómo consultar lo que ya vendiste."
2. **Historial de ventas**
   - 🖱️ Menú → "Ventas". Filtrar por estado, origen y rango de fechas; buscar por cliente/documento/número. Abrir un detalle.
   - 🎙️ "En 'Ventas' encuentras todo lo registrado. Filtra por fecha o estado, y abre cualquier venta para ver su detalle."
3. **Documentos emitidos**
   - 🖱️ Menú → "Documentos". Filtrar por tipo, fecha, serie, RUC/DNI. Abrir un comprobante.
   - 🎙️ "En 'Documentos' están todos los comprobantes electrónicos emitidos, con su serie y estado. Desde aquí puedes reenviarlos."
4. **Dashboard**
   - 🖱️ Menú → "Dashboard". Mostrar ventas netas y número de transacciones; cambiar el rango de fechas; activar comparación.
   - 🎙️ "El Dashboard te da el panorama: ventas netas y número de transacciones, con filtros por período y comparación contra el período anterior."
5. **Cierre**
   - 🎙️ "Con esto completas el recorrido esencial del Punto de Venta. ¡A vender!"
aplica
---

## Videos opcionales / avanzados (grabar solo si aplica)

- **Sucursales múltiples:** crear y gestionar sucursales y número de cajas ("Configuración" → "Sucursales").
- **Lotes:** ingreso y baja de lotes desde "Inventario".
- **Importación masiva:** carga de productos por archivo ("Inventario" → importar).
- **Gestión de clientes:** alta/edición de clientes fuera de la venta (menú "Clientes").
- **Configuración de Nubefact:** alta del proveedor de comprobantes ("Configuración" → facturación).

> Nota: los módulos "Vales y Tarjetas de Regalo" y "Cambios y devoluciones" están marcados como
> *"Módulo en desarrollo"* en la app; no se incluyen hasta que estén disponibles.
