<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useShiftStore } from '../stores/shift';
import { productsApi } from '../services/productsApi';
import { ordersApi } from '../services/ordersApi';
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
import { useBillingStore } from '../stores/billing.js';

// Stores
const authStore = useAuthStore();
const savedSalesStore = useSavedSalesStore();
const cartStore = useCartStore();
const shiftStore = useShiftStore();
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

// Datos para el modal de fusión
const existingSaleForMerge = ref(null);

// Autorización pendiente
const pendingAction = ref({ type: null, data: null });

// Completed order data (for billing)
const completedOrder = ref(null);

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
    const response = await productsApi.searchByCode(barcode.value);

    if (response.success && response.data) {
      const product = {
        id: response.data.id,
        sku: response.data.sku || '',
        nombre: response.data.name,
        precio: response.data.price,
        stock: response.data.stock,
        categoria: response.data.category?.name || 'Sin categoría',
        images: response.data.images || []
      };

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
  } catch (error) {
    alert(error.message);
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

const processPayment = () => {
  // Validar que hay turno de caja abierto
  if (!shiftStore.hasActiveShift) {
    console.error('❌ [POS] No active shift - cannot process payment');
    alert('⚠️ No hay turno de caja abierto. No se pueden registrar pagos.\n\nDebes abrir un turno primero desde el menú principal.');
    return;
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
    cartStore.addPayment({
      method: paymentData.method,
      methodName: getPaymentMethodName(paymentData.method),
      amount: paymentData.amount,
      reference: paymentData.reference
    });

    // Ya no procesamos la venta automáticamente cuando el saldo llega a cero
    // Esto permite al usuario ver el resumen de la orden
  } catch (error) {
    alert(error.message);
  }
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
    // Preparar datos de la orden
    const orderData = {
      customer_id: selectedCustomer.value ? selectedCustomer.value.id : null,
      customer_name: selectedCustomer.value ? selectedCustomer.value.name : 'Cliente General',
      customer_email: selectedCustomer.value?.email || '',
      customer_phone: selectedCustomer.value?.phone || '',
      customer_document: selectedCustomer.value?.document_number || '',
      document_type: documentType.value, // 'boleta' o 'factura'
      items: cartItems.value.map(item => ({
        product_id: item.id,
        sku: item.sku,
        name: item.nombre,
        quantity: item.quantity,
        unit_price: item.precio,
        subtotal: item.precio * item.quantity,
        tax: (item.precio * item.quantity) * 0.18,
        total: (item.precio * item.quantity) * 1.18
      })),
      payments: payments.value.map(payment => ({
        method: payment.method,
        method_name: payment.methodName,
        amount: payment.amount,
        reference: payment.reference || null
      })),
      subtotal: subtotal.value,
      tax: tax.value,
      tax_rate: 0.18,
      total: total.value,
      currency: 'PEN'
    };

    // Crear la orden en el backend
    const response = await ordersApi.createOrder(orderData);

    if (response.success) {
      console.log('Orden creada exitosamente:', response.data);

      // Actualizar stock localmente (el backend ya lo actualiza, pero mantenemos sincronizado)
      for (const item of cartItems.value) {
        const updatedStock = item.stock - item.quantity;
        await productsApi.updateStock(item.id, updatedStock);
      }

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
      const orderInfo = {
        order_id: response.data.order_id || response.data.id,
        order_code: response.data.order_code || `VENTA-${response.data.order_id || response.data.id}`,
        total: total.value
      };

      // Mostrar el ticket
      showTicket.value = true;

      // Pasar datos de orden al resetSale para mostrar modal de facturación
      // Lo hacemos después de un delay para que el usuario vea el ticket primero
      setTimeout(() => {
        if (confirm('¿Desea emitir un comprobante de pago (Boleta o Factura)?')) {
          completedOrder.value = orderInfo;
          showBillingModal.value = true;
        }
      }, 1000);
    } else {
      throw new Error(response.message || 'Error al crear la orden');
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la venta';
    alert(`Error: ${errorMessage}\n\nPor favor, intente nuevamente.`);
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
                      <div class="text-sm text-gray-500">SKU: {{ product.sku }} | Stock: {{ product.stock }}</div>
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
                    <div class="flex items-center">
                      <button @click="decrementQuantity(item)" class="p-1 rounded-full hover:bg-gray-200"
                        :disabled="item.quantity <= 1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span class="mx-2 text-sm">{{ item.quantity }}</span>
                      <button @click="incrementQuantity(item)" class="p-1 rounded-full hover:bg-gray-200"
                        :disabled="item.quantity >= item.stock">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <svg v-if="processingOrder" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ processingOrder ? 'Procesando...' : 'Completar Venta' }}
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
                        <button @click="selectProduct(product)" :disabled="product.stock === 0"
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
  <PaymentModal v-model="showPaymentModal" :total="total" :customer="selectedCustomer" :items="cartItems"
    :payments="payments" :document-type="documentType" :remaining-amount="remainingAmount" :show-ticket="showTicket"
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
    :order-id="completedOrder.order_id || completedOrder.id"
    :order-label="`Venta #${completedOrder.order_code || completedOrder.order_id || completedOrder.id}`"
    :order-total="total"
    :customer="selectedCustomer"
    @success="handleBillingSuccess"
    @error="handleBillingError"
  />
</template>
