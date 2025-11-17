<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div
        class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Añadir Pago</h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Resumen de la venta -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between mb-2">
                  <span class="font-medium">Total original:</span>
                  <span class="font-bold text-lg">{{ formatCurrency(total) }}</span>
                </div>
                <!-- 🔧 FIX: Mostrar redondeo SOLO si hay pago en efectivo aplicado O si el método seleccionado es efectivo -->
                <div v-if="roundingToDisplay !== 0" class="flex justify-between mb-2 text-xs border-t border-dashed border-gray-300 pt-1">
                  <span>{{ roundingToDisplay > 0 ? 'Redondeo (+):' : 'Redondeo (-):' }}</span>
                  <span :class="roundingToDisplay > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ formatCurrency(Math.abs(roundingToDisplay)) }}
                  </span>
                </div>
                <div class="flex justify-between mb-2" :class="roundingToDisplay !== 0 ? 'border-t border-gray-300 pt-2' : ''">
                  <span class="font-medium">Total a pagar:</span>
                  <span class="font-bold text-lg">{{ formatCurrency(totalToPayDisplay) }}</span>
                </div>
                <div class="flex justify-between mb-2 border-t border-gray-300 pt-2">
                  <span class="font-medium">Saldo pendiente:</span>
                  <span class="font-bold text-lg" :class="remainingAmount === 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(remainingAmountDisplay) }}
                  </span>
                </div>
                <div v-if="customer" class="text-sm text-gray-600">
                  Cliente: {{ customer.name }}
                </div>
              </div>

              <!-- Selección de método de pago -->
              <div class="mb-4">
                <div class="font-medium mb-2">Método de pago:</div>
                <div class="grid grid-cols-3 gap-3">
                  <button @click="selectPaymentMethod('efectivo')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'efectivo'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M6 12h.01M18 12h.01"></path>
                    </svg>
                    Efectivo
                  </button>
                  <button @click="selectPaymentMethod('tarjeta')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'tarjeta'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Tarjeta
                  </button>
                  <button @click="selectPaymentMethod('qr')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'qr'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <rect x="7" y="7" width="3" height="3"></rect>
                      <rect x="14" y="7" width="3" height="3"></rect>
                      <rect x="7" y="14" width="3" height="3"></rect>
                      <rect x="14" y="14" width="3" height="3"></rect>
                    </svg>
                    QR
                  </button>
                  <button @click="selectPaymentMethod('credito')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'credito'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                      <path d="M7 21h10" />
                      <path d="M12 3v18" />
                      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                    </svg>

                    Crédito
                  </button>
                  <button @click="selectPaymentMethod('giftcard')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'giftcard'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>

                    Gift Card
                  </button>
                  <button @click="selectPaymentMethod('puntos')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'puntos'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>

                    Puntos
                  </button>
                  <button @click="selectPaymentMethod('link')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'link'
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>

                    Link
                  </button>
                  <button @click="selectPaymentMethod('nota_credito')" :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    paymentMethod === 'nota_credito'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-800'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>

                    Nota C.
                  </button>
                </div>
              </div>

              <div v-if="paymentMethod" class="mb-4 p-3 border rounded-lg">
                <!-- Campos específicos según el método de pago -->
                <div v-if="paymentMethod === 'efectivo'" class="mb-3">
                  <!-- Sugerencias de montos óptimos -->
                  <div v-if="paymentSuggestions.length > 0" class="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="text-xs font-medium text-blue-900 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      Montos sugeridos (minimiza vuelto):
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                      <button
                        v-for="(suggestion, index) in paymentSuggestions.slice(0, 6)"
                        :key="index"
                        @click="applySuggestion(suggestion)"
                        tabindex="-1"
                        :class="[
                          'px-2 py-1 text-xs rounded transition-colors',
                          suggestion.optimal
                            ? 'bg-green-100 hover:bg-green-200 border border-green-400 text-green-900 font-medium'
                            : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
                        ]"
                        type="button"
                      >
                        <div class="font-medium">S/ {{ suggestion.amount.toFixed(2) }}</div>
                        <div class="text-[10px] leading-tight" :class="suggestion.optimal ? 'text-green-700' : 'text-gray-500'">
                          {{ suggestion.change === 0 ? 'Exacto' : `Vuelto: ${suggestion.change.toFixed(2)}` }}
                        </div>
                      </button>
                    </div>
                  </div>

                  <RightToLeftMoneyInput v-model="cashAmount" label="Monto Entregado"
                    helpText="Ingrese el monto entregado por el cliente" />

                  <!-- Validaciones y advertencias -->
                  <div v-if="cashValidation && cashAmount > 0" class="mt-2">
                    <!-- Errores -->
                    <div v-if="cashValidation.errors.length > 0" class="text-xs text-red-600 mb-1">
                      <div v-for="(error, idx) in cashValidation.errors" :key="idx" class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {{ error }}
                      </div>
                    </div>

                    <!-- Advertencias -->
                    <div v-if="cashValidation.warnings.length > 0" class="text-xs text-amber-600 mb-1">
                      <div v-for="(warning, idx) in cashValidation.warnings" :key="idx" class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        {{ warning }}
                      </div>
                    </div>
                  </div>

                  <!-- Información del cambio -->
                  <div class="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium">Cambio:</span>
                      <span class="text-sm font-bold" :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ formatCurrency(change) }}
                      </span>
                    </div>

                    <!-- Desglose del vuelto -->
                    <div v-if="changeBreakdownDisplay && changeBreakdownDisplay.breakdown.length > 0" class="text-xs text-gray-600 mt-1">
                      <div class="font-medium mb-1">Desglose del vuelto:</div>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(item, idx) in changeBreakdownDisplay.breakdown"
                          :key="idx"
                          class="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]"
                        >
                          {{ item.count }}x {{ formatDenomination(item.value) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="paymentMethod === 'tarjeta'" class="mb-3">
                  <RightToLeftMoneyInput v-model="paymentAmount" label="Monto cargado"
                    helpText="Ingrese el monto cargado por la tarjeta" />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Código de autorización</label>
                  <input type="text" v-model="cardCode"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- QR -->
                <div v-if="paymentMethod === 'qr'" class="mb-3">
                  <RightToLeftMoneyInput v-model="paymentAmount" label="Monto pagado"
                    helpText="Ingrese el monto pagado por el cliente" />
                  <div class="text-center mt-3">
                    <div class="mb-2 font-medium">Escanea para pagar</div>
                    <div class="flex justify-center mb-3">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=POS2-Payment"
                        alt="QR Code" class="border p-2 rounded-lg" />
                    </div>
                    <div class="text-sm text-gray-600">
                      Este es un QR ficticio para demostración
                    </div>
                  </div>
                </div>

                <div v-if="paymentMethod === 'giftcard'" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto a cargar</label>
                  <input type="number" v-model="paymentAmount"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01" />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Código de Gift Card</label>
                  <input type="text" v-model="giftCardCode"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="flex flex-col gap-3 mt-6">
                <button v-if="paymentMethod" @click="addPayment" :class="[
                  'btn py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center',
                  isPaymentValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]" :disabled="!isPaymentValid">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Añadir Pago
                </button>

                <button @click="closeModal"
                  class="btn py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors duration-200 flex items-center justify-center">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación y ticket -->
  <div v-if="showTicket" class="fixed z-20 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div
        class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Columna izquierda: Ticket -->
            <div>
              <!-- Ticket -->
              <div id="ticket-print-area" class="mb-4 p-4 border rounded-lg bg-gray-50 font-mono text-sm">
                <div class="text-center mb-3">
                  <div class="font-bold text-lg">COMPROBANTE DE VENTA</div>
                  <div class="font-semibold mt-2">N° {{ displayOrderNumber }}</div>
                  <div>Fecha: {{ displayOrderDate }}</div>
                  <div v-if="displayCajero" class="text-xs mt-1">Atendido por: {{ displayCajero }}</div>
                </div>

                <div v-if="displayCustomer && (displayCustomer.name || displayCustomer.nombres || displayCustomer.document_number)" class="mb-3 border-t border-b border-gray-300 py-2">
                  <div><strong>Cliente:</strong> {{ displayCustomer.name || displayCustomer.razonSocial || `${displayCustomer.nombres || ''} ${displayCustomer.apellidos || ''}`.trim() || 'Cliente General' }}</div>
                  <div v-if="displayCustomer.document_number">
                    <strong>{{ (displayCustomer.document_type || 'dni').toUpperCase() }}:</strong> {{ displayCustomer.document_number }}
                  </div>
                  <div v-if="displayCustomer.email" class="text-xs">Email: {{ displayCustomer.email }}</div>
                  <div v-if="displayCustomer.phone" class="text-xs">Tel: {{ displayCustomer.phone }}</div>
                </div>

                <div class="mb-3">
                  <div class="border-b border-gray-300 pb-1 mb-1 font-bold flex">
                    <span class="w-1/2">Producto</span>
                    <span class="w-1/6 text-right">Cant.</span>
                    <span class="w-1/6 text-right">P.Unit</span>
                    <span class="w-1/6 text-right">Total</span>
                  </div>
                  <div v-for="(item, index) in displayItems" :key="index" class="flex text-xs py-1">
                    <span class="w-1/2 truncate">{{ item.nombre }}</span>
                    <span class="w-1/6 text-right">{{ item.quantity }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio) }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio * item.quantity) }}</span>
                  </div>
                </div>

                <div class="border-t border-gray-300 pt-1">
                  <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(displaySubtotal) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>IGV (18%):</span>
                    <span>{{ formatCurrency(displayTax) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{{ formatCurrency(displayTotal) }}</span>
                  </div>
                  <!-- Redondeo (solo si aplica) -->
                  <div v-if="roundingApplied !== 0" class="flex justify-between text-xs mt-1 border-t border-dashed border-gray-300 pt-1">
                    <span>{{ roundingApplied > 0 ? 'Redondeo (+):' : 'Redondeo (-):' }}</span>
                    <span :class="roundingApplied > 0 ? 'text-red-600' : 'text-green-600'">
                      {{ formatCurrency(Math.abs(roundingApplied)) }}
                    </span>
                  </div>
                  <div v-if="roundingApplied !== 0" class="flex justify-between font-bold text-sm border-t border-gray-300 pt-1 mt-1">
                    <span>Total a Pagar:</span>
                    <span>{{ formatCurrency(displayTotal + roundingApplied) }}</span>
                  </div>
                  <div class="mt-2 border-t border-gray-300 pt-2">
                    <div class="font-semibold mb-1">Forma de pago:</div>
                    <div v-for="(payment, index) in displayPayments" :key="index" class="mb-2">
                      <div class="flex justify-between">
                        <span class="font-medium">{{ getPaymentMethodName(payment.method) }}:</span>
                        <span class="font-bold">{{ formatCurrency(payment.amount) }}</span>
                      </div>

                      <!-- Detalles para pago en efectivo -->
                      <div v-if="payment.method === 'efectivo'" class="text-black mt-1 space-y-0.5">
                        <!-- Mostrar monto entregado si hay cambio -->
                        <div v-if="payment.reference && payment.reference.includes('Cambio:')">
                          <div class="flex justify-between">
                            <span>Monto entregado:</span>
                            <span>{{ formatCurrency(payment.amount + parseChangeFromReference(payment.reference)) }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>Cambio:</span>
                            <span>{{ formatCurrency(parseChangeFromReference(payment.reference)) }}</span>
                          </div>
                        </div>
                        <!-- Pago parcial -->
                        <div v-else-if="payment.reference && payment.reference.includes('Pago parcial')">
                          <span>{{ payment.reference }}</span>
                        </div>
                        <!-- Pago exacto -->
                        <div v-else-if="payment.reference === 'Pago exacto'">
                          <span>Pago exacto</span>
                        </div>
                      </div>

                      <!-- Referencia para otros métodos -->
                      <div v-if="payment.method !== 'efectivo' && payment.reference" class="text-xs text-gray-600 ml-4">
                        {{ payment.reference }}
                      </div>
                    </div>

                    <!-- Total pagado -->
                    <div class="mt-2 pt-2 border-t border-gray-300">
                      <div class="flex justify-between font-bold">
                        <span>Total pagado:</span>
                        <span>{{ formatCurrency(totalPaid) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-3 text-xs">
                  <div>¡Gracias por su compra!</div>
                  <div>Visite nuestra página web: www.ejemplo.com</div>
                </div>

                <!-- QR Code para impresión (oculto en pantalla) -->
                <div v-if="displayBillingDocument?.files?.pdf" class="qr-print-only text-center mt-3" style="display: none;">
                  <div class="text-xs mb-1">
                    Comprobante Electrónico
                    <span v-if="displayBillingDocument?.serie">
                      {{ displayBillingDocument.serie }}-{{ displayBillingDocument.correlative }}
                    </span>
                  </div>
                  <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(displayBillingDocument.files.pdf)}`"
                       alt="QR Comprobante"
                       style="width: 100px; height: 100px; margin: 0 auto;" />
                  <div class="text-xs mt-1">Escanea para ver el PDF</div>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Botones de acción -->
            <div class="flex flex-col gap-4">
              <!-- Header con título y botón cerrar -->
              <div class="flex justify-between items-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Pago Completado</h3>
                <button @click="closeTicket" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Botón Finalizar -->
              <button
                class="w-full py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                @click="finalizeSale">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Finalizar
              </button>

              <!-- Botón Imprimir Ticket -->
              <button
                class="w-full py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl"
                @click="printTicketDirect">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimir Ticket
              </button>

              <!-- Botón Abrir PDF -->
              <button
                v-if="displayBillingDocument?.files?.pdf"
                class="w-full py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                @click="printTicket">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Abrir PDF
                <span v-if="displayBillingDocument?.serie" class="ml-2 text-xs opacity-75">
                  ({{ displayBillingDocument.serie }}-{{ displayBillingDocument.correlative }})
                </span>
              </button>

              <!-- Divisor -->
              <div class="border-t border-gray-300 my-2"></div>

              <!-- Botones para compartir el ticket -->
              <div>
                <div class="mb-3">
                  <button v-if="!showEmailForm"
                    class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                    @click="displayCustomer?.email ? sendByEmail() : showEmailForm = true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Enviar por Email
                  </button>

                  <div v-if="showEmailForm" class="border rounded-lg p-3 bg-gray-50">
                    <div class="flex justify-between items-center mb-2">
                      <h4 class="font-medium">Enviar por Email</h4>
                      <button @click="showEmailForm = false"
                        class="text-gray-400 hover:text-gray-500 focus:outline-none">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="mb-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" v-model="emailAddress"
                        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ejemplo@correo.com" />
                    </div>
                    <button
                      class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
                      @click="sendByEmail" :disabled="!isValidEmail"
                      :class="isValidEmail ? '' : 'opacity-50 cursor-not-allowed'">
                      Enviar
                    </button>
                  </div>
                </div>

                <div v-if="displayCustomer?.phone && displayBillingDocument?.files?.pdf">
                  <button
                    class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                    @click="sendByWhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                      <path
                        d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1">
                      </path>
                    </svg>
                    Enviar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import RightToLeftMoneyInput from './RightToLeftMoneyInput.vue';
import {
  suggestOptimalPayments,
  validateCashPayment,
  calculateChangeBreakdown,
  roundToValidAmount
} from '../utils/cashDenominations.js';

const cartStore = useCartStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  customer: {
    type: Object,
    default: null
  },
  items: {
    type: Array,
    required: true
  },
  payments: {
    type: Array,
    required: true
  },
  documentType: {
    type: String,
    default: 'boleta'
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  showTicket: {
    type: Boolean,
    default: false
  },
  completedSaleData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'payment-added', 'sale-finalized', 'update:show-ticket']);

// Estado del formulario
const paymentMethod = ref('');
const paymentAmount = ref(0);
const cashAmount = ref(0);
const change = ref(0);
const cardCode = ref('');
const giftCardCode = ref('');
const currentReference = ref('');
const showTicket = ref(props.showTicket);
const showEmailForm = ref(false);
const emailAddress = ref('');

// Estados para sugerencias y validaciones de efectivo
const paymentSuggestions = ref([]);
const cashValidation = ref(null);
const changeBreakdownDisplay = ref(null);

// Computed properties que usan el snapshot cuando está disponible (para el ticket)
// o los datos en vivo cuando no lo está (para el modal de pago)
const displayCustomer = computed(() => {
  return props.completedSaleData?.customer || props.customer;
});

const displayItems = computed(() => {
  return props.completedSaleData?.items || props.items;
});

const displayPayments = computed(() => {
  return props.completedSaleData?.payments || props.payments;
});

const displaySubtotal = computed(() => {
  return props.completedSaleData?.subtotal ?? props.subtotal;
});

const displayTax = computed(() => {
  return props.completedSaleData?.tax ?? props.tax;
});

const displayTotal = computed(() => {
  return props.completedSaleData?.total ?? props.total;
});

const displayDocumentType = computed(() => {
  return props.completedSaleData?.documentType || props.documentType;
});

const displayOrderNumber = computed(() => {
  return props.completedSaleData?.orderNumber || 'N/A';
});

const displayOrderDate = computed(() => {
  if (props.completedSaleData?.createdAt) {
    return new Date(props.completedSaleData.createdAt).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const displayCajero = computed(() => {
  return props.completedSaleData?.cajero || '';
});

const displayBillingDocument = computed(() => {
  return props.completedSaleData?.billingDocument || null;
});

// Validaciones
const isPaymentValid = computed(() => {
  if (!paymentMethod.value) return false;

  // Validar que el monto sea mayor que cero
  if (paymentMethod.value === 'efectivo' && cashAmount.value <= 0) {
    return false;
  }

  if (paymentMethod.value !== 'efectivo' && paymentAmount.value <= 0) {
    return false;
  }

  // Para efectivo, validar que sea un pago válido (sin errores de validación)
  if (paymentMethod.value === 'efectivo' && cashValidation.value) {
    if (cashValidation.value.errors.length > 0) {
      return false;
    }
  }

  // Validar campos específicos por método de pago
  if (paymentMethod.value === 'tarjeta' && !cardCode.value) {
    return false;
  }

  if (paymentMethod.value === 'giftcard' && !giftCardCode.value) {
    return false;
  }

  return true;
});

const isValidEmail = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(emailAddress.value);
});

// Métodos
const selectPaymentMethod = (method) => {
  paymentMethod.value = method;

  // Reiniciar los campos
  paymentAmount.value = 0;
  cashAmount.value = 0;
  change.value = 0;
  currentReference.value = '';
  cardCode.value = '';
  giftCardCode.value = '';
  cashValidation.value = null;
  changeBreakdownDisplay.value = null;

  // Si es efectivo, generar sugerencias de pago usando el saldo con redondeo
  if (method === 'efectivo') {
    // 🔧 FIX: Usar remainingAmountDisplay que incluye redondeo para efectivo
    paymentSuggestions.value = suggestOptimalPayments(remainingAmountDisplay.value);
    console.log('💡 [PaymentModal] Sugerencias de pago generadas:', paymentSuggestions.value);
  } else {
    paymentSuggestions.value = [];
  }
};

const calculateChange = () => {
  // NO redondear cashAmount mientras el usuario escribe
  // Solo usar el valor ingresado tal cual

  // 🔧 FIX: Usar remainingAmountDisplay que incluye el redondeo si es efectivo
  const amountDue = remainingAmountDisplay.value;

  // El monto del pago es el total restante (lo que se debe cobrar)
  paymentAmount.value = amountDue;

  // El cambio es lo que sobra del efectivo entregado
  const rawChange = cashAmount.value - amountDue;
  change.value = Math.max(0, roundToValidAmount(rawChange));

  // Validar el pago en efectivo
  cashValidation.value = validateCashPayment(cashAmount.value, amountDue);

  // Calcular desglose del vuelto
  if (change.value > 0) {
    changeBreakdownDisplay.value = calculateChangeBreakdown(change.value);
    console.log('💵 [PaymentModal] Desglose del vuelto:', changeBreakdownDisplay.value);
  } else {
    changeBreakdownDisplay.value = null;
  }
};

const applySuggestion = (suggestion) => {
  console.log('✨ [PaymentModal] Aplicando sugerencia:', suggestion);
  cashAmount.value = suggestion.amount;
  // calculateChange se ejecutará automáticamente por el watcher
};

// Helper para extraer el monto del cambio de la referencia
const parseChangeFromReference = (reference) => {
  if (!reference || !reference.includes('Cambio:')) return 0;

  // Extraer el monto del cambio de la referencia
  // Formato: "Cambio: S/ X.XX" o "Cambio: S/ X.XX (desglose)"
  const match = reference.match(/Cambio:\s*S\/\s*([\d,]+\.?\d*)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
};

const formatDenomination = (value) => {
  if (value >= 1) {
    return `S/ ${value}`;
  } else {
    return `S/ ${value.toFixed(2)}`;
  }
};

const getPaymentMethodName = (method) => {
  const methods = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta de crédito/débito',
    'qr': 'Pago con QR',
    'credito': 'Crédito',
    'giftcard': 'Gift Card',
    'puntos': 'Puntos'
  };

  return methods[method] || '';
};

const addPayment = () => {
  let reference = '';
  let amount = 0;
  let roundingAmount = 0;

  switch (paymentMethod.value) {
    case 'efectivo':
      // 🔧 FIX: Usar remainingAmountDisplay que incluye redondeo para efectivo
      const amountDue = remainingAmountDisplay.value;

      // 🔧 CRITICAL FIX: Para pagos en efectivo con redondeos pequeños (0.01-0.09),
      // el monto del pago debe cubrir EXACTAMENTE el saldo pendiente redondeado
      // para que no quede ningún residuo

      // Si el usuario entrega exactamente el monto debido (o menos), registrar exactamente el monto debido
      if (cashAmount.value <= amountDue) {
        // Pago parcial o exacto: registrar el monto debido completo si el usuario dio suficiente
        amount = amountDue;
      } else {
        // Pago con cambio: registrar el monto debido
        amount = amountDue;
      }

      // Calcular cambio solo si el monto entregado excede el saldo
      const changeValue = cashAmount.value - amountDue;

      if (changeValue > 0) {
        reference = `Cambio: ${formatCurrency(changeValue)}`;

        // Agregar desglose del vuelto a la referencia si existe
        if (changeBreakdownDisplay.value && changeBreakdownDisplay.value.breakdown.length > 0) {
          const breakdown = changeBreakdownDisplay.value.breakdown
            .map(item => `${item.count}x${formatDenomination(item.value)}`)
            .join(', ');
          reference += ` (${breakdown})`;
        }
      } else if (changeValue < 0) {
        // Pago parcial: el usuario no entregó suficiente
        // En este caso, registrar solo lo que entregó
        amount = cashAmount.value;
        reference = `Pago parcial: S/ ${cashAmount.value.toFixed(2)}`;
      } else {
        reference = 'Pago exacto';
      }

      // 🔧 FIX: Solo calcular y pasar redondeo si es el primer pago
      // El redondeo se calcula aquí si no hay pagos previos
      if (props.payments.length === 0 && roundingToDisplay.value !== 0) {
        roundingAmount = roundingToDisplay.value;
      }

      console.log('💰 [PaymentModal] Calculando pago en efectivo:', {
        montoIngresado: cashAmount.value,
        saldoPendiente: amountDue,
        montoAPagar: amount,
        cambio: changeValue,
        redondeo: roundingAmount,
        esPagoCompleto: changeValue >= 0
      });
      break;

    case 'tarjeta':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = `Auth: ${cardCode.value}`;
      break;
    case 'qr':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = 'QR';
      break;
    case 'giftcard':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = `GC: ${giftCardCode.value}`;
      break;
    default:
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      reference = '';
  }

  console.log('💳 [PaymentModal] Agregando pago:', {
    method: paymentMethod.value,
    amount,
    reference,
    roundingAmount,
    roundingAmountType: typeof roundingAmount,
    isEfectivo: paymentMethod.value === 'efectivo',
    isDifferentFromZero: roundingAmount !== 0
  });

  // Emitir el evento con los datos del pago
  const paymentData = {
    method: paymentMethod.value,
    methodName: getPaymentMethodName(paymentMethod.value),
    amount: amount,
    reference: reference
  };

  // Agregar redondeo solo si es efectivo y hay redondeo
  console.log('🔍 [PaymentModal] Verificando si agregar roundingAmount:', {
    method: paymentMethod.value,
    roundingAmount,
    shouldAdd: paymentMethod.value === 'efectivo' && roundingAmount !== 0
  });

  if (paymentMethod.value === 'efectivo' && roundingAmount !== 0) {
    paymentData.roundingAmount = roundingAmount;
    console.log('✅ [PaymentModal] roundingAmount agregado al paymentData');
  } else {
    console.log('❌ [PaymentModal] roundingAmount NO agregado');
  }

  console.log('📤 [PaymentModal] Emitiendo payment-added con:', paymentData);
  emit('payment-added', paymentData);

  // Siempre cerrar el modal después de agregar el pago
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
  // Solo resetear el formulario, no la venta completa
  resetForm();
};

const closeTicket = () => {
  showTicket.value = false;
  emit('update:show-ticket', false);
};

const resetForm = () => {
  paymentMethod.value = '';
  paymentAmount.value = 0;
  cashAmount.value = 0;
  change.value = 0;
  cardCode.value = '';
  giftCardCode.value = '';
  currentReference.value = '';
  showTicket.value = false;
  showEmailForm.value = false;
  emailAddress.value = '';
  paymentSuggestions.value = [];
  cashValidation.value = null;
  changeBreakdownDisplay.value = null;
};

// Propiedades computadas para el ticket
const totalPaid = computed(() => {
  const payments = displayPayments.value || [];
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
});

const totalChange = computed(() => {
  const payments = displayPayments.value || [];
  const cashPayments = payments.filter(p => p.method === 'efectivo');
  let totalChangeAmount = 0;

  cashPayments.forEach(payment => {
    // Extraer el cambio de la referencia
    const match = payment.reference?.match(/Cambio: S\/\s*([\d.]+)/);
    if (match) {
      totalChangeAmount += parseFloat(match[1]);
    }
  });

  return Math.round(totalChangeAmount * 100) / 100;
});

// 🔧 FIX: Calcular redondeo SOLO para efectivo
// Si ya hay un pago en efectivo registrado, usar ese redondeo
// Si el método seleccionado es efectivo y es el primer pago, calcular redondeo anticipado
const roundingToDisplay = computed(() => {
  // 1. Si ya hay redondeo aplicado (pago en efectivo registrado), mostrarlo
  if (cartStore.appliedRounding !== 0) {
    console.log('🔍 [PaymentModal] Usando redondeo ya aplicado:', cartStore.appliedRounding);
    return cartStore.appliedRounding;
  }

  // 2. Si el método seleccionado es efectivo Y no hay pagos previos, calcular redondeo anticipado
  if (paymentMethod.value === 'efectivo' && props.payments.length === 0) {
    const totalBeforeRounding = props.total;
    const roundedTotal = Math.round(totalBeforeRounding * 10) / 10; // roundToValidAmount
    const rounding = Math.round((roundedTotal - totalBeforeRounding) * 100) / 100;
    console.log('🔍 [PaymentModal] Calculando redondeo anticipado:', {
      totalOriginal: totalBeforeRounding,
      totalRedondeado: roundedTotal,
      redondeo: rounding
    });
    return rounding;
  }

  // 3. En cualquier otro caso (tarjeta, QR, etc.), NO mostrar redondeo
  return 0;
});

// Total a pagar considerando redondeo (solo si aplica)
const totalToPayDisplay = computed(() => {
  return props.total + roundingToDisplay.value;
});

// Saldo pendiente considerando redondeo (solo si aplica)
const remainingAmountDisplay = computed(() => {
  if (roundingToDisplay.value !== 0) {
    // Si hay redondeo a mostrar, usar el total redondeado
    const totalToPay = totalToPayDisplay.value;
    const totalPaidAmount = props.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, Math.round((totalToPay - totalPaidAmount) * 100) / 100);
    console.log('🔍 [PaymentModal] remainingAmountDisplay con redondeo:', {
      totalToPay,
      totalPaidAmount,
      remaining,
      roundingToDisplay: roundingToDisplay.value
    });
    return remaining;
  }
  // Si no hay redondeo, usar remainingAmount normal
  console.log('🔍 [PaymentModal] remainingAmountDisplay sin redondeo:', props.remainingAmount);
  return props.remainingAmount;
});

const roundingApplied = computed(() => {
  // Para el ticket: buscar el redondeo en el primer pago de efectivo
  const payments = displayPayments.value || [];
  const cashPayment = payments.find(p => p.method === 'efectivo');
  return cashPayment?.roundingAmount || cartStore.appliedRounding;
});

const printTicket = () => {
  // Si hay un PDF del comprobante electrónico, abrirlo en nueva pestaña
  if (displayBillingDocument.value?.files?.pdf) {
    console.log('📄 [PaymentModal] Opening billing document PDF:', displayBillingDocument.value.files.pdf);
    window.open(displayBillingDocument.value.files.pdf, '_blank');
  } else {
    // Si no hay PDF, usar window.print() para imprimir la página actual
    console.log('🖨️ [PaymentModal] No PDF available, using window.print()');
    window.print();
  }
};

const printTicketDirect = () => {
  // Imprimir solo el contenido del ticket
  console.log('🖨️ [PaymentModal] Printing ticket directly');

  const ticketElement = document.getElementById('ticket-print-area');
  if (!ticketElement) {
    console.error('❌ [PaymentModal] Ticket element not found');
    return;
  }

  // Crear una ventana de impresión con solo el contenido del ticket
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    console.error('❌ [PaymentModal] Could not open print window');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket de Venta</title>
      <style>
        @media print {
          @page {
            margin: 0.5cm;
            size: 80mm auto;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          max-width: 80mm;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: bold;
        }
        .text-lg {
          font-size: 16px;
        }
        .text-xs {
          font-size: 10px;
        }
        .text-sm {
          font-size: 11px;
        }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 0.75rem; }
        .pb-1 { padding-bottom: 0.25rem; }
        .pt-1 { padding-top: 0.25rem; }
        .pt-2 { padding-top: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .border-t { border-top: 1px solid #ccc; }
        .border-b { border-bottom: 1px solid #ccc; }
        .border-dashed { border-style: dashed; }
        .flex {
          display: flex;
        }
        .justify-between {
          justify-content: space-between;
        }
        .text-right {
          text-align: right;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .w-1-2 { width: 50%; }
        .w-1-6 { width: 16.666%; }
        .space-y-0-5 > * + * {
          margin-top: 0.125rem;
        }
        /* Mostrar QR code solo en impresión */
        .qr-print-only {
          display: block !important;
        }
        .qr-print-only img {
          display: block !important;
        }
      </style>
    </head>
    <body>
      ${ticketElement.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Esperar a que se cargue el contenido antes de imprimir
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

const finalizeSale = () => {
  // Emitir evento para finalizar la venta
  emit('sale-finalized');
  closeModal();
};

const sendByEmail = () => {
  // Si hay email del cliente, usarlo directamente
  const customerEmail = displayCustomer.value?.email;

  if (customerEmail) {
    // Usar el email del cliente automáticamente
    console.log(`Enviando ticket por email a: ${customerEmail}`);
    // Aquí iría la lógica para enviar el email
    alert(`Ticket enviado por email a ${customerEmail}`);
    return;
  }

  // Si no hay email del cliente, validar el email ingresado manualmente
  if (!isValidEmail.value) return;

  console.log(`Enviando ticket por email a: ${emailAddress.value}`);
  // Aquí iría la lógica para enviar el email

  // Mostrar mensaje de éxito y cerrar el formulario
  alert(`Ticket enviado por email a ${emailAddress.value}`);
  showEmailForm.value = false;
  emailAddress.value = '';
};

const sendByWhatsApp = () => {
  // Obtener datos del comprobante y cliente
  const phone = displayCustomer.value?.phone;
  const pdfUrl = displayBillingDocument.value?.files?.pdf;
  const serie = displayBillingDocument.value?.serie;
  const correlative = displayBillingDocument.value?.correlative;
  const total = displayTotal.value;

  if (!phone || !pdfUrl) {
    console.error('No hay teléfono o PDF disponible');
    return;
  }

  // Limpiar número de teléfono (remover espacios y caracteres especiales)
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Agregar código de país +51 (Perú) si no lo tiene
  if (!cleanPhone.startsWith('51') && !cleanPhone.startsWith('+51')) {
    cleanPhone = '51' + cleanPhone;
  }

  // Remover el símbolo + si existe
  cleanPhone = cleanPhone.replace('+', '');

  // Crear mensaje con información del comprobante y enlace al PDF (sin emojis)
  const documentNumber = serie && correlative ? `${serie}-${correlative}` : displayOrderNumber.value;
  const message = `Hola!\n\nTe compartimos tu comprobante de pago:\n\n*${documentNumber}*\nTotal: *${formatCurrency(total)}*\n\nVer/Descargar PDF:\n${pdfUrl}\n\nGracias por tu compra!`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  console.log('📱 [PaymentModal] Opening WhatsApp:', { phone: cleanPhone, documentNumber, pdfUrl });

  // Abrir WhatsApp Web en una nueva ventana
  window.open(whatsappUrl, '_blank');
};

// Formateo de moneda
const formatCurrency = (amount) => {
  return `S/ ${amount.toFixed(2)}`;
};

// Watcher para mostrar el ticket cuando cambia la propiedad showTicket
watch(() => props.showTicket, (newValue) => {
  if (newValue) {
    showTicket.value = true;
  }
});

// Watcher para emitir el evento update:show-ticket cuando cambia showTicket
watch(showTicket, (newValue) => {
  emit('update:show-ticket', newValue);
});

// Watcher para recalcular cambio cuando cambia el monto en efectivo
watch(cashAmount, () => {
  if (paymentMethod.value === 'efectivo') {
    calculateChange();
  }
});

// Inicialización
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>
