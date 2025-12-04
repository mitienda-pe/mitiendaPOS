<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
        <p class="mt-2 text-sm text-gray-600">Manual de usuario del sistema POS</p>
      </div>
      <router-link
        to="/menu"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Volver al Menú
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md sticky top-6">
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Contenido</h2>
            <nav class="space-y-1">
              <button
                v-for="section in sections"
                :key="section.id"
                @click="activeSection = section.id"
                :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ section.title }}
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Cajero Section -->
          <div v-show="activeSection === 'cajero'" class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Manual de Usuario Cajero</h2>
              <p class="text-gray-600">Guía completa para operadores de punto de venta</p>
            </div>

            <!-- Abrir Turno -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Cómo Abrir Turno
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Para iniciar tu jornada de trabajo, debes abrir un turno de caja:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Desde el menú principal, haz clic en <strong>"Mi Turno"</strong></li>
                  <li>Presiona el botón <strong>"Abrir Turno"</strong></li>
                  <li>Ingresa el <strong>monto inicial</strong> de efectivo que tienes en caja</li>
                  <li>Opcionalmente, puedes ingresar un <strong>desglose de billetes y monedas</strong> para mayor precisión</li>
                  <li>Añade observaciones si es necesario</li>
                  <li>Confirma la apertura del turno</li>
                </ol>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                  <p class="text-sm text-blue-700">
                    <strong>Importante:</strong> Debes tener un turno abierto para poder acceder al POS y realizar ventas.
                  </p>
                </div>
              </div>
            </div>

            <!-- Cerrar Turno -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Cómo Cerrar Turno
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Al finalizar tu jornada, debes cerrar el turno:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve a <strong>"Mi Turno"</strong> desde el menú principal</li>
                  <li>Haz clic en <strong>"Cerrar Turno"</strong></li>
                  <li>El sistema mostrará un resumen con:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Monto inicial de caja</li>
                      <li>Total de ventas por método de pago</li>
                      <li>Monto esperado en caja</li>
                    </ul>
                  </li>
                  <li>Ingresa el <strong>monto real</strong> que tienes en efectivo</li>
                  <li>Opcionalmente, ingresa el desglose de billetes y monedas</li>
                  <li>Si hay diferencias, añade observaciones explicativas</li>
                  <li>Confirma el cierre del turno</li>
                </ol>
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Nota:</strong> El sistema calculará automáticamente la diferencia entre el monto esperado y el monto real (faltante o sobrante).
                  </p>
                </div>
              </div>
            </div>

            <!-- Iniciar Venta -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Cómo Iniciar una Venta
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Para comenzar una nueva venta:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Desde el menú principal, accede al módulo <strong>"POS"</strong></li>
                  <li>Si tienes ventas pendientes, puedes continuar con ellas o iniciar una nueva</li>
                  <li>Para crear una venta nueva, haz clic en <strong>"Nueva Venta"</strong></li>
                  <li>El sistema creará una orden de venta vacía lista para agregar productos</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Seleccionar Cliente y Tipo de Comprobante</h4>
                <p class="text-gray-700">Al iniciar una venta, debes definir el cliente y tipo de documento:</p>

                <div class="mt-3 space-y-4">
                  <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p class="text-sm font-semibold text-blue-800 mb-2">Venta como Cliente General (por defecto)</p>
                    <p class="text-sm text-blue-700 mb-2">
                      Si el cliente no proporciona documento de identidad, la venta se realiza como <strong>"Cliente General"</strong>:
                    </p>
                    <ul class="list-disc list-inside text-sm text-blue-700 ml-4 space-y-1">
                      <li>No es necesario buscar o registrar cliente</li>
                      <li>Solo se puede emitir <strong>Boleta</strong></li>
                      <li>No se requiere email ni teléfono</li>
                      <li>Es el método más rápido para ventas al mostrador</li>
                    </ul>
                  </div>

                  <div class="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <p class="text-sm font-semibold text-purple-800 mb-2">Buscar Cliente Existente</p>
                    <ol class="list-decimal list-inside text-sm text-purple-700 ml-4 space-y-1">
                      <li>Haz clic en el campo <strong>"Cliente"</strong> o en el icono de búsqueda</li>
                      <li>Ingresa el número de DNI, RUC, o nombre del cliente</li>
                      <li>Si el cliente existe en la base de datos:
                        <ul class="list-disc list-inside ml-6 mt-1">
                          <li>Se mostrarán sus datos completos</li>
                          <li>Selecciona el cliente de la lista</li>
                          <li>Sus datos (nombre, documento, email, teléfono) se cargarán automáticamente</li>
                          <li>Si tiene RUC, podrás emitir Factura</li>
                        </ul>
                      </li>
                      <li>Si el cliente NO existe:
                        <ul class="list-disc list-inside ml-6 mt-1">
                          <li>Verás un mensaje "Cliente no encontrado"</li>
                          <li>Puedes crear un nuevo cliente (ver siguiente sección)</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div class="bg-green-50 border-l-4 border-green-400 p-4">
                    <p class="text-sm font-semibold text-green-800 mb-2">Registrar Nuevo Cliente</p>
                    <p class="text-sm text-green-700 mb-2">Si el cliente no está en la base de datos:</p>
                    <ol class="list-decimal list-inside text-sm text-green-700 ml-4 space-y-1">
                      <li>Haz clic en <strong>"Crear Nuevo Cliente"</strong></li>
                      <li>Completa los datos requeridos:
                        <ul class="list-disc list-inside ml-6 mt-1">
                          <li><strong>Tipo de documento:</strong> DNI, RUC, CE, Pasaporte</li>
                          <li><strong>Número de documento:</strong> (requerido)</li>
                          <li><strong>Nombre completo / Razón Social:</strong> (requerido)</li>
                          <li><strong>Email:</strong> (opcional pero recomendado para envío de comprobantes)</li>
                          <li><strong>Teléfono:</strong> (opcional)</li>
                          <li><strong>Dirección:</strong> (opcional)</li>
                        </ul>
                      </li>
                      <li>Si el documento es <strong>RUC</strong>, también ingresa:
                        <ul class="list-disc list-inside ml-6 mt-1">
                          <li>Razón social completa</li>
                          <li>Dirección fiscal</li>
                        </ul>
                      </li>
                      <li>Haz clic en <strong>"Guardar Cliente"</strong></li>
                      <li>El cliente se agregará automáticamente a la venta</li>
                    </ol>
                  </div>

                  <div class="bg-orange-50 border-l-4 border-orange-400 p-4">
                    <p class="text-sm font-semibold text-orange-800 mb-2">Convertir Venta en Curso Agregando Cliente</p>
                    <p class="text-sm text-orange-700 mb-2">
                      Si iniciaste la venta como "Cliente General" pero luego el cliente quiere factura:
                    </p>
                    <ol class="list-decimal list-inside text-sm text-orange-700 ml-4 space-y-1">
                      <li>Haz clic en el campo <strong>"Cliente"</strong> (mostrará "Cliente General")</li>
                      <li>Busca o registra el cliente con RUC</li>
                      <li>Cambia el tipo de comprobante a <strong>"Factura"</strong></li>
                      <li>El sistema actualizará la venta con los nuevos datos</li>
                      <li>Continúa agregando productos normalmente</li>
                    </ol>
                  </div>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Boleta vs Factura</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div class="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                    <p class="font-semibold text-gray-900 mb-2">Boleta</p>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Para personas naturales</li>
                      <li>Acepta DNI, CE, Pasaporte</li>
                      <li>No es deducible de impuestos</li>
                      <li>Puede ser cliente general</li>
                    </ul>
                  </div>
                  <div class="bg-gray-50 p-3 rounded border-l-4 border-purple-400">
                    <p class="font-semibold text-gray-900 mb-2">Factura</p>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Para empresas</li>
                      <li>Requiere RUC obligatorio</li>
                      <li>Deducible de impuestos</li>
                      <li>Debe incluir razón social y dirección fiscal</li>
                    </ul>
                  </div>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                  <p class="text-sm text-blue-700">
                    <strong>Recuerda:</strong> Cada venta se guarda automáticamente, por lo que puedes pausarla y continuarla más tarde.
                  </p>
                </div>
              </div>
            </div>

            <!-- Pausar y Retomar Ventas -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3.1</span>
                Pausar, Guardar y Retomar Ventas
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">El sistema permite gestionar múltiples ventas simultáneamente:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Guardado Automático</h4>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p class="text-sm text-blue-700">
                    <strong>El sistema guarda automáticamente cada cambio:</strong>
                  </p>
                  <ul class="list-disc list-inside text-sm text-blue-700 ml-4 mt-2 space-y-1">
                    <li>Cada producto agregado se guarda instantáneamente</li>
                    <li>Los cambios de cantidad o precio se guardan automáticamente</li>
                    <li>La información del cliente se guarda al seleccionarlo</li>
                    <li>No necesitas hacer clic en "Guardar"</li>
                  </ul>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Pausar una Venta</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Si necesitas atender a otro cliente, simplemente haz clic en <strong>"Nueva Venta"</strong></li>
                  <li>La venta actual se guardará automáticamente en la lista de "Ventas en Curso"</li>
                  <li>Puedes tener múltiples ventas pausadas simultáneamente</li>
                  <li>No hay límite de tiempo, la venta permanecerá hasta que la completes o la canceles</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Retomar una Venta en Curso</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En el módulo POS, verás la lista de <strong>"Ventas en Curso"</strong> en el lateral izquierdo</li>
                  <li>Cada venta muestra:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Número de orden</li>
                      <li>Nombre del cliente (o "Cliente General")</li>
                      <li>Cantidad de productos</li>
                      <li>Monto total</li>
                      <li>Hora de creación</li>
                    </ul>
                  </li>
                  <li>Haz clic en la venta que deseas continuar</li>
                  <li>El sistema cargará todos los productos y datos del cliente</li>
                  <li>Puedes continuar agregando productos o proceder al cobro</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Eliminar una Venta en Curso</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la lista de "Ventas en Curso", localiza la venta a eliminar</li>
                  <li>Haz clic en el icono de <strong>"Eliminar"</strong> (papelera) o botón "X"</li>
                  <li>Confirma que deseas cancelar la venta</li>
                  <li>La venta se eliminará permanentemente</li>
                </ol>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Importante:</strong> Las ventas en curso son personales de cada cajero. Solo tú puedes ver y continuar tus propias ventas pausadas.
                  </p>
                </div>

                <div class="bg-green-50 border-l-4 border-green-400 p-4 mt-3">
                  <p class="text-sm text-green-700">
                    <strong>Tip:</strong> Usa ventas en curso cuando el cliente aún está decidiendo qué comprar, o cuando necesitas atender urgencias sin perder el progreso de la venta actual.
                  </p>
                </div>
              </div>
            </div>

            <!-- Agregar Productos -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                Cómo Agregar Productos
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Existen varias formas de agregar productos a una venta:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Método 1: Búsqueda Manual</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Escribe el nombre del producto en la barra de búsqueda</li>
                  <li>Selecciona el producto de la lista de resultados</li>
                  <li>Ajusta la cantidad si es necesario</li>
                  <li>Haz clic en <strong>"Agregar"</strong></li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Método 2: Escaneo de Código de Barras</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Haz clic en el icono del escáner o presiona F2</li>
                  <li>Escanea el código de barras del producto</li>
                  <li>El producto se agregará automáticamente</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Casos Especiales:</h4>

                <div class="space-y-4 mt-3">
                  <div class="bg-red-50 border-l-4 border-red-400 p-4">
                    <p class="text-sm font-semibold text-red-800 mb-1">Producto No Disponible</p>
                    <p class="text-sm text-red-700">
                      Si el producto no existe en el sistema, verás un mensaje de error. Verifica que estés buscando correctamente o consulta con tu supervisor.
                    </p>
                  </div>

                  <div class="bg-orange-50 border-l-4 border-orange-400 p-4">
                    <p class="text-sm font-semibold text-orange-800 mb-1">Producto Sin Stock</p>
                    <p class="text-sm text-orange-700">
                      El sistema te alertará si el producto no tiene stock suficiente. Puedes:
                    </p>
                    <ul class="list-disc list-inside ml-4 text-sm text-orange-700 mt-1">
                      <li>Ajustar la cantidad solicitada</li>
                      <li>Informar al cliente sobre la disponibilidad</li>
                      <li>Contactar con el área de inventario</li>
                    </ul>
                  </div>

                  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p class="text-sm font-semibold text-yellow-800 mb-1">Error al Verificar Stock</p>
                    <p class="text-sm text-yellow-700">
                      Si hay problemas de conexión al verificar el stock:
                    </p>
                    <ul class="list-disc list-inside ml-4 text-sm text-yellow-700 mt-1">
                      <li>Verifica tu conexión a internet</li>
                      <li>Intenta nuevamente en unos segundos</li>
                      <li>Si el error persiste, contacta al soporte técnico</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Registrar Pago -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">5</span>
                Cómo Registrar un Pago
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Para procesar el pago de una venta:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Una vez agregados todos los productos, haz clic en <strong>"Cobrar"</strong></li>
                  <li>Selecciona el método de pago:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Efectivo:</strong> Ingresa el monto recibido, el sistema calculará el vuelto</li>
                      <li><strong>Tarjeta:</strong> Ingresa el monto y procesa la transacción</li>
                      <li><strong>Transferencia:</strong> Ingresa los datos de la transferencia</li>
                      <li><strong>Yape/Plin:</strong> Verifica el pago en la app y confirma</li>
                    </ul>
                  </li>
                  <li>Verifica que los datos sean correctos</li>
                  <li>Haz clic en <strong>"Confirmar Pago"</strong></li>
                </ol>
              </div>
            </div>

            <!-- Combinar Pagos -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">6</span>
                Cómo Combinar Pagos
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Si el cliente desea pagar con múltiples métodos:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la ventana de pago, haz clic en <strong>"Agregar otro método de pago"</strong></li>
                  <li>Selecciona el primer método e ingresa el monto parcial</li>
                  <li>Haz clic en <strong>"Agregar"</strong></li>
                  <li>Selecciona el segundo método de pago</li>
                  <li>El sistema mostrará automáticamente el saldo pendiente</li>
                  <li>Ingresa el monto del segundo método</li>
                  <li>Puedes agregar más métodos si es necesario</li>
                  <li>Una vez completado el total, confirma la transacción</li>
                </ol>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                  <p class="text-sm text-blue-700">
                    <strong>Ejemplo:</strong> Si la venta es S/ 150 y el cliente paga S/ 100 en efectivo y S/ 50 con tarjeta, ingresa ambos métodos por separado.
                  </p>
                </div>
              </div>
            </div>

            <!-- Imprimir Ticket -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">7</span>
                Cómo Imprimir el Ticket
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Después de confirmar el pago:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>El sistema generará automáticamente el ticket de venta</li>
                  <li>Haz clic en <strong>"Imprimir Ticket"</strong></li>
                  <li>El ticket se enviará a la impresora configurada</li>
                  <li>Entrega el ticket al cliente</li>
                </ol>
                <p class="text-gray-700 mt-3">Si necesitas reimprimir un ticket:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve al módulo <strong>"Ventas"</strong></li>
                  <li>Busca la venta correspondiente</li>
                  <li>Haz clic en el icono de impresión</li>
                </ol>
              </div>
            </div>

            <!-- Enviar Comprobante -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">8</span>
                Enviar Constancia y Factura por Email
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Para enviar comprobantes electrónicos al cliente:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Después de confirmar el pago, aparecerá la opción <strong>"Enviar por Email"</strong></li>
                  <li>Solicita al cliente su correo electrónico</li>
                  <li>Ingresa el email en el campo correspondiente</li>
                  <li>Selecciona el tipo de documento:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Boleta:</strong> Para consumidores finales</li>
                      <li><strong>Factura:</strong> Requiere RUC y razón social del cliente</li>
                    </ul>
                  </li>
                  <li>Si es factura, completa los datos tributarios del cliente</li>
                  <li>Haz clic en <strong>"Enviar"</strong></li>
                  <li>El sistema confirmará cuando el email haya sido enviado</li>
                </ol>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                  <p class="text-sm text-blue-700">
                    <strong>Nota:</strong> Los comprobantes electrónicos son generados automáticamente por el sistema de facturación integrado.
                  </p>
                </div>
              </div>
            </div>

            <!-- Bloquear y Desbloquear -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">9</span>
                Cómo Bloquear y Desbloquear la Aplicación
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Por seguridad, puedes bloquear la aplicación temporalmente sin cerrar tu turno:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Bloquear la Aplicación</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En cualquier pantalla del sistema, busca el icono de <strong>"Candado"</strong> o <strong>"Bloquear"</strong> en la barra superior</li>
                  <li>También puedes usar el atajo de teclado <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + L</kbd> (Windows/Linux) o <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">⌘ + L</kbd> (Mac)</li>
                  <li>La aplicación se bloqueará inmediatamente</li>
                  <li>Aparecerá una pantalla de bloqueo mostrando tu nombre de usuario</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Desbloquear la Aplicación</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la pantalla de bloqueo, verás tu nombre de usuario</li>
                  <li>Ingresa tu <strong>PIN de cajero</strong> (4 dígitos) en el campo correspondiente</li>
                  <li>Haz clic en <strong>"Desbloquear"</strong> o presiona Enter</li>
                  <li>Si el PIN es correcto, volverás exactamente donde estabas</li>
                  <li>Todas las ventas en curso y datos se mantienen intactos</li>
                </ol>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <p class="text-sm text-yellow-700 mb-2">
                    <strong>Importante:</strong>
                  </p>
                  <ul class="list-disc list-inside text-sm text-yellow-700 ml-4 space-y-1">
                    <li>Bloquear NO cierra tu turno de caja</li>
                    <li>Las ventas en curso se mantienen guardadas</li>
                    <li>Nadie más puede acceder sin tu PIN</li>
                    <li>Si olvidas tu PIN, contacta a un supervisor o administrador</li>
                  </ul>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                  <p class="text-sm text-blue-700">
                    <strong>Cuándo usar el bloqueo:</strong>
                  </p>
                  <ul class="list-disc list-inside text-sm text-blue-700 ml-4 mt-2 space-y-1">
                    <li>Cuando te alejas temporalmente de tu puesto de trabajo</li>
                    <li>Durante pausas cortas o recesos</li>
                    <li>Para prevenir acceso no autorizado</li>
                    <li>Cuando otro empleado necesita usar tu computadora momentáneamente</li>
                  </ul>
                </div>

                <div class="bg-red-50 border-l-4 border-red-400 p-4 mt-3">
                  <p class="text-sm text-red-700 mb-2">
                    <strong>Diferencia entre Bloquear y Cerrar Turno:</strong>
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div class="bg-white p-3 rounded">
                      <p class="font-semibold text-gray-900 mb-1 text-sm">Bloquear</p>
                      <ul class="list-disc list-inside text-xs text-gray-700 space-y-1">
                        <li>Pausa temporal</li>
                        <li>Turno sigue abierto</li>
                        <li>Ventas se mantienen</li>
                        <li>Rápido de desbloquear</li>
                      </ul>
                    </div>
                    <div class="bg-white p-3 rounded">
                      <p class="font-semibold text-gray-900 mb-1 text-sm">Cerrar Turno</p>
                      <ul class="list-disc list-inside text-xs text-gray-700 space-y-1">
                        <li>Finaliza jornada</li>
                        <li>Requiere arqueo de caja</li>
                        <li>No puedes hacer más ventas</li>
                        <li>Proceso más largo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Intentos Fallidos de Desbloqueo</h4>
                <div class="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <p class="text-sm text-orange-700 mb-2">
                    Si ingresas un PIN incorrecto:
                  </p>
                  <ul class="list-disc list-inside text-sm text-orange-700 ml-4 space-y-1">
                    <li>El sistema te mostrará un mensaje de error</li>
                    <li>Después de 3 intentos fallidos, se notificará al supervisor</li>
                    <li>Después de 5 intentos fallidos, se cerrará la sesión automáticamente por seguridad</li>
                    <li>Deberás volver a hacer login con tus credenciales completas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Administrador Section -->
          <div v-show="activeSection === 'administrador'" class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Manual de Usuario Administrador</h2>
              <p class="text-gray-600">Guía de configuración y gestión del sistema</p>
            </div>

            <!-- Gestionar Usuarios -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Cómo Crear o Gestionar Usuarios
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Los administradores pueden gestionar los usuarios del sistema:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Crear un Nuevo Usuario</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve al menú principal y selecciona <strong>"Configuración"</strong></li>
                  <li>En el menú lateral, haz clic en <strong>"Usuarios"</strong></li>
                  <li>Presiona el botón <strong>"Nuevo Usuario"</strong></li>
                  <li>Completa los datos requeridos:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Nombre completo</li>
                      <li>Email (será su usuario de acceso)</li>
                      <li>Rol (Cajero, Supervisor o Administrador)</li>
                      <li>Sucursales a las que tendrá acceso</li>
                      <li>Contraseña inicial</li>
                    </ul>
                  </li>
                  <li>Haz clic en <strong>"Guardar"</strong></li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Editar un Usuario Existente</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la lista de usuarios, busca el usuario que deseas editar</li>
                  <li>Haz clic en el icono de edición (lápiz)</li>
                  <li>Modifica los datos necesarios</li>
                  <li>Guarda los cambios</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Desactivar un Usuario</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la lista de usuarios, localiza el usuario</li>
                  <li>Haz clic en el botón de estado (toggle)</li>
                  <li>Confirma la desactivación</li>
                  <li>El usuario ya no podrá acceder al sistema</li>
                </ol>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Importante:</strong> Asigna los roles correctamente. Los cajeros solo tienen acceso al POS y funciones básicas, mientras que los administradores tienen acceso completo.
                  </p>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Roles Disponibles:</h4>
                <div class="space-y-2 mt-2">
                  <div class="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
                    <p class="font-semibold text-gray-900">Cajero</p>
                    <p class="text-sm text-gray-700">Acceso a POS, ventas, inventario básico y gestión de turno</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                    <p class="font-semibold text-gray-900">Supervisor</p>
                    <p class="text-sm text-gray-700">Permisos de cajero + acceso a reportes, dashboard y gestión de promociones</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded border-l-4 border-purple-400">
                    <p class="font-semibold text-gray-900">Administrador</p>
                    <p class="text-sm text-gray-700">Acceso completo a todas las funciones del sistema, incluyendo configuración</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gestionar Sucursales -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Cómo Crear o Gestionar Sucursales
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Administra las sucursales de tu negocio:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Crear una Nueva Sucursal</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve a <strong>"Configuración"</strong> > <strong>"Sucursales"</strong></li>
                  <li>Haz clic en <strong>"Nueva Sucursal"</strong></li>
                  <li>Completa la información:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Nombre de la sucursal</li>
                      <li>Código o identificador único</li>
                      <li>Dirección completa</li>
                      <li>Teléfono</li>
                      <li>Email de contacto</li>
                      <li>Datos del responsable</li>
                    </ul>
                  </li>
                  <li>Guarda la sucursal</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Editar una Sucursal</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>En la lista de sucursales, busca la sucursal a editar</li>
                  <li>Haz clic en el icono de edición</li>
                  <li>Actualiza los datos necesarios</li>
                  <li>Guarda los cambios</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Configurar Almacenes por Sucursal</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Cada sucursal debe estar vinculada a un almacén de inventario</li>
                  <li>Al editar la sucursal, selecciona el almacén correspondiente</li>
                  <li>Esto permite que el sistema consulte el stock correcto al realizar ventas</li>
                </ol>

                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                  <p class="text-sm text-blue-700">
                    <strong>Nota:</strong> Es fundamental vincular correctamente cada sucursal con su almacén para evitar inconsistencias en el inventario.
                  </p>
                </div>
              </div>
            </div>

            <!-- Configuración NetSuite -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Configuración con Integración a NetSuite
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">El sistema POS está integrado con NetSuite para sincronizar información:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Configuración Inicial</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve a <strong>"Configuración"</strong> > <strong>"Preferencias"</strong></li>
                  <li>Busca la sección <strong>"Integración NetSuite"</strong></li>
                  <li>Verifica que la integración esté habilitada</li>
                  <li>Configura los parámetros de conexión (esto generalmente lo hace el equipo técnico)</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">¿Qué se Sincroniza con NetSuite?</h4>
                <div class="space-y-2 mt-2">
                  <div class="bg-gray-50 p-3 rounded">
                    <p class="font-semibold text-gray-900">Productos e Inventario</p>
                    <p class="text-sm text-gray-700">Los productos y su disponibilidad se consultan en tiempo real desde NetSuite</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <p class="font-semibold text-gray-900">Clientes</p>
                    <p class="text-sm text-gray-700">Los datos de clientes se sincronizan automáticamente</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <p class="font-semibold text-gray-900">Órdenes de Venta</p>
                    <p class="text-sm text-gray-700">Cada venta realizada en el POS se registra como una orden en NetSuite</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <p class="font-semibold text-gray-900">Comprobantes</p>
                    <p class="text-sm text-gray-700">Las facturas y boletas se generan automáticamente en NetSuite</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <p class="font-semibold text-gray-900">Precios</p>
                    <p class="text-sm text-gray-700">Los precios de productos se obtienen desde NetSuite según las listas configuradas</p>
                  </div>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Mapeo de Sucursales</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Cada sucursal en el POS debe estar mapeada a una ubicación (Location) en NetSuite</li>
                  <li>Al configurar una sucursal, ingresa el <strong>ID de Location de NetSuite</strong></li>
                  <li>Esto asegura que las ventas se registren en la ubicación correcta</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Cuentas de Cajero</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve a <strong>"Configuración"</strong> > <strong>"Cuentas de Cajero"</strong></li>
                  <li>Configura las cuentas de NetSuite para cada método de pago:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Efectivo</li>
                      <li>Tarjeta de crédito</li>
                      <li>Tarjeta de débito</li>
                      <li>Transferencia bancaria</li>
                      <li>Yape/Plin</li>
                    </ul>
                  </li>
                  <li>Estas cuentas se utilizan para registrar los pagos en NetSuite</li>
                </ol>

                <h4 class="font-semibold text-gray-900 mt-4">Verificación de Integración</h4>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Después de configurar, realiza una venta de prueba</li>
                  <li>Verifica en NetSuite que la orden se haya creado correctamente</li>
                  <li>Confirma que el inventario se haya actualizado</li>
                  <li>Revisa que el comprobante se haya generado</li>
                </ol>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Importante:</strong> Si hay errores en la sincronización, revisa los logs del sistema o contacta al soporte técnico. No modifiques manualmente los registros en NetSuite sin consultar primero.
                  </p>
                </div>

                <h4 class="font-semibold text-gray-900 mt-4">Solución de Problemas Comunes</h4>
                <div class="space-y-2 mt-2">
                  <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p class="font-semibold text-red-800">Error al consultar stock</p>
                    <p class="text-sm text-red-700">Verifica la conexión a internet y que NetSuite esté disponible</p>
                  </div>
                  <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p class="font-semibold text-red-800">Orden no se registra en NetSuite</p>
                    <p class="text-sm text-red-700">Revisa que el mapeo de sucursal y cuentas de cajero sean correctos</p>
                  </div>
                  <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p class="font-semibold text-red-800">Precios incorrectos</p>
                    <p class="text-sm text-red-700">Verifica que la lista de precios esté configurada correctamente en las preferencias</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reportes y Auditoría -->
            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span class="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                Reportes y Auditoría
              </h3>
              <div class="ml-11 space-y-3">
                <p class="text-gray-700">Como administrador, tienes acceso a diversos reportes:</p>

                <h4 class="font-semibold text-gray-900 mt-4">Dashboard</h4>
                <p class="text-gray-700">El dashboard te ofrece una vista general con:</p>
                <ul class="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Ventas del día, semana y mes</li>
                  <li>Productos más vendidos</li>
                  <li>Rendimiento por sucursal</li>
                  <li>Gráficos de tendencias</li>
                </ul>

                <h4 class="font-semibold text-gray-900 mt-4">Historial de Ventas</h4>
                <p class="text-gray-700">En el módulo de Ventas puedes:</p>
                <ul class="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Consultar todas las ventas realizadas</li>
                  <li>Filtrar por fecha, sucursal, cajero, cliente</li>
                  <li>Ver el detalle completo de cada venta</li>
                  <li>Reimprimir tickets</li>
                  <li>Exportar reportes</li>
                </ul>

                <h4 class="font-semibold text-gray-900 mt-4">Turnos de Caja</h4>
                <p class="text-gray-700">Revisa los turnos de todos los cajeros:</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ve al módulo <strong>"Turnos"</strong> (si está disponible en tu configuración)</li>
                  <li>Filtra por cajero, sucursal o fecha</li>
                  <li>Revisa faltantes o sobrantes de caja</li>
                  <li>Verifica las observaciones de los cajeros</li>
                </ol>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div v-show="activeSection === 'faq'" class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Preguntas Frecuentes</h2>
              <p class="text-gray-600">Respuestas a las dudas más comunes</p>
            </div>

            <div class="border-t pt-6 space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Qué hago si olvidé mi contraseña?</h3>
                <p class="text-gray-700">Contacta a tu administrador para que restablezca tu contraseña. Los cajeros también pueden pedir ayuda a su supervisor.</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Puedo cancelar una venta después de confirmarla?</h3>
                <p class="text-gray-700">Las ventas confirmadas solo pueden ser anuladas por un administrador o supervisor. Debes solicitar autorización.</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Cómo aplicar un descuento a un producto?</h3>
                <p class="text-gray-700">En el POS, selecciona el producto en el carrito y haz clic en el icono de descuento. Puedes aplicar un porcentaje o monto fijo (según los permisos de tu rol).</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Qué hago si la impresora no funciona?</h3>
                <p class="text-gray-700">Verifica que la impresora esté encendida y conectada. Si el problema persiste, puedes enviar el comprobante por email al cliente y solicitar soporte técnico.</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Puedo tener múltiples ventas abiertas al mismo tiempo?</h3>
                <p class="text-gray-700">Sí, el sistema permite mantener varias ventas en progreso. Puedes pausar una venta y continuar con otra, retomándola más tarde desde el POS.</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Cómo busco un producto rápidamente?</h3>
                <p class="text-gray-700">Puedes buscar por nombre, código de producto o escanear el código de barras. También puedes usar las categorías para navegar el catálogo.</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">¿Qué hago si el sistema está lento?</h3>
                <p class="text-gray-700">Verifica tu conexión a internet. Si el problema persiste, cierra y vuelve a abrir el navegador. Si continúa lento, contacta al soporte técnico.</p>
              </div>
            </div>
          </div>

          <!-- Soporte Section -->
          <div v-show="activeSection === 'soporte'" class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Soporte Técnico</h2>
              <p class="text-gray-600">¿Necesitas ayuda adicional?</p>
            </div>

            <div class="border-t pt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <h3 class="text-lg font-semibold text-blue-900 mb-3">Contacto</h3>
                  <div class="space-y-2 text-sm">
                    <p class="text-blue-800"><strong>Email:</strong> soporte@mitienda.pe</p>
                    <p class="text-blue-800"><strong>Teléfono:</strong> (01) 123-4567</p>
                    <p class="text-blue-800"><strong>WhatsApp:</strong> +51 999 888 777</p>
                    <p class="text-blue-800"><strong>Horario:</strong> Lun-Vie 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <h3 class="text-lg font-semibold text-green-900 mb-3">Recursos Adicionales</h3>
                  <div class="space-y-2">
                    <a href="https://docs.mitienda.pe" target="_blank" class="block text-sm text-green-800 hover:text-green-900 hover:underline">
                      → Documentación completa
                    </a>
                    <a href="https://docs.mitienda.pe/videos" target="_blank" class="block text-sm text-green-800 hover:text-green-900 hover:underline">
                      → Video tutoriales
                    </a>
                    <a href="https://docs.mitienda.pe/changelog" target="_blank" class="block text-sm text-green-800 hover:text-green-900 hover:underline">
                      → Novedades y actualizaciones
                    </a>
                  </div>
                </div>
              </div>

              <div class="mt-6 bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                <h3 class="text-lg font-semibold text-yellow-900 mb-3">Antes de Contactar Soporte</h3>
                <p class="text-sm text-yellow-800 mb-2">Para agilizar la atención, ten a mano:</p>
                <ul class="list-disc list-inside space-y-1 text-sm text-yellow-800 ml-4">
                  <li>Nombre de usuario y sucursal</li>
                  <li>Descripción detallada del problema</li>
                  <li>Capturas de pantalla si es posible</li>
                  <li>Pasos que realizaste antes del error</li>
                  <li>Mensajes de error que aparecieron</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeSection = ref('cajero');

const sections = [
  { id: 'cajero', title: 'Manual Cajero' },
  { id: 'administrador', title: 'Manual Administrador' },
  { id: 'faq', title: 'Preguntas Frecuentes' },
  { id: 'soporte', title: 'Soporte Técnico' }
];
</script>

<style scoped>
/* Scrollbar personalizado para mejorar la experiencia */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
