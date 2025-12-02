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
                  <button @click="selectPaymentMethod('banco')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                    </svg>
                    Banco
                  </button>
                  <button @click="selectPaymentMethod('nota_credito')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
                  <button @click="selectPaymentMethod('qr')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
                  <button @click="selectPaymentMethod('credito')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
                  <button @click="selectPaymentMethod('giftcard')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
                  <button @click="selectPaymentMethod('puntos')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
                  <button @click="selectPaymentMethod('link')" disabled :class="[
                    'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200',
                    'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  ]">

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>

                    Link
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
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                    Número de autorización <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="cardCode"
                    placeholder="Ej: 123456"
                    required
                    maxlength="100"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{'border-red-500': paymentMethod === 'tarjeta' && !cardCode && attemptedSubmit}"
                  />
                  <p v-if="paymentMethod === 'tarjeta' && !cardCode && attemptedSubmit" class="text-xs text-red-600 mt-1">
                    Este campo es obligatorio para pagos con tarjeta
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Ingrese el número de autorización de la transacción con tarjeta
                  </p>
                </div>

                <!-- Banco (Depósito/Transferencia) -->
                <div v-if="paymentMethod === 'banco'" class="mb-3">
                  <RightToLeftMoneyInput v-model="paymentAmount" label="Monto transferido"
                    helpText="Ingrese el monto de la transferencia o depósito" />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                    Número de operación <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="bankOperationNumber"
                    placeholder="Ej: 000123456789"
                    required
                    maxlength="100"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{'border-red-500': paymentMethod === 'banco' && !bankOperationNumber && attemptedSubmit}"
                  />
                  <p v-if="paymentMethod === 'banco' && !bankOperationNumber && attemptedSubmit" class="text-xs text-red-600 mt-1">
                    Este campo es obligatorio para pagos por transferencia/depósito
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Ingrese el número de operación de la transferencia o depósito bancario
                  </p>
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

                <!-- Nota de Crédito -->
                <div v-if="paymentMethod === 'nota_credito'" class="mb-3">
                  <RightToLeftMoneyInput v-model="paymentAmount" label="Monto de la Nota de Crédito"
                    helpText="Ingrese el monto a aplicar de la nota de crédito" />
                  <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                    Serie y Número <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="creditNoteNumber"
                    placeholder="Ej: F001-00001234"
                    required
                    maxlength="50"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{'border-red-500': paymentMethod === 'nota_credito' && !creditNoteNumber && attemptedSubmit}"
                  />
                  <p v-if="paymentMethod === 'nota_credito' && !creditNoteNumber && attemptedSubmit" class="text-xs text-red-600 mt-1">
                    Este campo es obligatorio para pagos con nota de crédito
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Ingrese la serie y número de la nota de crédito (formato: SERIE-NÚMERO)
                  </p>
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
            <div id="ticket-print-area">
              <ReceiptTicket
                :order-number="displayOrderNumber"
                :created-at="props.completedSaleData?.createdAt || new Date().toISOString()"
                :customer="displayCustomer"
                :items="displayItems"
                :payments="displayPayments"
                :subtotal="displaySubtotal"
                :tax="displayTax"
                :total="displayTotal"
                :rounding-amount="displayRoundingAmount"
                :total-after-rounding="displayTotalAfterRounding"
                :cajero-name="displayCajero"
                :status="props.completedSaleData?.status"
                :source="props.completedSaleData?.source || 'pos'"
                :billing-document="displayBillingDocument"
                :company-info="getCompanyInfo()"
                :store-name="getStoreName()"
                :store-address="getStoreAddress()"
                :store-phone="getStorePhone()"
                :netsuite-customer-code="getNetsuiteCustomerCode()"
                :show-badges="false"
                :show-reprint="false"
              />
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
import { useAuthStore } from '../stores/auth';
import RightToLeftMoneyInput from './RightToLeftMoneyInput.vue';
import ReceiptTicket from './ReceiptTicket.vue';
import { COMPANY_CONFIG } from '../config/companyConfig';
import {
  suggestOptimalPayments,
  validateCashPayment,
  calculateChangeBreakdown,
  roundToValidAmount
} from '../utils/cashDenominations.js';
import { formatCurrency } from '../utils/formatters.js';

const cartStore = useCartStore();
const authStore = useAuthStore();

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
const bankOperationNumber = ref('');
const creditNoteNumber = ref('');
const giftCardCode = ref('');
const currentReference = ref('');
const showTicket = ref(props.showTicket);
const showEmailForm = ref(false);
const emailAddress = ref('');
const attemptedSubmit = ref(false);

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

const displayRoundingAmount = computed(() => {
  return props.completedSaleData?.roundingAmount ?? 0;
});

const displayTotalAfterRounding = computed(() => {
  if (props.completedSaleData?.totalAfterRounding !== undefined && props.completedSaleData?.totalAfterRounding !== null) {
    return props.completedSaleData.totalAfterRounding;
  }
  // Si hay redondeo, calcularlo
  const rounding = displayRoundingAmount.value;
  if (rounding !== 0) {
    return displayTotal.value + rounding;
  }
  return displayTotal.value;
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

  if (paymentMethod.value === 'banco' && !bankOperationNumber.value) {
    return false;
  }

  if (paymentMethod.value === 'nota_credito' && !creditNoteNumber.value) {
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
  bankOperationNumber.value = '';
  creditNoteNumber.value = '';
  giftCardCode.value = '';
  attemptedSubmit.value = false;
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
    'banco': 'Transferencia/Depósito bancario',
    'qr': 'Pago con QR',
    'credito': 'Crédito',
    'giftcard': 'Gift Card',
    'puntos': 'Puntos',
    'link': 'Link de pago',
    'nota_credito': 'Nota de Crédito'
  };

  return methods[method] || '';
};

const addPayment = () => {
  // Marcar que se intentó enviar el formulario
  attemptedSubmit.value = true;

  // Validar campos obligatorios según método de pago
  if (paymentMethod.value === 'tarjeta' && !cardCode.value) {
    console.warn('⚠️ [PaymentModal] Falta número de autorización para pago con tarjeta');
    return;
  }

  if (paymentMethod.value === 'banco' && !bankOperationNumber.value) {
    console.warn('⚠️ [PaymentModal] Falta número de operación para pago bancario');
    return;
  }

  if (paymentMethod.value === 'nota_credito' && !creditNoteNumber.value) {
    console.warn('⚠️ [PaymentModal] Falta serie y número para nota de crédito');
    return;
  }

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

      // 🔧 CRITICAL FIX: Verificar si el usuario está pagando el total redondeado
      const totalRedondeadoPreliminar = Math.round(props.total * 10) / 10;
      const esPagoAlTotalRedondeadoPreliminar = Math.abs(cashAmount.value - totalRedondeadoPreliminar) < 0.01;

      if (changeValue > 0) {
        reference = `Cambio: ${formatCurrency(changeValue)}`;

        // Agregar desglose del vuelto a la referencia si existe
        if (changeBreakdownDisplay.value && changeBreakdownDisplay.value.breakdown.length > 0) {
          const breakdown = changeBreakdownDisplay.value.breakdown
            .map(item => `${item.count}x${formatDenomination(item.value)}`)
            .join(', ');
          reference += ` (${breakdown})`;
        }
      } else if (changeValue < 0 && !esPagoAlTotalRedondeadoPreliminar) {
        // Pago parcial: el usuario no entregó suficiente Y no coincide con el total redondeado
        // En este caso, registrar solo lo que entregó
        amount = cashAmount.value;
        reference = `Pago parcial: S/ ${cashAmount.value.toFixed(2)}`;
      } else {
        // Pago exacto (changeValue === 0) o pago al total redondeado
        reference = 'Pago exacto';
        // Si es pago al total redondeado, el monto debe ser el que ingresó el usuario
        if (esPagoAlTotalRedondeadoPreliminar) {
          amount = cashAmount.value;
        }
      }

      // 🔧 CRITICAL FIX: Solo aplicar redondeo si:
      // 1. Es el primer pago (no hay pagos previos)
      // 2. El pago + redondeo en contra cubre el 100% del total
      // 3. Hay redondeo calculado
      //
      // IMPORTANTE: El redondeo EN CONTRA (negativo) actúa como un pago adicional del cliente
      // Ejemplo: Total S/ 38.33, Redondeo -S/ 0.03 → Cliente paga S/ 38.30 + S/ 0.03 = S/ 38.33

      // Calcular el total redondeado esperado
      const totalRedondeado = Math.round(props.total * 10) / 10;
      const redondeoCalculado = Math.round((totalRedondeado - props.total) * 100) / 100;

      // Verificar si el pago + redondeo en contra cubre el total
      const pagoMasRedondeo = cashAmount.value + Math.abs(Math.min(0, redondeoCalculado));
      const cubreElTotal = Math.abs(pagoMasRedondeo - props.total) < 0.01;

      // Es pago completo si:
      // - changeValue >= 0 (cubre el total original con cambio), O
      // - El pago + redondeo en contra cubre el total (ej: 38.30 + 0.03 = 38.33)
      const isFullPayment = changeValue >= 0 || cubreElTotal;

      if (props.payments.length === 0 && roundingToDisplay.value !== 0 && isFullPayment) {
        roundingAmount = roundingToDisplay.value;
        console.log('✅ [PaymentModal] Aplicando redondeo para pago completo en efectivo', {
          cashAmount: cashAmount.value,
          totalOriginal: props.total,
          totalRedondeado,
          redondeoCalculado,
          pagoMasRedondeo,
          cubreElTotal,
          changeValue
        });
      } else if (props.payments.length === 0 && !isFullPayment) {
        console.log('⚠️ [PaymentModal] NO aplicar redondeo - es pago parcial (se combinarán métodos)', {
          cashAmount: cashAmount.value,
          totalRedondeado,
          pagoMasRedondeo,
          diferencia: pagoMasRedondeo - props.total
        });
      }

      console.log('💰 [PaymentModal] Calculando pago en efectivo:', {
        montoIngresado: cashAmount.value,
        saldoPendiente: amountDue,
        montoAPagar: amount,
        cambio: changeValue,
        redondeo: roundingAmount,
        isFullPayment,
        esPagoCompleto: changeValue >= 0
      });
      break;

    case 'tarjeta':
      // Métodos exactos deben "absorber" el redondeo si existe
      // Usar el saldo real del invoice (sin redondeo) más cualquier redondeo aplicado
      amount = Math.min(paymentAmount.value, props.remainingAmount);

      // Si ya hay redondeo aplicado de un pago anterior de efectivo,
      // la tarjeta debe cubrir el monto exacto compensando el redondeo
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
        console.log('💳 [PaymentModal] Tarjeta absorbe redondeo:', {
          remainingAmount: props.remainingAmount,
          appliedRounding: cartStore.appliedRounding,
          adjustedAmount: amount
        });
      }
      reference = `Auth: ${cardCode.value}`;
      break;
    case 'banco':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
        console.log('🏦 [PaymentModal] Banco absorbe redondeo:', {
          remainingAmount: props.remainingAmount,
          appliedRounding: cartStore.appliedRounding,
          adjustedAmount: amount
        });
      }
      reference = `Op: ${bankOperationNumber.value}`;
      break;
    case 'nota_credito':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
      }
      reference = `NC: ${creditNoteNumber.value}`;
      break;
    case 'qr':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
      }
      reference = 'QR';
      break;
    case 'giftcard':
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
      }
      reference = `GC: ${giftCardCode.value}`;
      break;
    default:
      amount = Math.min(paymentAmount.value, props.remainingAmount);
      if (cartStore.appliedRounding !== 0 && props.payments.length > 0) {
        amount = Math.min(paymentAmount.value, props.remainingAmount - cartStore.appliedRounding);
      }
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

  // Agregar número de autorización si es pago con tarjeta
  if (paymentMethod.value === 'tarjeta' && cardCode.value) {
    paymentData.authorization_number = cardCode.value.trim();
    console.log('💳 [PaymentModal] authorization_number agregado:', cardCode.value);
  }

  // Agregar número de operación si es pago bancario
  if (paymentMethod.value === 'banco' && bankOperationNumber.value) {
    paymentData.authorization_number = bankOperationNumber.value.trim();
    console.log('🏦 [PaymentModal] authorization_number (operación bancaria) agregado:', bankOperationNumber.value);
  }

  // Agregar serie y número si es nota de crédito
  if (paymentMethod.value === 'nota_credito' && creditNoteNumber.value) {
    paymentData.credit_note_number = creditNoteNumber.value.trim();
    console.log('📄 [PaymentModal] credit_note_number agregado:', creditNoteNumber.value);
  }

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
  bankOperationNumber.value = '';
  creditNoteNumber.value = '';
  giftCardCode.value = '';
  currentReference.value = '';
  showTicket.value = false;
  showEmailForm.value = false;
  emailAddress.value = '';
  attemptedSubmit.value = false;
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
// 🔧 CRITICAL FIX: Si hay pagos previos y el método actual NO es efectivo, NO mostrar redondeo
// 🔧 CRITICAL FIX: Si es efectivo pero es pago parcial, NO mostrar redondeo
const roundingToDisplay = computed(() => {
  // 1. Si ya hay redondeo aplicado Y el método actual NO es efectivo Y hay pagos previos,
  //    NO mostrar redondeo (se eliminará al agregar el pago)
  if (cartStore.appliedRounding !== 0 && paymentMethod.value !== 'efectivo' && props.payments.length > 0) {
    console.log('🔍 [PaymentModal] Redondeo será eliminado al agregar método no-efectivo');
    return 0;
  }

  // 2. Si ya hay redondeo aplicado (pago en efectivo registrado), mostrarlo
  if (cartStore.appliedRounding !== 0) {
    console.log('🔍 [PaymentModal] Usando redondeo ya aplicado:', cartStore.appliedRounding);
    return cartStore.appliedRounding;
  }

  // 3. Si el método seleccionado es efectivo Y no hay pagos previos, calcular redondeo anticipado
  //    PERO SOLO si el monto ingresado cubre el 100% del total (pago completo)
  if (paymentMethod.value === 'efectivo' && props.payments.length === 0) {
    // Calcular el total redondeado esperado
    const totalBeforeRounding = props.total;
    const roundedTotal = Math.round(totalBeforeRounding * 10) / 10;
    const rounding = Math.round((roundedTotal - totalBeforeRounding) * 100) / 100;

    // Verificar si el pago coincide con el total redondeado
    const pagoCoincideConTotalRedondeado = Math.abs(cashAmount.value - roundedTotal) < 0.01;

    // Si hay monto ingresado y es menor al total Y NO coincide con el total redondeado → pago parcial
    if (cashAmount.value > 0 && cashAmount.value < props.total && !pagoCoincideConTotalRedondeado) {
      console.log('🔍 [PaymentModal] NO mostrar redondeo - pago parcial en efectivo', {
        cashAmount: cashAmount.value,
        total: props.total,
        roundedTotal,
        pagoCoincideConTotalRedondeado
      });
      return 0;
    }

    // Si es pago completo (monto >= total O coincide con total redondeado), calcular redondeo
    console.log('🔍 [PaymentModal] Calculando redondeo anticipado para pago completo:', {
      totalOriginal: totalBeforeRounding,
      totalRedondeado: roundedTotal,
      redondeo: rounding,
      cashAmount: cashAmount.value,
      pagoCoincideConTotalRedondeado
    });
    return rounding;
  }

  // 4. En cualquier otro caso (tarjeta, QR, etc.), NO mostrar redondeo
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

// Funciones helper para el ticket (similares a SaleDetail.vue)
const getCompanyInfo = () => {
  return COMPANY_CONFIG;
};

const getStoreAddress = () => {
  // Intentar obtener desde la respuesta de la orden
  if (props.completedSaleData?.store_address) {
    return props.completedSaleData.store_address;
  }

  // Intentar obtener desde authStore
  if (authStore.selectedStore?.address) {
    return authStore.selectedStore.address;
  }

  return null;
};

const getStorePhone = () => {
  // Intentar obtener desde la respuesta de la orden
  if (props.completedSaleData?.store_phone) {
    return props.completedSaleData.store_phone;
  }

  // Intentar obtener desde authStore
  if (authStore.selectedStore?.phone) {
    return authStore.selectedStore.phone;
  }

  return null;
};

const getStoreName = () => {
  // Intentar obtener desde authStore
  if (authStore.selectedStore?.name) {
    return authStore.selectedStore.name;
  }

  // Intentar obtener desde la respuesta de la orden
  if (props.completedSaleData?.store_name) {
    return props.completedSaleData.store_name;
  }

  return 'LIMA'; // Default
};

const getNetsuiteCustomerCode = () => {
  // Prioridad 1: Desde displayCustomer
  if (displayCustomer.value?.netsuite_code) {
    return displayCustomer.value.netsuite_code;
  }

  // Prioridad 2: Desde completedSaleData
  if (props.completedSaleData?.customer?.netsuite_code) {
    return props.completedSaleData.customer.netsuite_code;
  }

  return null;
};

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
  // Imprimir solo el contenido del ticket (usando el componente ReceiptTicket)
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

  // Obtener todos los estilos de Tailwind CSS del documento principal
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => {
      if (style.tagName === 'LINK') {
        return `<link rel="stylesheet" href="${style.href}">`;
      }
      return `<style>${style.innerHTML}</style>`;
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta #${displayOrderNumber.value}</title>
      ${styles}
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
            width: 80mm;
          }
          /* Ocultar elementos innecesarios en impresión */
          .no-print {
            display: none !important;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 10px;
          max-width: 80mm;
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

  // Esperar a que se carguen los estilos antes de imprimir
  setTimeout(() => {
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 500);
  }, 500);
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

// Formateo de moneda (now imported from utils/formatters.js)

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
