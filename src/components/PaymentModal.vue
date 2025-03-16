<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Procesar Pago</h3>
                <button 
                  @click="closeModal" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div v-if="customer" class="text-sm text-gray-600">
                  Cliente: {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}
                </div>
              </div>
              
              <!-- Selección de método de pago -->
              <div class="mb-4">
                <div class="font-medium mb-2">Método de pago:</div>
                <div class="grid grid-cols-3 gap-3">
                  <button 
                    @click="selectPaymentMethod('efectivo')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'efectivo' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                    Efectivo
                  </button>
                  <button 
                    @click="selectPaymentMethod('tarjeta')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'tarjeta' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Tarjeta
                  </button>
                  <button 
                    @click="selectPaymentMethod('qr')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'qr' 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    QR
                  </button>
                  <button 
                    @click="selectPaymentMethod('credito')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'credito' 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
                      <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
                      <path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12" />
                      <path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z" />
                    </svg>
                    Crédito
                  </button>
                  <button 
                    @click="selectPaymentMethod('giftcard')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'giftcard' 
                        ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                        : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                    Gift Card
                  </button>
                  <button 
                    @click="selectPaymentMethod('puntos')" 
                    :class="[
                      'btn flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      paymentMethod === 'puntos' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              
              <!-- Formulario específico según método de pago -->
              <div v-if="paymentMethod" class="mb-4 p-3 border rounded-lg">
                <!-- Efectivo -->
                <div v-if="paymentMethod === 'efectivo'">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Monto entregado</label>
                    <input 
                      v-model.number="cashAmount" 
                      type="number" 
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                      @input="calculateChange"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div class="flex justify-between font-medium">
                    <span>Vuelto:</span>
                    <span :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatCurrency(change) }}
                    </span>
                  </div>
                </div>
                
                <!-- Tarjeta -->
                <div v-if="paymentMethod === 'tarjeta'">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Código de operación</label>
                    <input 
                      v-model="cardCode" 
                      type="text" 
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                      placeholder="Ingrese el código de autorización"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de tarjeta</label>
                    <select class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full">
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                      <option value="other">Otra</option>
                    </select>
                  </div>
                </div>
                
                <!-- QR -->
                <div v-if="paymentMethod === 'qr'" class="text-center">
                  <div class="mb-2 font-medium">Escanea para pagar</div>
                  <div class="flex justify-center mb-3">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=POS2-Payment-{{ total }}" 
                      alt="QR Code" 
                      class="border p-2 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-gray-600">
                    Este es un QR ficticio para demostración
                  </div>
                </div>
                
                <!-- Crédito -->
                <div v-if="paymentMethod === 'credito'" class="text-center p-3">
                  <p class="text-gray-600">
                    La funcionalidad de pago a crédito estará disponible próximamente.
                  </p>
                </div>
                
                <!-- Gift Card -->
                <div v-if="paymentMethod === 'giftcard'">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Código de Gift Card</label>
                    <input 
                      v-model="giftCardCode" 
                      type="text" 
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                      placeholder="Ingrese el código de la tarjeta de regalo"
                    />
                  </div>
                </div>
                
                <!-- Puntos -->
                <div v-if="paymentMethod === 'puntos'" class="text-center p-3">
                  <p class="text-gray-600">
                    La funcionalidad de pago con puntos estará disponible próximamente.
                  </p>
                </div>
              </div>
              
              <!-- Tipo de documento -->
              <div class="mb-4">
                <div class="font-medium mb-2">Tipo de documento:</div>
                <div class="flex gap-3">
                  <button 
                    @click="documentType = 'boleta'" 
                    :class="[
                      'flex-1 flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      documentType === 'boleta' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Boleta
                  </button>
                  <button 
                    @click="documentType = 'factura'" 
                    :class="[
                      'flex-1 flex items-center justify-center py-3 rounded-lg transition-colors duration-200', 
                      documentType === 'factura' 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M7 15h0M7 11h0M7 7h0" />
                      <path d="M11 15h6M11 11h6M11 7h6" />
                    </svg>
                    Factura
                  </button>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="flex justify-center mt-6">
                <button 
                  @click="processPayment" 
                  :class="[
                    'w-full py-4 rounded-lg text-lg font-medium transition-all duration-200',
                    isPaymentValid 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  ]"
                  :disabled="!isPaymentValid"
                >
                  Confirmar Pago
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Pago Completado</h3>
                <button 
                  @click="closeTicket" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    {{ documentType === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA' }}
                  </div>
                  <div>{{ documentType === 'boleta' ? 'B001-00001234' : 'F001-00001234' }}</div>
                  <div>Fecha: {{ new Date().toLocaleDateString() }}</div>
                </div>
                
                <div v-if="customer" class="mb-3">
                  <div>Cliente: {{ customer.razonSocial || `${customer.nombres} ${customer.apellidos}` }}</div>
                  <div>{{ customer.tipoDoc }}: {{ customer.numDoc }}</div>
                </div>
                
                <div class="mb-3">
                  <div class="border-b border-gray-300 pb-1 mb-1 font-bold flex">
                    <span class="w-1/2">Producto</span>
                    <span class="w-1/6 text-right">Cant.</span>
                    <span class="w-1/6 text-right">P.Unit</span>
                    <span class="w-1/6 text-right">Total</span>
                  </div>
                  <div v-for="(item, index) in items" :key="index" class="flex text-xs py-1">
                    <span class="w-1/2 truncate">{{ item.nombre }}</span>
                    <span class="w-1/6 text-right">{{ item.cantidad }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio) }}</span>
                    <span class="w-1/6 text-right">{{ formatCurrency(item.precio * item.cantidad) }}</span>
                  </div>
                </div>
                
                <div class="border-t border-gray-300 pt-1">
                  <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>IGV (18%):</span>
                    <span>{{ formatCurrency(igv) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{{ formatCurrency(total) }}</span>
                  </div>
                  <div class="mt-2">
                    <div>Forma de pago: {{ getPaymentMethodName() }}</div>
                    <div v-if="paymentMethod === 'efectivo'">
                      Efectivo: {{ formatCurrency(cashAmount) }}
                      <br>
                      Vuelto: {{ formatCurrency(change) }}
                    </div>
                    <div v-if="paymentMethod === 'tarjeta'">
                      Código de operación: {{ cardCode }}
                    </div>
                  </div>
                </div>
                
                <div class="text-center mt-3 text-xs">
                  <div>¡Gracias por su compra!</div>
                  <div>Visite nuestra página web: www.ejemplo.com</div>
                </div>
              </div>
              
              <!-- Opciones de envío -->
              <div class="mb-4">
                <div class="font-medium mb-2">Enviar comprobante:</div>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    @click="showEmailForm = true; showWhatsAppForm = false"
                    class="flex items-center justify-center py-3 rounded-lg transition-colors duration-200 bg-blue-100 hover:bg-blue-200 text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Email
                  </button>
                  <button 
                    @click="showWhatsAppForm = true; showEmailForm = false"
                    class="flex items-center justify-center py-3 rounded-lg transition-colors duration-200 bg-green-100 hover:bg-green-200 text-green-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                      <path d="M13.5 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                      <path d="M9 13.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5Z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
                
                <!-- Formulario de Email -->
                <div v-if="showEmailForm" class="mt-3 p-3 border rounded-lg bg-blue-50">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input 
                      v-model="emailAddress" 
                      type="email" 
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <button 
                    @click="sendByEmail"
                    :disabled="!isEmailValid"
                    :class="[
                      'w-full py-2 rounded-lg transition-colors duration-200 flex items-center justify-center',
                      isEmailValid 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                    Enviar por Email
                  </button>
                </div>
                
                <!-- Formulario de WhatsApp -->
                <div v-if="showWhatsAppForm" class="mt-3 p-3 border rounded-lg bg-green-50">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
                    <input 
                      v-model="phoneNumber" 
                      type="tel" 
                      class="p-2 border rounded-lg focus:ring-2 focus:ring-green-500 w-full"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <button 
                    @click="sendByWhatsApp"
                    :disabled="!isPhoneValid"
                    :class="[
                      'w-full py-2 rounded-lg transition-colors duration-200 flex items-center justify-center',
                      isPhoneValid 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    ]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                    Enviar por WhatsApp
                  </button>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="flex justify-center mt-6">
                <button 
                  class="w-full py-4 rounded-lg text-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  @click="closeTicket"
                >
                  Imprimir
                </button>
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

const props = defineProps({
  modelValue: Boolean,
  total: Number,
  customer: Object,
  items: Array
});

const emit = defineEmits(['update:modelValue', 'payment-completed']);

// Estado del modal
const paymentMethod = ref('');
const documentType = ref('boleta');
const cashAmount = ref(0);
const change = ref(0);
const cardCode = ref('');
const giftCardCode = ref('');
const showTicket = ref(false);
const showEmailForm = ref(false);
const showWhatsAppForm = ref(false);
const emailAddress = ref('');
const phoneNumber = ref('');

// Cálculos
const subtotal = computed(() => props.total / 1.18);
const igv = computed(() => props.total - subtotal.value);

// Validación de pago
const isPaymentValid = computed(() => {
  if (!paymentMethod.value) return false;
  
  switch (paymentMethod.value) {
    case 'efectivo':
      return cashAmount.value >= props.total;
    case 'tarjeta':
      return cardCode.value.trim().length > 0;
    case 'qr':
      return true; // Simulamos que el pago por QR siempre es válido
    case 'credito':
      return false; // No implementado aún
    case 'giftcard':
      return giftCardCode.value.trim().length > 0;
    case 'puntos':
      return false; // No implementado aún
    default:
      return false;
  }
});

// Métodos
const selectPaymentMethod = (method) => {
  paymentMethod.value = method;
  
  if (method === 'efectivo') {
    cashAmount.value = Math.round(props.total * 100) / 100; // Asegurar 2 decimales
    calculateChange();
  }
};

const calculateChange = () => {
  // Redondear a 2 decimales
  cashAmount.value = Math.round(cashAmount.value * 100) / 100;
  change.value = Math.round((cashAmount.value - props.total) * 100) / 100;
};

const getPaymentMethodName = () => {
  const methods = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta de crédito/débito',
    'qr': 'Pago con QR',
    'credito': 'Crédito',
    'giftcard': 'Gift Card',
    'puntos': 'Puntos'
  };
  
  return methods[paymentMethod.value] || '';
};

const processPayment = () => {
  // Aquí iría la lógica real de procesamiento de pago
  // Por ahora solo mostramos el ticket
  showTicket.value = true;
};

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const closeTicket = () => {
  showTicket.value = false;
  emit('payment-completed');
  closeModal();
};

const resetForm = () => {
  paymentMethod.value = '';
  documentType.value = 'boleta';
  cashAmount.value = 0;
  change.value = 0;
  cardCode.value = '';
  giftCardCode.value = '';
};

// Formateo de moneda
const formatCurrency = (amount) => {
  return `S/ ${amount.toFixed(2)}`;
};

// Validación de email y teléfono
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailAddress.value);
});

const isPhoneValid = computed(() => {
  // Validación simple: al menos 9 dígitos
  const phoneRegex = /\d{9,}/;
  return phoneRegex.test(phoneNumber.value.replace(/\D/g, ''));
});

// Métodos para enviar comprobante
const sendByEmail = () => {
  if (!isEmailValid.value) return;
  
  // Aquí iría la lógica real para enviar el comprobante por email
  console.log(`Enviando comprobante por email a: ${emailAddress.value}`);
  
  // Simulamos el envío exitoso
  alert(`Comprobante enviado a ${emailAddress.value}`);
  closeTicket();
};

const sendByWhatsApp = () => {
  if (!isPhoneValid.value) return;
  
  // Aquí iría la lógica real para enviar el comprobante por WhatsApp
  console.log(`Enviando comprobante por WhatsApp al número: ${phoneNumber.value}`);
  
  // Simulamos el envío exitoso
  alert(`Comprobante enviado al número ${phoneNumber.value}`);
  closeTicket();
};

// Inicialización
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>
