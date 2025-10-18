<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
                  <span class="font-medium">Total a pagar:</span>
                  <span class="font-bold text-lg">{{ formatCurrency(total) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="font-medium">Saldo pendiente:</span>
                  <span class="font-bold text-lg" :class="remainingAmount === 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(remainingAmount) }}
                  </span>
                </div>
                <div v-if="customer" class="text-sm text-gray-600">
                  Cliente: {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}
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
                </div>
              </div>

              <div v-if="paymentMethod" class="mb-4 p-3 border rounded-lg">
                <!-- Campos específicos según el método de pago -->
                <div v-if="paymentMethod === 'efectivo'" class="mb-3">
                  <RightToLeftMoneyInput v-model="cashAmount" label="Monto Entregado"
                    helpText="Ingrese el monto entregado por el cliente" />
                  <div class="flex justify-between mt-2">
                    <span class="text-sm font-medium">Cambio:</span>
                    <span class="text-sm font-medium" :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatCurrency(change) }}
                    </span>
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
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Pago Completado</h3>
                <button @click="closeTicket" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Ticket -->
              <div class="mb-4 p-4 border rounded-lg bg-gray-50 font-mono text-sm">
                <div class="text-center mb-3">
                  <div class="font-bold">EMPRESA EJEMPLO S.A.C.</div>
                  <div>RUC: 20123456789</div>
                  <div>Av. Ejemplo 123, Lima</div>
                  <div>Tel: 01-123-4567</div>
                  <div class="mt-2 font-bold">
                    {{ props.documentType === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA' }}
                  </div>
                  <div>{{ props.documentType === 'boleta' ? 'B001-00001234' : 'F001-00001234' }}</div>
                  <div>Fecha: {{ new Date().toLocaleDateString() }}</div>
                </div>

                <div v-if="props.customer" class="mb-3">
                  <div>Cliente:
                    {{ props.customer.razonSocial || `${props.customer.nombres} ${props.customer.apellidos}` }}</div>
                  <div>{{ props.customer.tipoDoc }}: {{ props.customer.numDoc }}</div>
                </div>

                <div class="mb-3">
                  <div class="border-b border-gray-300 pb-1 mb-1 font-bold flex">
                    <span class="w-1/2">Producto</span>
                    <span class="w-1/6 text-right">Cant.</span>
                    <span class="w-1/6 text-right">P.Unit</span>
                    <span class="w-1/6 text-right">Total</span>
                  </div>
                  <div v-for="(item, index) in props.items" :key="index" class="flex text-xs py-1">
                    <span class="w-1/2 truncate">{{ item.nombre }}</span>
                    <span class="w-1/6 text-right">{{ item.quantity }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio) }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio * item.quantity) }}</span>
                  </div>
                </div>

                <div class="border-t border-gray-300 pt-1">
                  <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(props.total * 0.82) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>IGV (18%):</span>
                    <span>{{ formatCurrency(props.total * 0.18) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{{ formatCurrency(props.total) }}</span>
                  </div>
                  <div class="mt-2">
                    <div>Forma de pago:</div>
                    <div v-for="(payment, index) in props.payments" :key="index">
                      {{ getPaymentMethodName(payment.method) }}: {{ formatCurrency(payment.amount) }}
                      <span v-if="payment.reference" class="text-xs ml-1">(Ref: {{ payment.reference }})</span>
                    </div>

                    <!-- Total pagado y cambio -->
                    <div class="mt-2 pt-1 border-t border-gray-300">
                      <div class="flex justify-between">
                        <span>Total pagado:</span>
                        <span class="font-bold">{{ formatCurrency(totalPaid) }}</span>
                      </div>
                      <div v-if="totalChange > 0" class="flex justify-between">
                        <span>Cambio:</span>
                        <span class="font-bold text-green-600">{{ formatCurrency(totalChange) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-3 text-xs">
                  <div>¡Gracias por su compra!</div>
                  <div>Visite nuestra página web: www.ejemplo.com</div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="flex justify-between mt-6">
                <button
                  class="py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  @click="printTicket">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Imprimir
                </button>

                <button
                  class="py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  @click="finalizeSale">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Finalizar
                </button>
              </div>

              <!-- Botones para compartir el ticket -->
              <div class="mt-4">
                <div class="mb-3">
                  <button v-if="!showEmailForm"
                    class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                    @click="showEmailForm = true">
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

                <div>
                  <button v-if="!showWhatsAppForm"
                    class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                    @click="showWhatsAppForm = true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                      <path
                        d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1">
                      </path>
                    </svg>
                    Enviar por WhatsApp
                  </button>

                  <div v-if="showWhatsAppForm" class="border rounded-lg p-3 bg-gray-50">
                    <div class="flex justify-between items-center mb-2">
                      <h4 class="font-medium">Enviar por WhatsApp</h4>
                      <button @click="showWhatsAppForm = false"
                        class="text-gray-400 hover:text-gray-500 focus:outline-none">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="mb-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
                      <input type="tel" v-model="phoneNumber"
                        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+51 999 999 999" />
                    </div>
                    <button
                      class="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
                      @click="sendByWhatsApp" :disabled="!isValidPhone"
                      :class="isValidPhone ? '' : 'opacity-50 cursor-not-allowed'">
                      Enviar
                    </button>
                  </div>
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
import RightToLeftMoneyInput from './RightToLeftMoneyInput.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  total: {
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
const showWhatsAppForm = ref(false);
const phoneNumber = ref('');

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

const isValidPhone = computed(() => {
  const phoneRegex = /^\+51 \d{3} \d{3} \d{3}$/;
  return phoneRegex.test(phoneNumber.value);
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
};

const calculateChange = () => {
  // Redondear a 2 decimales
  cashAmount.value = Math.round(cashAmount.value * 100) / 100;

  // El monto del pago es el total restante (lo que se debe cobrar)
  paymentAmount.value = props.remainingAmount;

  // El cambio es lo que sobra del efectivo entregado
  change.value = Math.max(0, Math.round((cashAmount.value - props.remainingAmount) * 100) / 100);
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

  switch (paymentMethod.value) {
    case 'efectivo':
      amount = props.remainingAmount; // Siempre cobrar el total restante
      reference = `Cambio: ${formatCurrency(change.value)}`;
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

  // Emitir el evento con los datos del pago
  emit('payment-added', {
    method: paymentMethod.value,
    methodName: getPaymentMethodName(paymentMethod.value),
    amount: amount,
    reference: reference
  });

  // Cerrar el modal después de agregar el pago
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
  showWhatsAppForm.value = false;
  phoneNumber.value = '';
};

// Propiedades computadas para el ticket
const totalPaid = computed(() => {
  return props.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

const totalChange = computed(() => {
  const cashPayments = props.payments.filter(p => p.method === 'efectivo');
  const cashAmount = cashPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const cashDelivered = cashPayments.reduce((sum, payment) => {
    const match = payment.reference?.match(/Cambio: S\/ ([\d.]+)/);
    if (match) {
      return sum + payment.amount + parseFloat(match[1]);
    }
    return sum + payment.amount;
  }, 0);

  return Math.max(0, cashDelivered - props.total);
});

const printTicket = () => {
  // Implementar la funcionalidad de impresión
  window.print();
};

const finalizeSale = () => {
  // Emitir evento para finalizar la venta
  emit('sale-finalized');
  closeModal();
};

const sendByEmail = () => {
  // Implementar la funcionalidad de envío por email
  if (!isValidEmail.value) return;

  console.log(`Enviando ticket por email a: ${emailAddress.value}`);
  // Aquí iría la lógica para enviar el email

  // Mostrar mensaje de éxito y cerrar el formulario
  alert(`Ticket enviado por email a ${emailAddress.value}`);
  showEmailForm.value = false;
  emailAddress.value = '';
};

const sendByWhatsApp = () => {
  // Implementar la funcionalidad de envío por WhatsApp
  if (!isValidPhone.value) return;

  console.log(`Enviando ticket por WhatsApp al número: ${phoneNumber.value}`);
  // Aquí iría la lógica para enviar el mensaje por WhatsApp
  // Por ejemplo, abrir WhatsApp Web con el número y un mensaje predefinido
  const message = encodeURIComponent(`Ticket de compra - Total: ${formatCurrency(props.total)}`);
  const whatsappUrl = `https://wa.me/${phoneNumber.value.replace(/\s+/g, '')}?text=${message}`;

  // Abrir WhatsApp en una nueva ventana
  window.open(whatsappUrl, '_blank');

  showWhatsAppForm.value = false;
  phoneNumber.value = '';
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

// Inicialización
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>
