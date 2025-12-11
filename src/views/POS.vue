<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useShiftStore } from '../stores/shift';
import { useCashierStore } from '../stores/cashier';
import { productsApi } from '../services/productsApi';
import { ordersApi } from '../services/ordersApi';
import { netsuiteStockApi } from '../services/netsuiteStockApi';
import { mockCustomersApi } from '../api/mockCustomers';
import { useSavedSalesStore } from '../stores/savedSales';
import { cashMovementsApi } from '../services/cashMovementsApi';
import CustomerSearchModal from '../components/CustomerSearchModal.vue';
import PaymentModal from '../components/PaymentModal.vue';
import SavedSalesModal from '../components/SavedSalesModal.vue';
import StartSaleModal from '../components/StartSaleModal.vue';
import SupervisorAuthModal from '../components/SupervisorAuthModal.vue';
import ConfirmProductsModal from '../components/ConfirmProductsModal.vue';
import MergeSalesModal from '../components/MergeSalesModal.vue';
import BarcodeScanner from '../components/BarcodeScanner.vue';
import BillingDocumentModal from '../components/BillingDocumentModal.vue';
import ProcessingOverlay from '../components/ProcessingOverlay.vue';
import StockValidationErrorModal from '../components/StockValidationErrorModal.vue';
import BonificationWarningModal from '../components/BonificationWarningModal.vue';
import QuantityStepperInput from '../components/QuantityStepperInput.vue';
import { useBillingStore } from '../stores/billing.js';
import { formatCurrency } from '../utils/formatters.js';

// Stores
const authStore = useAuthStore();
const savedSalesStore = useSavedSalesStore();
const cartStore = useCartStore();
const shiftStore = useShiftStore();
const cashierStore = useCashierStore();
const billingStore = useBillingStore();

// Cart store refs (reactivos)
const { items: cartItems, payments, customer: selectedCustomer, status: cartStatus, currentSaleId, documentType } = storeToRefs(cartStore);

// Local state (no relacionado con carrito)
const customers = ref([]);
const categories = ref([]);
const allProducts = ref([]);
const barcode = ref('');
const barcodeInput = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const productSearchQuery = ref('');
const productCategoryFilter = ref('');
const productSearchResults = ref([]);

// Sale state tracking
const saleHasUnsavedChanges = ref(false);

// Modals
const showProductModal = ref(false);
const showPaymentModal = ref(false);
const showCustomerSearch = ref(false);
const showSavedSalesModal = ref(false);
const showStartSaleModal = ref(false);
const showSupervisorAuth = ref(false);
const showTicket = ref(false);
const showConfirmProducts = ref(false);
const showMergeSales = ref(false);
const showBarcodeScanner = ref(false);
const showBillingModal = ref(false);
const showStockValidationError = ref(false);
const showBonificationWarning = ref(false);
const validatingStock = ref(false);

// Datos para el modal de fusión
const existingSaleForMerge = ref(null);

// Stock validation error data
const stockValidationErrors = ref([]);
const unavailableBonifications = ref([]);
const availableBonifications = ref([]); // 🔥 NUEVO: Bonificaciones con stock disponible

// 🔥 OPTIMIZATION: Store inventory_numbers from stock validation
// to reuse in order creation (avoids ~10s duplicate NetSuite call)
const validatedInventoryNumbers = ref(null);

// 🔥 OPTIMIZATION: Track if stock has been validated for current cart
// to avoid re-validating when adding multiple payment methods
const stockValidatedForCurrentCart = ref(false);

// 🔥 NUEVO: Flag para rastrear si el usuario aceptó continuar sin bonificaciones
const skipBonificationsForCurrentOrder = ref(false);

// Tipo de comprobante seleccionado al inicio de la venta
const billingDocumentType = ref('boleta'); // 'boleta' o 'factura'

// Autorización pendiente
const pendingAction = ref({ type: null, data: null });

// Completed order data (for billing)
const completedOrder = ref(null);

// Snapshot of completed sale data (for ticket display)
const completedSaleSnapshot = ref(null);

// Billing document info (from legacy API)
const billingDocumentInfo = ref(null);

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

// Detectar el estado actual de la venta (A, B o C)
const saleState = computed(() => {
  const hasProducts = cartItems.value.length > 0;
  const hasCustomerDocument = selectedCustomer.value && selectedCustomer.value.documento;

  if (!hasProducts && !hasCustomerDocument) {
    return 'A'; // Carrito vacío, sin documento
  }

  if (hasProducts && !hasCustomerDocument) {
    return 'B'; // Carrito con productos, sin documento
  }

  if (hasProducts && hasCustomerDocument) {
    return 'C'; // Carrito con productos y documento registrado
  }

  // Caso: no hay productos pero hay documento (iniciado venta, sin productos aún)
  return 'A';
});

// Usar getters del cart store
const subtotal = computed(() => cartStore.subtotal);
const tax = computed(() => cartStore.tax);
const total = computed(() => cartStore.total);
const totalPaid = computed(() => cartStore.totalPaid);
const remainingAmount = computed(() => cartStore.remainingAmount);
const totalChange = computed(() => cartStore.totalChange);

// Methods
// formatCurrency is now imported from utils/formatters.js

const calculateSubtotal = (item) => {
  const precio = parseFloat(item.precio) || 0;
  const cantidad = parseInt(item.quantity) || 0;
  return precio * cantidad;
};

const handleBarcodeInput = async () => {
  if (!barcode.value) return;

  try {
    const response = await productsApi.searchByCode(barcode.value);

    if (response.success && response.data) {
      const product = {
        id: response.data.id,
        sku: response.data.sku || '',
        nombre: response.data.name,
        precio: response.data.price,
        stock: response.data.stock,
        unlimited_stock: response.data.unlimited_stock,
        categoria: response.data.category?.name || 'Sin categoría',
        images: response.data.images || []
      };

      if (product.unlimited_stock || product.stock > 0) {
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
    alert('Error al buscar el producto');
  }
};

// Abrir scanner de código de barras con cámara
const openBarcodeScanner = () => {
  showBarcodeScanner.value = true;
};

// Manejar código detectado por el scanner
const handleBarcodeDetected = async (code) => {
  console.log('📦 Barcode detected:', code);

  // Establecer el código en el input
  barcode.value = code;

  // Buscar y agregar el producto
  await handleBarcodeInput();
};

const addToCart = (product) => {
  try {
    // Si el carrito está bloqueado, requiere autorización
    if (cartStore.status === 'BLOQUEADO') {
      pendingAction.value = { type: 'add_item_blocked', data: product };
      showSupervisorAuth.value = true;
      return;
    }

    cartStore.addItem(product);

    // 🔥 OPTIMIZATION: Reset stock validation flag when cart changes
    // This ensures stock is re-validated if products are added after initial validation
    stockValidatedForCurrentCart.value = false;
  } catch (error) {
    alert(error.message);
  }
};

const incrementQuantity = (item) => {
  try {
    // Si el carrito está bloqueado, requiere autorización
    if (!cartStore.canEditQuantity) {
      pendingAction.value = { type: 'increment_quantity', data: item };
      showSupervisorAuth.value = true;
      return;
    }

    cartStore.incrementQuantity(item.id);

    // 🔥 OPTIMIZATION: Reset stock validation when quantity changes
    stockValidatedForCurrentCart.value = false;
  } catch (error) {
    alert(error.message);
  }
};

const decrementQuantity = (item) => {
  try {
    // Si el carrito está bloqueado, requiere autorización
    if (!cartStore.canEditQuantity) {
      pendingAction.value = { type: 'decrement_quantity', data: item };
      showSupervisorAuth.value = true;
      return;
    }

    cartStore.decrementQuantity(item.id);

    // 🔥 OPTIMIZATION: Reset stock validation when quantity changes
    stockValidatedForCurrentCart.value = false;
  } catch (error) {
    alert(error.message);
  }
};

const updateQuantity = (item, newQuantity) => {
  try {
    // Si el carrito está bloqueado, requiere autorización
    if (!cartStore.canEditQuantity) {
      pendingAction.value = { type: 'update_quantity', data: { item, newQuantity } };
      showSupervisorAuth.value = true;
      return;
    }

    cartStore.updateItemQuantity(item.id, newQuantity);

    // 🔥 OPTIMIZATION: Reset stock validation when quantity changes
    stockValidatedForCurrentCart.value = false;
  } catch (error) {
    alert(error.message);
  }
};

const handleConfirmRemove = (item) => {
  // Mostrar confirmación personalizada
  if (confirm(`¿Desea eliminar "${item.nombre}" del carrito?`)) {
    removeItem(item);
  }
};

const removeItem = (item) => {
  try {
    // Si el carrito está bloqueado o pagado, SIEMPRE requiere supervisor
    if (!cartStore.canRemoveProducts) {
      pendingAction.value = { type: 'remove_item', data: item };
      showSupervisorAuth.value = true;
      return;
    }

    cartStore.removeItem(item.id);

    // 🔥 OPTIMIZATION: Reset stock validation when item is removed
    stockValidatedForCurrentCart.value = false;
  } catch (error) {
    alert(error.message);
  }
};

// Guardar la venta actual para más tarde (Botón "Guardar Venta")
const saveSaleForLater = () => {
  const state = saleState.value;

  // Estado A: Carrito vacío, sin documento
  if (state === 'A') {
    // Mostrar modal "Iniciar Venta" para capturar documento del cliente
    showStartSaleModal.value = true;
    return;
  }

  // Estado B: Carrito con productos, sin documento
  if (state === 'B') {
    // Mostrar modal "Iniciar Venta" para capturar documento del cliente
    showStartSaleModal.value = true;
    return;
  }

  // Estado C: Carrito con productos y documento registrado
  if (state === 'C') {
    // Verificar si el cliente ya tiene una venta guardada
    const customerDoc = selectedCustomer.value?.documento;
    if (customerDoc) {
      const existingSales = savedSalesStore.findSalesByCustomer(customerDoc);

      // Si hay ventas guardadas del mismo cliente, mostrar modal de fusión
      if (existingSales.length > 0) {
        existingSaleForMerge.value = existingSales[0]; // Tomar la primera (más reciente)
        showMergeSales.value = true;
        return;
      }
    }

    // No hay conflicto, guardar normalmente
    autoSaveSale();
    saleHasUnsavedChanges.value = false;
    alert('✅ Venta guardada correctamente');
  }
};

// Iniciar una nueva venta (Botón "Nueva Venta")
const newSale = () => {
  const state = saleState.value;

  // Estado A: Carrito vacío, sin documento
  if (state === 'A') {
    // Simplemente mostrar el modal "Iniciar Nueva Venta"
    resetSale();
    currentSaleId.value = null;
    showStartSaleModal.value = true;
    return;
  }

  // Estado B: Carrito con productos, sin documento
  if (state === 'B') {
    // Mostrar modal de confirmación personalizado
    showConfirmProducts.value = true;
    return;
  }

  // Estado C: Carrito con productos y documento registrado
  if (state === 'C') {
    // Guardar venta anterior y crear nueva con modal
    autoSaveSale();
    saleHasUnsavedChanges.value = false;
    alert('✅ Venta anterior guardada correctamente');

    // Limpiar y abrir modal para nueva venta
    resetSale();
    currentSaleId.value = null;
    showStartSaleModal.value = true;
  }
};

// Manejar la respuesta del modal de confirmación de productos
const handleKeepProducts = () => {
  // Mantener productos, solo abrir modal para capturar documento
  showStartSaleModal.value = true;
};

const handleDeleteProducts = () => {
  // Eliminar productos y abrir modal para nueva venta
  resetSale();
  currentSaleId.value = null;
  showStartSaleModal.value = true;
};

// Manejar fusión de ventas
const handleMergeSales = (data) => {
  const { existingSaleId, mergedItems } = data;

  // Actualizar la venta guardada con los items fusionados
  savedSalesStore.updateSale(existingSaleId, {
    items: mergedItems,
    customer: selectedCustomer.value,
    payments: payments.value,
    documentType: documentType.value
  });

  // Limpiar el carrito actual
  resetSale();
  saleHasUnsavedChanges.value = false;

  alert('✅ Ventas fusionadas correctamente. La venta se encuentra en "Ventas Guardadas".');
};

// Manejar creación de nueva venta independiente
const handleCreateNewSale = () => {
  // Guardar la venta actual como una nueva venta independiente
  autoSaveSale();
  saleHasUnsavedChanges.value = false;
  alert('✅ Nueva venta independiente guardada correctamente.');
};

// Manejar inicio de venta desde el modal
const handleStartSale = (data) => {
  const state = saleState.value;

  // Guardar el tipo de comprobante seleccionado
  if (data.billingDocumentType) {
    billingDocumentType.value = data.billingDocumentType;
    console.log('📄 [POS] Billing document type selected:', billingDocumentType.value);
  }

  // Si estamos en Estado B (productos sin documento), NO limpiar el carrito
  // Solo agregar el cliente
  if (state === 'B') {
    if (data.customer) {
      selectedCustomer.value = data.customer;
    }
    saleHasUnsavedChanges.value = true; // Marcar como cambios sin guardar
    return;
  }

  // En cualquier otro caso (A o C), limpiar y empezar de nuevo
  resetSale();
  if (data.customer) {
    selectedCustomer.value = data.customer;
  }
  saleHasUnsavedChanges.value = false;
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

  // Cargar los pagos si existen
  if (sale.payments && Array.isArray(sale.payments)) {
    payments.value = [...sale.payments];
  } else {
    payments.value = [];
  }

  // Marcar como guardada (no tiene cambios sin guardar)
  saleHasUnsavedChanges.value = false;
};

const processPayment = async () => {
  // Validar que hay turno de caja abierto
  if (!shiftStore.hasActiveShift) {
    console.error('❌ [POS] No active shift - cannot process payment');
    alert('⚠️ No hay turno de caja abierto. No se pueden registrar pagos.\n\nDebes abrir un turno primero desde el menú principal.');
    return;
  }

  // 🔥 OPTIMIZATION: Skip stock validation if already validated for this cart
  // This happens when adding multiple payment methods (e.g., cash + card)
  if (stockValidatedForCurrentCart.value && payments.value.length > 0) {
    console.log('✨ [OPTIMIZATION] Stock already validated for this cart, skipping re-validation');
    // Solo mostrar el modal si hay un saldo pendiente
    if (remainingAmount.value > 0) {
      showPaymentModal.value = true;
    } else if (payments.value.length > 0) {
      // Si ya está pagado completamente, procesar la venta
      handlePaymentCompleted();
    }
    return;
  }

  // Mostrar overlay de "Consultando Stock"
  validatingStock.value = true;

  // Validar stock ANTES de abrir el modal de pago
  console.log('🔍 [POS] Validating stock before payment...');
  try {
    const items = cartItems.value.map(item => ({
      product_id: item.id,
      sku: item.sku,
      quantity: item.quantity
    }));

    const response = await ordersApi.validateStock({ items });

    if (!response.success) {
      console.error('❌ [POS] Stock validation failed:', response);

      // Ocultar overlay de validación
      validatingStock.value = false;

      // Show stock validation error modal
      const unavailableItems = response.unavailable_items || response.messages?.unavailable_items;
      if (unavailableItems && Array.isArray(unavailableItems)) {
        // Enriquecer con nombre del producto desde el carrito
        stockValidationErrors.value = unavailableItems.map(item => {
          const cartItem = cartItems.value.find(ci => ci.id === item.product_id || ci.sku === item.sku);
          // Priorizar nombre del carrito, luego backend, luego fallback
          const productName = cartItem?.nombre || item.product_name || 'Producto desconocido';
          return {
            ...item,
            product_name: productName
          };
        });
        showStockValidationError.value = true;
        return;
      }

      // Generic error fallback
      alert('No se puede procesar la venta. Por favor, verifica el stock de los productos.');
      return;
    }

    console.log('✅ [POS] Stock validation passed');

    // 🔥 OPTIMIZATION: Save inventory_numbers from validation response
    // These will be reused in createOrder() to avoid duplicate NetSuite API call (~10s saved)
    if (response.inventory_numbers) {
      validatedInventoryNumbers.value = response.inventory_numbers;
      const invCount = Object.keys(response.inventory_numbers).length;
      console.log(`🚀 [OPTIMIZATION] Saved ${invCount} inventory_numbers from validation for reuse`);
      if (response.timing) {
        console.log(`⏱️ [TIMING] Stock validation took ${response.timing.total_ms}ms (${response.timing.avg_per_item_ms}ms per item)`);
      }
    }

    // 🔥 OPTIMIZATION: Mark stock as validated for this cart
    // Subsequent payment additions won't trigger re-validation
    stockValidatedForCurrentCart.value = true;

    // Ocultar overlay de validación
    validatingStock.value = false;

  } catch (error) {
    console.error('❌ [POS] Error validating stock:', error);

    // Ocultar overlay de validación
    validatingStock.value = false;

    // Check if error contains unavailable_items
    const errorData = error.response?.data;
    const unavailableItems = errorData?.unavailable_items || errorData?.messages?.unavailable_items;

    // ✅ NUEVO: Detectar bonificaciones sin stock
    // IMPORTANTE: CI4 fail() retorna los datos dentro de 'messages'
    const hasBonificationIssues = errorData?.has_bonification_issues || errorData?.messages?.has_bonification_issues || false;
    const unavailableBonifs = errorData?.unavailable_bonifications || errorData?.messages?.unavailable_bonifications || [];
    const availableBonifs = errorData?.available_bonifications || errorData?.messages?.available_bonifications || [];

    if (unavailableItems && Array.isArray(unavailableItems)) {
      // ✅ NUEVO: Si SOLO hay problemas con bonificaciones, mostrar modal de advertencia
      if (hasBonificationIssues && unavailableBonifs.length > 0) {
        const regularItemsWithIssues = unavailableItems.filter(item => !item.is_bonification);

        // Si NO hay problemas con productos regulares, solo con bonificaciones
        if (regularItemsWithIssues.length === 0) {
          console.log('⚠️ [POS] Only bonifications have stock issues, showing warning modal');
          unavailableBonifications.value = unavailableBonifs;
          availableBonifications.value = availableBonifs; // 🔥 NUEVO: Pasar bonificaciones disponibles
          showBonificationWarning.value = true;
          return;
        }

        // Si hay problemas TANTO en productos regulares COMO en bonificaciones
        console.log('⚠️ [POS] Both regular products and bonifications have stock issues');
        // Mostrar modal de error de stock (incluye productos regulares + bonificaciones)
      }

      // Show stock validation error modal (productos regulares sin stock)
      // Enriquecer con nombre del producto desde el carrito
      stockValidationErrors.value = unavailableItems.map(item => {
        const cartItem = cartItems.value.find(ci => ci.id === item.product_id || ci.sku === item.sku);
        // Priorizar nombre del carrito, luego backend, luego fallback
        const productName = cartItem?.nombre || item.product_name || 'Producto desconocido';
        return {
          ...item,
          product_name: productName
        };
      });
      showStockValidationError.value = true;
      return;
    }

    // If validation endpoint is not available (404) or validation is disabled, continue
    if (error.response?.status === 404 || errorData?.validation_skipped) {
      console.log('⚠️ [POS] Stock validation skipped or not available');
    } else {
      // Other errors - show generic message
      alert('Error al validar stock. Por favor, intente nuevamente.');
      return;
    }
  }

  // Solo mostrar el modal si hay un saldo pendiente
  if (remainingAmount.value > 0) {
    showPaymentModal.value = true;
  } else if (payments.value.length > 0) {
    // Si ya está pagado completamente, procesar la venta
    handlePaymentCompleted();
  }
};

const handlePaymentAdded = (paymentData) => {
  // Validar turno abierto antes de agregar pago
  if (!shiftStore.hasActiveShift) {
    console.error('❌ [POS] No active shift - cannot add payment');
    alert('⚠️ No hay turno de caja abierto. No se pueden registrar pagos.');
    return;
  }

  try {
    console.log('💳 [POS] Adding payment - shift active:', shiftStore.activeShift?.id);
    console.log('📦 [POS] paymentData received:', paymentData);
    cartStore.addPayment({
      method: paymentData.method,
      methodName: getPaymentMethodName(paymentData.method),
      amount: paymentData.amount,
      reference: paymentData.reference,
      roundingAmount: paymentData.roundingAmount // 🔧 FIX: Pass roundingAmount through
    });

    // Auto-finalizar si el pago completa el total y el modal se cerró
    // (el modal se cierra solo cuando newRemaining <= 0.01)
    if (remainingAmount.value <= 0.01) {
      console.log('✅ [POS] Pago completo detectado, auto-finalizando venta...');
      // Dar un pequeño delay para que el usuario vea que se agregó el pago
      setTimeout(() => {
        handlePaymentCompleted();
      }, 300);
    }
  } catch (error) {
    alert(error.message);
  }
};

// ✅ NUEVO: Handlers para modal de advertencia de bonificaciones
const handleBonificationWarningProceed = async () => {
  console.log('✅ [POS] User accepted to proceed without bonifications');

  // 🔥 NUEVO: Marcar que esta orden debe crearse SIN bonificaciones
  skipBonificationsForCurrentOrder.value = true;

  // Cerrar modal
  showBonificationWarning.value = false;

  // 🔥 NUEVO: Reintentar validación de stock SIN bonificaciones
  // Esto evita el loop infinito enviando skip_bonification_validation: true
  console.log('🔍 [POS] Retrying stock validation without bonifications...');
  validatingStock.value = true;

  try {
    const items = cartItems.value.map(item => ({
      product_id: item.id,
      sku: item.sku,
      quantity: item.quantity
    }));

    // 🔥 NUEVO: Enviar IDs específicos de bonificaciones a excluir
    const payload = { items };
    if (unavailableBonifications.value.length > 0) {
      payload.excluded_bonification_ids = unavailableBonifications.value.map(b => b.product_id);
      console.log('🔍 [POS] Re-validating stock excluding bonifications:', payload.excluded_bonification_ids);
    }

    const response = await ordersApi.validateStock(payload);

    if (!response.success) {
      console.error('❌ [POS] Stock validation failed even without bonifications:', response);
      validatingStock.value = false;

      // Si falla incluso sin bonificaciones, es un problema con productos regulares
      const unavailableItems = response.unavailable_items || [];
      if (unavailableItems.length > 0) {
        stockValidationErrors.value = unavailableItems.map(item => {
          const cartItem = cartItems.value.find(ci => ci.id === item.product_id || ci.sku === item.sku);
          return {
            ...item,
            product_name: cartItem?.nombre || item.product_name || 'Producto desconocido'
          };
        });
        showStockValidationError.value = true;
        return;
      }

      alert('No se puede procesar la venta. Por favor, verifica el stock de los productos.');
      return;
    }

    console.log('✅ [POS] Stock validation passed without bonifications');

    // 🔥 OPTIMIZATION: Save inventory_numbers from validation response
    if (response.inventory_numbers) {
      validatedInventoryNumbers.value = response.inventory_numbers;
      const invCount = Object.keys(response.inventory_numbers).length;
      console.log(`🚀 [OPTIMIZATION] Saved ${invCount} inventory_numbers from validation for reuse`);
    }

    // 🔥 OPTIMIZATION: Mark stock as validated for this cart
    stockValidatedForCurrentCart.value = true;

    // Ocultar overlay de validación
    validatingStock.value = false;

    // Continuar con el flujo de pago
    // La exclusión de bonificaciones ocurrirá automáticamente en el backend
    // después de que el Legacy API cree la orden
    if (remainingAmount.value > 0) {
      showPaymentModal.value = true;
    } else if (payments.value.length > 0) {
      handlePaymentCompleted();
    }

  } catch (error) {
    console.error('❌ [POS] Error retrying stock validation:', error);
    validatingStock.value = false;

    // Check if error contains unavailable_items
    const errorData = error.response?.data;
    const unavailableItems = errorData?.unavailable_items || [];

    if (unavailableItems.length > 0) {
      stockValidationErrors.value = unavailableItems.map(item => {
        const cartItem = cartItems.value.find(ci => ci.id === item.product_id || ci.sku === item.sku);
        return {
          ...item,
          product_name: cartItem?.nombre || item.product_name || 'Producto desconocido'
        };
      });
      showStockValidationError.value = true;
      return;
    }

    alert('Error al validar stock. Por favor, intente nuevamente.');
  }
};

const handleBonificationWarningCancel = () => {
  console.log('⚠️ [POS] User cancelled sale due to bonification issues');

  // Cerrar modal
  showBonificationWarning.value = false;

  // No hacer nada más - el usuario puede ajustar el carrito o cancelar la venta
};

const processingOrder = ref(false);

const handlePaymentCompleted = async () => {
  // Prevenir múltiples clics
  if (processingOrder.value) {
    console.log('Order already being processed, ignoring duplicate request');
    return;
  }

  processingOrder.value = true;

  try {
    // Validación: Boleta >= S/700 requiere DNI/RUC
    if (billingDocumentType.value === 'boleta' && total.value >= 700) {
      if (!selectedCustomer.value || !selectedCustomer.value.document_number) {
        alert('⚠️ Las ventas con Boleta de S/700 o más requieren DNI o RUC del cliente.\n\nPor favor, agregue el documento del cliente antes de continuar.');
        processingOrder.value = false;
        return;
      }
    }

    // Validación: Factura siempre requiere RUC
    if (billingDocumentType.value === 'factura') {
      if (!selectedCustomer.value || selectedCustomer.value.document_type !== 'ruc') {
        alert('⚠️ Para emitir una Factura es obligatorio tener un cliente con RUC.\n\nPor favor, agregue el RUC del cliente antes de continuar.');
        processingOrder.value = false;
        return;
      }
    }

    // Debug: Ver qué contiene selectedCustomer antes de crear la orden
    console.log('🔍 [DEBUG] selectedCustomer.value:', selectedCustomer.value);
    console.log('🔍 [DEBUG] selectedCustomer.value?.email:', selectedCustomer.value?.email);
    console.log('🔍 [DEBUG] selectedCustomer.value?.correo:', selectedCustomer.value?.correo);
    console.log('🔍 [DEBUG] selectedCustomer.value?.phone:', selectedCustomer.value?.phone);
    console.log('🔍 [DEBUG] selectedCustomer.value?.telefono:', selectedCustomer.value?.telefono);
    console.log('🔍 [DEBUG] selectedCustomer.value?.document_type:', selectedCustomer.value?.document_type);
    console.log('🔍 [DEBUG] selectedCustomer.value?.document_number:', selectedCustomer.value?.document_number);

    // Preparar datos de la orden
    const orderData = {
      source: 'pos', // Identificar que la venta viene del POS
      pasarela_id: 98, // ID especial para ventas del POS
      tiendadireccion_id: shiftStore.activeShift?.tiendadireccion_id || null, // ID de la sucursal desde el turno activo
      cajero_id: cashierStore.cashier?.empleado_id || null, // ID del cajero (empleado local, no NetSuite)
      customer: {
        id: selectedCustomer.value ? selectedCustomer.value.id : null,
        email: selectedCustomer.value?.email || selectedCustomer.value?.correoElectronico || selectedCustomer.value?.correo || selectedCustomer.value?.tiendacliente_correo_electronico || selectedCustomer.value?.tiendacliente_correo || '',
        phone: selectedCustomer.value?.phone || selectedCustomer.value?.telefono || selectedCustomer.value?.tiendacliente_telefono || '',
        document_number: selectedCustomer.value?.document_number || selectedCustomer.value?.numeroDocumento || '',
        // Convertir document_type a código numérico si viene como string
        document_type: (() => {
          const docType = selectedCustomer.value?.document_type || '1';
          // Normalizar a esquema MiTienda: DNI=1, RUC=2
          if (docType === 'ruc' || docType === '2' || docType === '6') return '2';
          if (docType === 'dni' || docType === '1') return '1';
          return docType; // Si ya es numérico, usarlo tal cual
        })(),
        // Para RUC (tipo 2): enviar business_name y dejar name/lastname vacíos
        // Para DNI (tipo 1): enviar name/lastname y dejar business_name vacío
        ...((() => {
          const docType = selectedCustomer.value?.document_type || '1';
          const isRuc = docType === 'ruc' || docType === '2' || docType === '6';

          if (isRuc) {
            // Para RUC: toda la razón social va en business_name
            return {
              business_name: selectedCustomer.value?.business_name || selectedCustomer.value?.name || 'EMPRESA',
              name: '',
              lastname: ''
            };
          } else {
            // Para DNI: usar nombres y apellidos directos si están disponibles
            // Si no, intentar separar desde 'name' como fallback
            let firstName = '';
            let lastName = '';

            if (selectedCustomer.value?.nombres || selectedCustomer.value?.apellidos) {
              // Prioridad 1: usar campos nombres/apellidos directos
              firstName = selectedCustomer.value?.nombres || '';
              lastName = selectedCustomer.value?.apellidos || '';
            } else if (selectedCustomer.value?.name) {
              // Fallback: separar desde 'name' si es todo lo que tenemos
              const fullName = selectedCustomer.value?.name || 'Cliente General';
              const nameParts = fullName.trim().split(' ');
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
            } else {
              firstName = 'Cliente';
              lastName = 'General';
            }

            return {
              name: firstName,
              lastname: lastName,
              business_name: ''
            };
          }
        })())
      },
      document_type: billingDocumentType.value, // 'boleta' o 'factura'
      items: cartItems.value.map(item => ({
        product_id: item.id,
        sku: item.sku,
        name: item.nombre,
        quantity: item.quantity,
        // IMPORTANTE: item.precio YA incluye IGV, debemos extraer el precio base
        unit_price: item.precio / 1.18, // Precio sin IGV
        subtotal: (item.precio / 1.18) * item.quantity, // Subtotal sin IGV
        tax: ((item.precio / 1.18) * item.quantity) * 0.18, // IGV del subtotal
        total: item.precio * item.quantity // Total con IGV (precio original * cantidad)
      })),
      payments: payments.value.map(payment => ({
        method: payment.method,
        method_name: payment.methodName,
        amount: payment.amount,
        reference: payment.reference || null
        // authorization_number NO se envía al API legacy - causa error
      })),
      subtotal: subtotal.value,
      tax: tax.value,
      tax_rate: 0.18,
      total: total.value, // Total original (antes de redondeo)
      rounding_amount: cartStore.appliedRounding, // Redondeo aplicado (puede ser positivo o negativo)
      total_after_rounding: cartStore.totalWithRounding, // Total final después de redondeo
      currency: 'PEN',
      notes: '' // Campo para notas adicionales
    };

    // 🔥 NUEVO: Enviar IDs específicos de bonificaciones a excluir (no todas)
    // Solo se envía si el usuario aceptó continuar sin algunas bonificaciones
    if (skipBonificationsForCurrentOrder.value && unavailableBonifications.value.length > 0) {
      // Extraer los IDs de las bonificaciones sin stock
      orderData.excluded_bonification_ids = unavailableBonifications.value.map(b => b.product_id);
      console.log('🔍 [POS] Excluding specific bonifications:', orderData.excluded_bonification_ids);
    }

    // 🔥 OPTIMIZATION DISABLED: inventory_numbers causes error in legacy API
    // The legacy API doesn't recognize this field and throws 'subtract_array()' error
    // TODO: Re-enable when migrating to new order creation endpoint (CI4)
    // if (validatedInventoryNumbers.value) {
    //   orderData.inventory_numbers = validatedInventoryNumbers.value;
    //   const invCount = Object.keys(validatedInventoryNumbers.value).length;
    //   console.log(`🚀 [OPTIMIZATION] Including ${invCount} inventory_numbers in order payload (skips re-validation)`);
    // }

    // Log del payload que se enviará
    console.log('📤 [POS] Enviando orden al API:', JSON.stringify(orderData, null, 2));

    // Crear la orden en el backend
    // NOTA: El backend validará automáticamente el stock con NetSuite si la tienda
    // tiene habilitada la validación (tienda_netsuite_stock_validation = 1)
    const response = await ordersApi.createOrder(orderData);

    console.log('📥 [POS] Response from API:', response);
    console.log('📥 [POS] Response.error:', response.error);
    console.log('📥 [POS] Response.success:', response.success);
    console.log('📥 [POS] Response.message:', response.message);
    console.log('📥 [POS] Response.data:', response.data);
    console.log('📥 [POS] Response.data type:', typeof response.data);
    console.log('📥 [POS] Response.data keys:', Object.keys(response.data || {}));

    // El backend puede devolver dos formatos:
    // 1. {error: 0, message: '...', data: {...}} (formato estándar)
    // 2. {success: true, message: '...', data: {...}} (formato alternativo)
    const isSuccess = response.error === 0 || response.error === false || response.success === true;

    if (isSuccess) {
      console.log('Orden creada exitosamente:', response.data);

      // El backend legacy ya actualiza el stock automáticamente
      // No necesitamos hacerlo manualmente desde el frontend

      // Registrar movimientos de caja por cada pago
      if (shiftStore.hasActiveShift) {
        const shiftId = shiftStore.activeShift.id;
        const saleReference = `VENTA-${response.data.order_id || response.data.id || Date.now()}`;
        const customerName = selectedCustomer.value?.name || 'Cliente General';

        console.log('💰 [POS] Registering cash movements for shift:', shiftId);

        for (const payment of payments.value) {
          try {
            await cashMovementsApi.registerSale(
              shiftId,
              payment.method,
              payment.amount,
              saleReference,
              customerName
            );
            console.log(`✅ [POS] Movement registered: ${payment.method} - S/ ${payment.amount}`);
          } catch (movementError) {
            console.error('❌ [POS] Error registering movement:', movementError);
            // No interrumpir el flujo si falla el registro de movimiento
            // La venta ya se completó exitosamente
          }
        }

        // Actualizar turno activo para reflejar los nuevos totales
        try {
          await shiftStore.fetchActiveShift();
        } catch (shiftError) {
          console.error('Error updating shift data:', shiftError);
        }
      } else {
        console.warn('⚠️ [POS] No active shift - movements not registered');
      }

      // Si esta venta estaba guardada, eliminarla de las ventas guardadas
      if (currentSaleId.value) {
        savedSalesStore.deleteSavedSale(currentSaleId.value);
      }

      // Guardar datos de la orden para facturación
      // Intentar extraer el ID de diferentes posibles ubicaciones en la respuesta
      const orderId = response.data?.order_id
                   || response.data?.id
                   || response.data?.tiendaventa_id
                   || response.order_id
                   || response.id;

      const orderNumber = response.data?.order_number
                       || response.data?.order_code
                       || response.data?.tiendaventa_codigoreferencia
                       || response.order_number
                       || response.order_code;

      console.log('🔍 [POS] Extracted orderId:', orderId);
      console.log('🔍 [POS] Extracted orderNumber:', orderNumber);

      const orderInfo = {
        order_id: orderId ? parseInt(orderId, 10) : null,
        order_code: orderNumber || (orderId ? `VENTA-${orderId}` : `VENTA-${Date.now()}`),
        total: total.value,
        customer: selectedCustomer.value
      };

      console.log('📦 [POS] Order info prepared:', orderInfo);

      // Si tenemos order_id, obtener datos completos del backend
      // Si no, usar datos locales (fallback)
      if (orderId) {
        try {
          console.log('🔍 [POS] Fetching complete order data from backend...');
          const orderDetails = await ordersApi.getOrder(orderId);
          console.log('✅ [POS] Order details received:', orderDetails);
          console.log('🔍 [POS] orderDetails.subtotal:', orderDetails.subtotal);
          console.log('🔍 [POS] orderDetails.tax:', orderDetails.tax);
          console.log('🔍 [POS] orderDetails.tiendaventa_totalpagar:', orderDetails.tiendaventa_totalpagar);
          console.log('🔍 [POS] orderDetails.total_amount:', orderDetails.total_amount);
          console.log('🔍 [POS] orderDetails.payments:', orderDetails.payments);
          if (orderDetails.payments && orderDetails.payments.length > 0) {
            console.log('🔍 [POS] First payment:', orderDetails.payments[0]);
          }
          console.log('🔍 [POS] orderDetails.products:', orderDetails.products);
          console.log('🔍 [POS] orderDetails.order_items:', orderDetails.order_items);
          if (orderDetails.order_items && orderDetails.order_items.length > 0) {
            console.log('🔍 [POS] First item:', orderDetails.order_items[0]);
          }

          // Mapear los datos del backend al formato que espera el modal
        completedSaleSnapshot.value = {
          orderId: parseInt(orderDetails.tiendaventa_id || orderId),
          orderNumber: orderDetails.tiendaventa_codigoreferencia || orderNumber,
          customer: {
            name: `${orderDetails.tiendaventa_nombres || ''} ${orderDetails.tiendaventa_apellidos || ''}`.trim() || 'Cliente General',
            email: orderDetails.tiendaventa_correoelectronico || '',
            phone: orderDetails.tiendaventa_telefono || '',
            document_number: orderDetails.customer?.document_number || '',
            document_type: orderDetails.customer?.document_type || 'dni'
          },
          items: (orderDetails.products || orderDetails.order_items || []).map(item => ({
            id: item.id,
            nombre: item.name || item.product_name || item.tittle || 'Producto',
            quantity: item.quantity || item.cantidad || 1,
            precio: parseFloat(item.price || item.precio || 0),
            total: parseFloat(item.total || 0)
          })),
          // Usar pagos locales en lugar de los del backend (que pueden venir como 'unknown')
          payments: payments.value.map(payment => ({
            method: payment.method,
            methodName: payment.methodName,
            amount: payment.amount,
            reference: payment.reference || '',
            authorization_number: payment.authorization_number || null
          })),
          subtotal: parseFloat(orderDetails.subtotal || 0),
          tax: parseFloat(orderDetails.tax || 0),
          total: parseFloat(orderDetails.tiendaventa_totalpagar || orderDetails.total || 0),
          roundingAmount: cartStore.appliedRounding, // Redondeo aplicado desde el cart store
          totalAfterRounding: cartStore.totalWithRounding, // Total después del redondeo
          documentType: billingDocumentType.value,
          createdAt: orderDetails.tiendaventa_fecha || new Date().toISOString(),
          cajero: orderDetails.cajero_nombre || authStore.user?.name || '',
          // Información del comprobante electrónico (si está facturado)
          billingDocument: orderDetails.billing_info?.['e-billing'] ? {
            serie: orderDetails.billing_info['e-billing'].serie,
            correlative: orderDetails.billing_info['e-billing'].correlative,
            status: orderDetails.billing_info['e-billing'].status,
            billingDate: orderDetails.billing_info['e-billing'].billing_date,
            files: {
              pdf: orderDetails.billing_info['e-billing'].url_pdf,
              xml: orderDetails.billing_info['e-billing'].url_xml
            }
          } : null,
          _rawData: orderDetails // Guardar datos originales por si se necesitan
        };

        console.log('📸 [POS] Sale data fetched and mapped:', completedSaleSnapshot.value);
        if (completedSaleSnapshot.value.billingDocument) {
          console.log('📄 [POS] Billing document found:', completedSaleSnapshot.value.billingDocument);
        }

        // Mostrar el ticket
        showTicket.value = true;

        // El API legacy emite el comprobante automáticamente
        // Solo necesitamos esperar un momento para que el usuario vea el ticket
        setTimeout(() => {
          console.log('✅ [POS] Sale completed successfully. Billing document was emitted by legacy API.');
          resetSale();
        }, 2000); // 2 segundos para que el usuario vea el ticket
        } catch (fetchError) {
          console.error('❌ [POS] Error fetching order details:', fetchError);
          // Si falla la obtención, mostrar el ticket con datos locales como fallback
          alert('La venta se completó exitosamente, pero no se pudieron obtener todos los detalles.\n\nPuede consultar la venta en el módulo de Ventas.');
          resetSale();
        }
      } else {
        // No hay order_id - usar datos locales como fallback
        console.warn('⚠️ [POS] No order_id received, using local data for ticket');
        completedSaleSnapshot.value = {
          orderId: null,
          orderNumber: orderNumber || `VENTA-${Date.now()}`,
          customer: selectedCustomer.value ? { ...selectedCustomer.value } : null,
          items: cartItems.value.map(item => ({ ...item })),
          payments: payments.value.map(payment => ({ ...payment })),
          subtotal: subtotal.value,
          tax: tax.value,
          total: total.value,
          roundingAmount: cartStore.appliedRounding, // Redondeo aplicado desde el cart store
          totalAfterRounding: cartStore.totalWithRounding, // Total después del redondeo
          documentType: billingDocumentType.value,
          createdAt: new Date().toISOString(),
          cajero: authStore.user?.name || '',
        };

        showTicket.value = true;

        setTimeout(() => {
          console.log('✅ [POS] Sale completed successfully with local data.');
          resetSale();
        }, 2000);
      }
    } else {
      // Si error no es 0, es un error del backend
      const errorMsg = response.message || response.error_message || 'Error al crear la orden';
      const errorDetails = response.messages?.mensaje || response.details || '';
      throw new Error(errorMsg + (errorDetails ? `\n\n${errorDetails}` : ''));
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);

    // Detectar error de stock insuficiente en NetSuite
    const errorData = error.response?.data;
    const unavailableItems = errorData?.unavailable_items || errorData?.messages?.unavailable_items;

    if (unavailableItems && Array.isArray(unavailableItems)) {
      // Mostrar modal especializado para errores de stock
      console.log('🚨 [POS] Stock validation failed:', unavailableItems);
      // Enriquecer con nombre del producto desde el carrito
      stockValidationErrors.value = unavailableItems.map(item => {
        const cartItem = cartItems.value.find(ci => ci.id === item.product_id || ci.sku === item.sku);
        // Priorizar nombre del carrito, luego backend, luego fallback
        const productName = cartItem?.nombre || item.product_name || 'Producto desconocido';
        return {
          ...item,
          product_name: productName
        };
      });
      showStockValidationError.value = true;
    } else {
      // Error genérico
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la venta';
      const errorDetails = error.response?.data?.errors || error.response?.data?.data || '';
      const fullMessage = errorDetails ? `${errorMessage}\n\nDetalles: ${JSON.stringify(errorDetails)}` : errorMessage;
      alert(`Error: ${fullMessage}\n\nPor favor, intente nuevamente.`);
    }
  } finally {
    processingOrder.value = false;
  }
};

const cancelSale = () => {
  if (confirm('¿Está seguro de cancelar la venta?')) {
    resetSale();
  }
};

const resetSale = (orderData = null) => {
  // If we have order data, store it for billing and show billing modal
  if (orderData && orderData.order_id) {
    completedOrder.value = orderData;
    // Show billing modal after a short delay
    setTimeout(() => {
      showBillingModal.value = true;
    }, 300);
  }

  cartStore.reset();
  searchQuery.value = '';
  searchResults.value = [];
  saleHasUnsavedChanges.value = false;
  billingDocumentType.value = 'boleta'; // Reset to default

  // 🔥 OPTIMIZATION: Clear validated inventory numbers and stock validation flag
  validatedInventoryNumbers.value = null;
  stockValidatedForCurrentCart.value = false;

  // 🔥 NUEVO: Resetear flag de bonificaciones
  skipBonificationsForCurrentOrder.value = false;
};

const handleBillingSuccess = (billingData) => {
  console.log('Comprobante emitido:', billingData);
  // You could show a notification here
  alert('Comprobante emitido exitosamente');
};

const handleBillingError = (error) => {
  console.error('Error al emitir comprobante:', error);
  // You could show an error notification here
  alert('Error al emitir comprobante: ' + error);
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
    const response = await productsApi.getProducts({
      search: barcode.value,
      limit: 5,
      published: true
    });

    if (response.success) {
      searchResults.value = response.data.map(item => ({
        id: item.id,
        sku: item.sku ? String(item.sku) : '',
        nombre: item.name,
        precio: item.price,
        stock: item.stock,
        unlimited_stock: item.unlimited_stock,
        categoria: item.category?.name || 'Sin categoría',
        images: item.images || []
      }));
    }
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

  if (safeProduct.unlimited_stock || safeProduct.stock > 0) {
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
    const productsResponse = await productsApi.getProducts({
      limit: 100,
      published: true
    });

    if (productsResponse.success) {
      // Extraer categorías únicas de los productos
      const uniqueCategories = new Set();
      productsResponse.data.forEach(item => {
        if (item.category?.name) {
          uniqueCategories.add(item.category.name);
        }
      });
      categories.value = Array.from(uniqueCategories);

      // Mapear productos al formato del POS
      allProducts.value = productsResponse.data.map(item => ({
        id: item.id,
        sku: item.sku ? String(item.sku) : '',
        nombre: item.name,
        precio: item.price,
        stock: item.stock,
        unlimited_stock: item.unlimited_stock,
        categoria: item.category?.name || 'Sin categoría',
        images: item.images || []
      }));
    }

    showProductModal.value = true;
  } catch (error) {
    console.error('Error loading product list:', error);
    alert('Error al cargar la lista de productos');
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
  console.log('🎯 POS: Customer selected:', customer);
  console.log('🎯 POS: Customer name:', customer?.name);
  selectedCustomer.value = customer;
  console.log('🎯 POS: selectedCustomer updated:', selectedCustomer.value);
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

// Watcher para guardar automáticamente la venta cuando cambia el carrito o los pagos
watch([cartItems, payments, selectedCustomer], () => {
  // Solo guardar si hay productos en el carrito
  if (cartItems.value.length > 0) {
    autoSaveSale();
    // Marcar que hay cambios guardados automáticamente
    saleHasUnsavedChanges.value = false;
  }
}, { deep: true });

// Función para guardar automáticamente la venta
const autoSaveSale = () => {
  // No guardar si no hay productos en el carrito
  if (!cartItems.value.length) return;

  const saleData = {
    customer: selectedCustomer.value,
    items: [...cartItems.value],
    subtotal: subtotal.value,
    tax: tax.value,
    total: total.value,
    payments: [...payments.value]
  };

  // Si ya existe un ID para esta venta, actualizar en lugar de crear una nueva
  if (currentSaleId.value) {
    savedSalesStore.updateSale(currentSaleId.value, saleData);
  } else {
    // Guardar la venta y obtener el nuevo ID
    const saleId = savedSalesStore.saveSale(saleData);
    currentSaleId.value = saleId;
  }
};

// Watcher para showPaymentModal
watch(showPaymentModal, (newValue) => {
  if (!newValue) {
    // No reseteamos la venta automáticamente
    // La venta solo debe resetearse cuando el usuario explícitamente finaliza la venta
    // con el botón "Completar venta"
  }
});

// Watcher para showTicket - limpiar snapshot cuando se cierra el ticket
watch(showTicket, (newValue) => {
  if (!newValue && completedSaleSnapshot.value) {
    console.log('🧹 [POS] Cleaning up sale snapshot after ticket closed');
    completedSaleSnapshot.value = null;
  }
});

const removePayment = (index) => {
  // SIEMPRE requiere PIN de supervisor
  pendingAction.value = { type: 'remove_payment', data: { index } };
  showSupervisorAuth.value = true;
};

// Handler para cuando el supervisor autoriza
const onSupervisorAuthorized = (authData) => {
  const { type, data } = pendingAction.value;

  console.log('✅ [POS] Supervisor authorized:', {
    action: type,
    authData,
    pendingData: data
  });

  try {
    switch (type) {
      case 'add_item_blocked':
        // Agregar producto con autorización de cajero
        console.log('➕ [POS] Adding item with authorization');
        cartStore.addItem(data, authData);
        break;

      case 'increment_quantity':
        console.log('⬆️ [POS] Incrementing quantity with authorization');
        cartStore.incrementQuantity(data.id, authData);
        break;

      case 'decrement_quantity':
        console.log('⬇️ [POS] Decrementing quantity with authorization');
        cartStore.decrementQuantity(data.id, authData);
        break;

      case 'update_quantity':
        console.log('✏️ [POS] Updating quantity with authorization');
        cartStore.updateItemQuantity(data.item.id, data.newQuantity, authData);
        break;

      case 'remove_item':
        // Quitar producto requiere supervisor
        console.log('🗑️ [POS] Removing item with supervisor authorization');
        cartStore.removeItem(data.id, authData);
        break;

      case 'remove_payment':
        // Quitar pago requiere supervisor
        console.log('💳 [POS] Removing payment with supervisor authorization');
        cartStore.removePayment(data.index, authData);
        break;

      default:
        console.warn('⚠️ [POS] Unhandled action:', type);
    }

    // Limpiar acción pendiente
    pendingAction.value = { type: null, data: null };
  } catch (error) {
    console.error('❌ [POS] Error executing authorized action:', error);
    alert(error.message);
  }
};

// Handler para cuando se cancela la autorización
const onSupervisorCancelled = () => {
  pendingAction.value = { type: null, data: null };
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

<template>
  <div class="h-[calc(100dvh-4rem)] flex flex-col">
    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Cart -->
      <div class="w-2/3 bg-white flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow px-6 py-4 flex-shrink-0 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Ventas</h1>

        </header>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Barcode Scanner -->
          <div class="mb-6 search-container relative">
            <div class="flex gap-2">
              <div class="flex-grow relative">
                <input ref="barcodeInput" v-model="barcode" type="text"
                  placeholder="Escanear código de barras o buscar producto..."
                  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="handleBarcodeInput" @input="searchProducts">

                <!-- Search Results Dropdown -->
                <div v-if="searchResults.length > 0"
                  class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg max-h-60 overflow-auto border border-gray-200">
                  <ul>
                    <li v-for="product in searchResults" :key="product.id" class="p-2 hover:bg-gray-100 cursor-pointer"
                      @click="selectProduct(product)">
                      <div class="flex justify-between">
                        <span>{{ product.nombre }}</span>
                        <span class="text-gray-600">{{ formatCurrency(product.precio) }}</span>
                      </div>
                      <div class="text-sm text-gray-500">
                        SKU: {{ product.sku }} | Stock: {{ product.unlimited_stock ? '∞ Ilimitado' : product.stock }}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <button @click="openBarcodeScanner" class="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center" title="Escanear con cámara">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </button>
              <button @click="showProductList" class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 flex items-center justify-center" title="Buscar en catálogo">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
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
                    <QuantityStepperInput
                      v-model="item.quantity"
                      :min="1"
                      :max="item.unlimited_stock ? 9999 : item.stock"
                      :disabled="false"
                      :confirm-on-zero="true"
                      @update:modelValue="(newQuantity) => updateQuantity(item, newQuantity)"
                      @confirm-remove="handleConfirmRemove(item)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(calculateSubtotal(item)) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="removeItem(item)" class="text-red-600 hover:text-red-900">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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


          <div class="flex space-x-2 mb-4">
            <button @click="showSavedSalesModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Ventas Guardadas
            </button>

            <button @click="saveSaleForLater" :disabled="!cartItems.length"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v8" />
                <path d="m16 6-4 4-4-4" />
                <rect width="20" height="8" x="2" y="14" rx="2" />
                <path d="M6 18h.01" />
                <path d="M10 18h.01" />
              </svg>
              Guardar Venta
            </button>

            <button @click="newSale"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nueva Venta
            </button>
          </div>



          <!-- Customer Selection -->
          <div class="mb-4">
            <span v-if="selectedCustomer">
              <strong>Cliente:</strong>
              {{ selectedCustomer.name }}
              <span v-if="selectedCustomer.document_number">
                ({{ selectedCustomer.document_type === '1' ? 'DNI' : 'RUC' }}: {{ selectedCustomer.document_number }})
              </span>
            </span>

            <!-- <button @click="showCustomerSearch = true"
              class="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <!-- aqui teniamos un span --
              <span v-else class="text-gray-500">Seleccionar Cliente</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button> -->
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <div v-if="totalChange > 0" class="flex justify-between font-medium text-blue-600">
                  <span>Cambio:</span>
                  <span>{{ formatCurrency(totalChange) }}</span>
                </div>
                <div class="flex justify-between font-medium"
                  :class="remainingAmount === 0 ? 'text-green-700' : 'text-red-600'">
                  <span>Saldo pendiente:</span>
                  <span>{{ formatCurrency(remainingAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Actions -->
          <div class="flex-shrink-0 mt-auto space-y-4">
            <button v-if="payments.length === 0 || remainingAmount > 0" @click="processPayment"
              :disabled="!cartItems.length"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Añadir Pago
            </button>
            <button v-if="payments.length > 0 && remainingAmount === 0" @click="handlePaymentCompleted"
              :disabled="processingOrder"
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Completar Venta
            </button>
            <div class="flex space-x-2">

              <button @click="cancelSale" :disabled="!cartItems.length"
                class="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200">
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
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Lista de Productos</h3>
                <button @click="closeProductModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <!-- Search and Filters -->
              <div class="mb-4 grid grid-cols-2 gap-4">
                <input v-model="productSearchQuery" type="text" placeholder="Buscar productos..."
                  class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" @input="searchProductList">
                <select v-model="productCategoryFilter" class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  @change="searchProductList">
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
                        <button @click="selectProduct(product)" :disabled="!product.unlimited_stock && product.stock === 0"
                          class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed">
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
          <button type="button" @click="closeProductModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Start Sale Modal -->
  <StartSaleModal v-model="showStartSaleModal" @start="handleStartSale" />

  <!-- Customer Search Modal -->
  <CustomerSearchModal v-model="showCustomerSearch" @select="handleCustomerSelect" />

  <!-- Payment Modal -->
  <PaymentModal v-model="showPaymentModal" :total="total" :subtotal="subtotal" :tax="tax" :customer="selectedCustomer" :items="cartItems"
    :payments="payments" :document-type="documentType" :remaining-amount="remainingAmount" :show-ticket="showTicket"
    :completed-sale-data="completedSaleSnapshot"
    @payment-added="handlePaymentAdded" @sale-finalized="resetSale" @update:show-ticket="showTicket = $event" />

  <!-- Saved Sales Modal -->
  <SavedSalesModal v-model="showSavedSalesModal" @resume-sale="resumeSavedSale" />

  <!-- Supervisor Authorization Modal -->
  <SupervisorAuthModal
    v-model="showSupervisorAuth"
    :action="pendingAction.type"
    @authorized="onSupervisorAuthorized"
    @cancelled="onSupervisorCancelled"
  />

  <!-- Confirm Products Modal -->
  <ConfirmProductsModal
    v-model="showConfirmProducts"
    :products="cartItems"
    :product-count="cartItems.length"
    @keep="handleKeepProducts"
    @delete="handleDeleteProducts"
  />

  <!-- Merge Sales Modal -->
  <MergeSalesModal
    v-if="existingSaleForMerge"
    v-model="showMergeSales"
    :existing-sale="existingSaleForMerge"
    :current-sale="{ items: cartItems, payments: payments, customer: selectedCustomer }"
    :customer-name="selectedCustomer?.nombre || selectedCustomer?.razonSocial || 'Cliente'"
    @merge="handleMergeSales"
    @create-new="handleCreateNewSale"
  />

  <!-- Barcode Scanner Modal -->
  <BarcodeScanner
    v-model="showBarcodeScanner"
    @detected="handleBarcodeDetected"
  />

  <!-- Billing Document Modal -->
  <BillingDocumentModal
    v-if="completedOrder"
    v-model="showBillingModal"
    :order-id="completedOrder.order_id"
    :order-label="`Venta #${completedOrder.order_code || completedOrder.order_id || 'N/A'}`"
    :order-total="completedOrder.total"
    :customer="completedOrder.customer"
    @success="handleBillingSuccess"
    @error="handleBillingError"
  />

  <!-- Stock Validation Overlay -->
  <ProcessingOverlay
    :show="validatingStock"
    title="Consultando Stock"
    message="Verificando disponibilidad de productos..."
  />

  <!-- Processing Overlay -->
  <ProcessingOverlay
    :show="processingOrder"
    title="Procesando Venta"
    message="Por favor espere mientras completamos su venta..."
  />

  <!-- Stock Validation Error Modal -->
  <StockValidationErrorModal
    :is-visible="showStockValidationError"
    :unavailable-items="stockValidationErrors"
    @close="showStockValidationError = false"
  />

  <!-- Bonification Warning Modal -->
  <BonificationWarningModal
    :is-visible="showBonificationWarning"
    :unavailable-bonifications="unavailableBonifications"
    :available-bonifications="availableBonifications"
    @proceed="handleBonificationWarningProceed"
    @cancel="handleBonificationWarningCancel"
  />
</template>
