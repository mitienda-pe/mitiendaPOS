<template>
  <div class="h-[calc(100dvh-4rem)] flex flex-col">
    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Cart -->
      <div class="w-2/3 bg-white flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow px-6 py-4 flex-shrink-0 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Ventas</h1>
          <div class="flex space-x-2">
            <button
              @click="showSavedSalesModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Ventas Guardadas
            </button>
            <button
              @click="newSale"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nueva Venta
            </button>
          </div>
        </header>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Barcode Scanner -->
          <div class="mb-6 search-container relative">
            <div class="flex">
              <input
                ref="barcodeInput"
                v-model="barcode"
                type="text"
                placeholder="Escanear código de barras o buscar producto..."
                class="flex-grow p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                @keyup.enter="handleBarcodeInput"
                @input="searchProducts"
              >
              <button
                @click="showProductList"
                class="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            
            <!-- Search Results Dropdown -->
            <div v-if="searchResults.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg max-h-60 overflow-auto">
              <ul>
                <li 
                  v-for="product in searchResults" 
                  :key="product.id"
                  class="p-2 hover:bg-gray-100 cursor-pointer"
                  @click="selectProduct(product)"
                >
                  <div class="flex justify-between">
                    <span>{{ product.nombre }}</span>
                    <span class="text-gray-600">{{ formatCurrency(product.precio) }}</span>
                  </div>
                  <div class="text-sm text-gray-500">SKU: {{ product.sku }} | Stock: {{ product.stock }}</div>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Cart Items -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in cartItems" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ item.nombre }}</div>
                    <div class="text-sm text-gray-500">SKU: {{ item.sku }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(item.precio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <button 
                        @click="decrementQuantity(item)" 
                        class="p-1 rounded-full hover:bg-gray-200"
                        :disabled="item.quantity <= 1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span class="mx-2 text-sm">{{ item.quantity }}</span>
                      <button 
                        @click="incrementQuantity(item)" 
                        class="p-1 rounded-full hover:bg-gray-200"
                        :disabled="item.quantity >= item.stock"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(calculateSubtotal(item)) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="removeItem(item)" class="text-red-600 hover:text-red-900">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="cartItems.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    No hay productos en el carrito
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Panel - Totals and Actions -->
      <div class="w-1/3 bg-gray-50 flex flex-col overflow-hidden">
        <div class="p-6 flex flex-col h-full">
          <!-- Customer Selection -->
          <div class="mb-4">
            <button 
              @click="showCustomerSearch = true" 
              class="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <span v-if="selectedCustomer">
                {{ selectedCustomer.razonSocial || `${selectedCustomer.nombres} ${selectedCustomer.apellidos}` }}
              </span>
              <span v-else class="text-gray-500">Seleccionar Cliente</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          <!-- Order Summary -->
          <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h2 class="text-lg font-medium mb-4">Resumen de la Orden</h2>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">IGV (18%)</span>
                <span>{{ formatCurrency(tax) }}</span>
              </div>
              <div class="border-t pt-2 mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{{ formatCurrency(total) }}</span>
              </div>
              
              <!-- Pagos Parciales -->
              <div v-if="payments.length > 0" class="mt-4">
                <div class="border-t pt-3 mb-2">
                  <h3 class="font-medium text-gray-700">Pagos Realizados:</h3>
                </div>
                <div class="space-y-2">
                  <div v-for="(payment, index) in payments" :key="index" 
                    class="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center">
                      <span class="font-medium text-sm">{{ payment.methodName }}</span>
                      <span v-if="payment.reference" class="ml-2 text-xs text-gray-500">{{ payment.reference }}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="font-medium">{{ formatCurrency(payment.amount) }}</span>
                      <button @click="removePayment(index)" class="ml-2 text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between mt-3 font-medium text-green-700">
                  <span>Pagado:</span>
                  <span>{{ formatCurrency(totalPaid) }}</span>
                </div>
                <div class="flex justify-between font-medium" :class="remainingAmount === 0 ? 'text-green-700' : 'text-red-600'">
                  <span>Saldo pendiente:</span>
                  <span>{{ formatCurrency(remainingAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Actions -->
          <div class="flex-shrink-0 mt-auto space-y-4">
            <button
              v-if="payments.length === 0 || remainingAmount > 0"
              @click="processPayment"
              :disabled="!cartItems.length"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Añadir Pago
            </button>
            <button
              v-if="payments.length > 0 && remainingAmount === 0"
              @click="handlePaymentCompleted"
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Completar Venta
            </button>
            <div class="flex space-x-2">
              <button
                @click="saveSaleForLater"
                :disabled="!cartItems.length"
                class="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
              >
                Guardar Venta
              </button>
              <button
                @click="cancelSale"
                :disabled="!cartItems.length"
                class="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Product List Modal -->
  <div v-if="showProductModal" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeProductModal"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Lista de Productos</h3>
                <button 
                  @click="closeProductModal" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <!-- Search and Filters -->
              <div class="mb-4 grid grid-cols-2 gap-4">
                <input
                  v-model="productSearchQuery"
                  type="text"
                  placeholder="Buscar productos..."
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  @input="searchProductList"
                >
                <select
                  v-model="productCategoryFilter"
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  @change="searchProductList"
                >
                  <option value="">Todas las categorías</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <!-- Products Table -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">SKU</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/6">Producto</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Categoría</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Precio</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="product in filteredProducts" :key="product.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{{ product.sku }}</td>
                      <td class="px-6 py-4 text-sm truncate max-w-xs">{{ product.nombre }}</td>
                      <td class="px-6 py-4 text-sm truncate">{{ product.categoria }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatCurrency(product.precio) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          @click="selectProduct(product)"
                          :disabled="product.stock === 0"
                          class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="closeProductModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Customer Search Modal -->
  <CustomerSearchModal
    v-model="showCustomerSearch"
    @select="handleCustomerSelect"
  />
  
  <!-- Payment Modal -->
  <PaymentModal
    v-model="showPaymentModal"
    :total="total"
    :remaining-amount="remainingAmount"
    :customer="selectedCustomer"
    :items="cartItems"
    @payment-completed="handlePaymentCompleted"
    @payment-added="handlePaymentAdded"
  />

  <!-- Saved Sales Modal -->
  <SavedSalesModal
    v-model="showSavedSalesModal"
    @resume-sale="resumeSavedSale"
  />

  <!-- Ticket Modal -->
  <TicketModal
    v-model="showTicketModal"
    :customer="selectedCustomer"
    :items="cartItems"
    :subtotal="subtotal"
    :tax="tax"
    :total="total"
    :payments="payments"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { mockInventoryApi } from '../api/mockInventory';
import { mockCustomersApi } from '../api/mockCustomers';
import { useSavedSalesStore } from '../stores/savedSales';
import CustomerSearchModal from '../components/CustomerSearchModal.vue';
import PaymentModal from '../components/PaymentModal.vue';
import SavedSalesModal from '../components/SavedSalesModal.vue';
import TicketModal from '../components/TicketModal.vue';

// State
const authStore = useAuthStore();
const savedSalesStore = useSavedSalesStore();
const barcode = ref('');
const barcodeInput = ref(null);
const cartItems = ref([]);
const selectedCustomer = ref(null);
const showCustomerSearch = ref(false);
const customers = ref([]);
const searchResults = ref([]);
const showProductModal = ref(false);
const productSearchQuery = ref('');
const productCategoryFilter = ref('');
const categories = ref([]);
const allProducts = ref([]);
const showPaymentModal = ref(false);
const showSavedSalesModal = ref(false);
const showTicketModal = ref(false);
const currentSaleId = ref(null);
const payments = ref([]);

// Computed properties
const filteredProducts = computed(() => {
  let filtered = [...allProducts.value];
  
  if (productSearchQuery.value) {
    const search = productSearchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.nombre.toLowerCase().includes(search) ||
      (product.sku ? String(product.sku).toLowerCase().includes(search) : false)
    );
  }
  
  if (productCategoryFilter.value) {
    filtered = filtered.filter(product => 
      product.categoria === productCategoryFilter.value
    );
  }
  
  return filtered;
});

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + calculateSubtotal(item), 0);
});

const tax = computed(() => subtotal.value * 0.18);
const total = computed(() => subtotal.value + tax.value);
const totalPaid = computed(() => {
  return payments.value.reduce((sum, payment) => sum + payment.amount, 0);
});
const remainingAmount = computed(() => {
  return Math.round((total.value - totalPaid.value) * 100) / 100;
});

// Methods
const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'S/ 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
};

const calculateSubtotal = (item) => {
  const precio = parseFloat(item.precio) || 0;
  const cantidad = parseInt(item.quantity) || 0;
  return precio * cantidad;
};

const handleBarcodeInput = async () => {
  if (!barcode.value) return;
  
  try {
    const response = await mockInventoryApi.getInventory({
      search: barcode.value,
      perPage: 1
    });
    
    const product = response.data.items[0];
    if (product) {
      if (product.stock > 0) {
        addToCart(product);
      } else {
        alert('Este producto está agotado');
      }
    } else {
      alert('Producto no encontrado');
    }
    
    barcode.value = '';
    barcodeInput.value.focus();
  } catch (error) {
    console.error('Error searching product:', error);
  }
};

const addToCart = (product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id);
  
  if (existingItem) {
    // Check if we have enough stock
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++;
    } else {
      alert('No hay suficiente stock disponible');
    }
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1
    });
  }
};

const incrementQuantity = (item) => {
  const product = cartItems.value.find(i => i.id === item.id);
  if (product && product.quantity < product.stock) {
    item.quantity++;
  } else {
    alert('No hay suficiente stock disponible');
  }
};

const decrementQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  }
};

const removeItem = (item) => {
  cartItems.value = cartItems.value.filter(i => i.id !== item.id);
};

// Guardar la venta actual para más tarde
const saveSaleForLater = () => {
  if (!cartItems.value.length) return;

  const saleData = {
    customer: selectedCustomer.value,
    items: [...cartItems.value],
    subtotal: subtotal.value,
    tax: tax.value,
    total: total.value
  };

  // Si ya existe un ID para esta venta, eliminar la versión anterior
  if (currentSaleId.value) {
    savedSalesStore.deleteSavedSale(currentSaleId.value);
  }

  // Guardar la venta y obtener el nuevo ID
  const saleId = savedSalesStore.saveSale(saleData);
  currentSaleId.value = saleId;

  // Mostrar mensaje de confirmación
  alert('Venta guardada correctamente');
  
  // Limpiar la venta actual
  resetSale();
};

// Iniciar una nueva venta
const newSale = () => {
  if (cartItems.value.length > 0) {
    if (confirm('¿Desea guardar la venta actual antes de iniciar una nueva?')) {
      saveSaleForLater();
    } else {
      resetSale();
    }
  }
  
  // Limpiar el ID de la venta actual
  currentSaleId.value = null;
  
  // Enfocar el campo de código de barras
  barcodeInput.value.focus();
};

// Retomar una venta guardada
const resumeSavedSale = (sale) => {
  // Si hay una venta en curso, preguntar si se desea guardar
  if (cartItems.value.length > 0) {
    if (confirm('¿Desea guardar la venta actual antes de cargar la venta guardada?')) {
      saveSaleForLater();
    }
  }

  // Cargar la venta guardada
  cartItems.value = [...sale.items];
  selectedCustomer.value = sale.customer;
  currentSaleId.value = sale.id;
};

const processPayment = () => {
  // Solo mostrar el modal si hay un saldo pendiente
  if (remainingAmount.value > 0) {
    showPaymentModal.value = true;
  } else if (payments.value.length > 0) {
    // Si ya está pagado completamente, procesar la venta
    handlePaymentCompleted();
  }
};

const handlePaymentAdded = (paymentData) => {
  payments.value.push({
    method: paymentData.method,
    methodName: getPaymentMethodName(paymentData.method),
    amount: paymentData.amount,
    reference: paymentData.reference
  });
  
  // Ya no procesamos la venta automáticamente cuando el saldo llega a cero
  // Esto permite al usuario ver el resumen de la orden
};

const handlePaymentCompleted = async () => {
  try {
    // Update inventory stock for each item
    for (const item of cartItems.value) {
      const updatedStock = item.stock - item.quantity;
      await mockInventoryApi.updateItem(item.id, {
        ...item,
        stock: updatedStock
      });
    }

    // Process the sale
    const saleData = {
      cliente_id: selectedCustomer.value ? selectedCustomer.value.id : null,
      productos: cartItems.value.map(item => ({
        id: item.id,
        cantidad: item.quantity,
        precio: item.precio
      })),
      subtotal: subtotal.value,
      igv: tax.value,
      total: total.value,
      pagos: payments.value
    };

    // Here you would integrate with your sales API
    console.log('Venta procesada:', saleData);
    
    // Si esta venta estaba guardada, eliminarla de las ventas guardadas
    if (currentSaleId.value) {
      savedSalesStore.deleteSavedSale(currentSaleId.value);
    }
    
    // Mostrar el ticket de compra
    showTicketModal.value = true;
  } catch (error) {
    console.error('Error al procesar el pago:', error);
  }
};

const cancelSale = () => {
  if (confirm('¿Está seguro de cancelar la venta?')) {
    resetSale();
  }
};

const resetSale = () => {
  cartItems.value = [];
  selectedCustomer.value = null;
  currentSaleId.value = null;
  payments.value = [];
  searchQuery.value = '';
  searchResults.value = [];
};

const fetchCustomers = async () => {
  try {
    const response = await mockCustomersApi.getCustomers();
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

// Search methods
const searchProducts = async () => {
  if (!barcode.value) {
    searchResults.value = [];
    return;
  }

  try {
    const response = await mockInventoryApi.getInventory({
      search: barcode.value,
      perPage: 5
    });
    
    // Asegurarse de que todos los SKUs sean strings antes de mostrar los resultados
    searchResults.value = response.data.items.map(item => ({
      ...item,
      sku: item.sku ? String(item.sku) : ''
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    searchResults.value = [];
  }
};

const selectProduct = (product) => {
  // Asegurarse de que el SKU sea un string
  const safeProduct = {
    ...product,
    sku: product.sku ? String(product.sku) : ''
  };
  
  if (safeProduct.stock > 0) {
    addToCart(safeProduct);
    searchResults.value = [];
    barcode.value = '';
    closeProductModal();
  } else {
    alert('Este producto está agotado');
  }
};

const showProductList = async () => {
  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      mockInventoryApi.getCategories(),
      mockInventoryApi.getInventory({ perPage: 100 })
    ]);
    
    categories.value = categoriesResponse.data;
    
    // Asegurarse de que todos los SKUs sean strings
    allProducts.value = productsResponse.data.items.map(item => ({
      ...item,
      sku: item.sku ? String(item.sku) : ''
    }));
    
    showProductModal.value = true;
  } catch (error) {
    console.error('Error loading product list:', error);
  }
};

const closeProductModal = () => {
  showProductModal.value = false;
  productSearchQuery.value = '';
  productCategoryFilter.value = '';
};

const searchProductList = () => {
  // No need to do anything here as we're using a computed property
};

// Click outside to close search results
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-container')) {
    searchResults.value = [];
  }
};

const handleCustomerSelect = (customer) => {
  selectedCustomer.value = customer;
};

// Lifecycle hooks
onMounted(async () => {
  fetchCustomers();
  
  // Esperar a que el DOM se actualice y luego intentar hacer focus
  await nextTick();
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watcher para resetear la venta cuando se cierra el modal del ticket
watch(showTicketModal, (newValue) => {
  if (!newValue) {
    resetSale();
  }
});

const removePayment = (index) => {
  payments.value.splice(index, 1);
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
</script>
