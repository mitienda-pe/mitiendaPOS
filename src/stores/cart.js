import { defineStore } from 'pinia';

/**
 * Store de Carrito de Compras con Estados
 *
 * Estados del carrito:
 * - ABIERTO: Carrito editable, sin pagos
 * - BLOQUEADO: Carrito con pagos parciales, requiere PIN para editar
 * - PAGADO: Pago completo, solo permite eliminar con PIN supervisor
 * - FINALIZADO: Venta completada, carrito cerrado
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    payments: [],
    customer: null,
    documentType: 'boleta', // 'boleta' o 'factura'
    status: 'ABIERTO', // ABIERTO, BLOQUEADO, PAGADO, FINALIZADO
    currentSaleId: null,
    unsavedChanges: false,

    // Redondeo aplicado (solo para efectivo)
    roundingAdjustment: 0, // Monto del redondeo aplicado (puede ser positivo o negativo)

    // Para autorizaciones pendientes
    pendingAuthorization: null // { action: 'remove_item', data: {...}, resolve, reject }
  }),

  getters: {
    // ========== Estados del carrito ==========
    isOpen: (state) => state.status === 'ABIERTO',
    isBlocked: (state) => state.status === 'BLOQUEADO',
    isPaid: (state) => state.status === 'PAGADO',
    isFinalized: (state) => state.status === 'FINALIZADO',

    // ========== Permisos de edición ==========
    canAddProducts: (state) => {
      // Siempre se puede agregar con PIN del cajero en estados ABIERTO y BLOQUEADO
      return ['ABIERTO', 'BLOQUEADO'].includes(state.status);
    },

    canEditQuantity: (state) => {
      // Solo en ABIERTO sin PIN, en BLOQUEADO requiere PIN cajero
      return state.status === 'ABIERTO';
    },

    canRemoveProducts: (state) => {
      // Solo en ABIERTO sin PIN, en otros estados requiere PIN supervisor
      return state.status === 'ABIERTO';
    },

    canAddPayments: (state) => {
      return ['ABIERTO', 'BLOQUEADO'].includes(state.status);
    },

    canRemovePayments: (state) => {
      // Siempre requiere PIN supervisor, nunca permitido directamente
      return false;
    },

    requiresSupervisorForEdit: (state) => {
      return state.status !== 'ABIERTO';
    },

    requiresSupervisorForRemove: (state) => {
      return state.status !== 'ABIERTO';
    },

    // ========== Cálculos financieros ==========
    // IMPORTANTE: Los precios en BD YA incluyen IGV
    // Por lo tanto, debemos extraer el IGV del precio, no agregarlo
    subtotal: (state) => {
      return state.items.reduce((sum, item) => {
        const precioConIGV = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.quantity) || 0;
        // Extraer el precio sin IGV: precio_con_igv / 1.18
        const precioSinIGV = precioConIGV / 1.18;
        return sum + (precioSinIGV * cantidad);
      }, 0);
    },

    tax(state) {
      // El IGV es el 18% del subtotal (precio sin IGV)
      return this.subtotal * 0.18;
    },

    total(state) {
      // Total = Subtotal (sin IGV) + IGV
      return this.subtotal + this.tax;
    },

    // 🔧 FIX: Calcular el redondeo de forma anticipada (no esperar al primer pago)
    // Esto permite que remainingAmount use el total redondeado desde el inicio
    anticipatedRounding(state) {
      // Si ya hay un pago en efectivo, usar el redondeo guardado
      if (state.roundingAdjustment !== 0) {
        return state.roundingAdjustment;
      }

      // Si no hay pagos aún, pre-calcular el redondeo que se aplicará
      // cuando se haga el primer pago en efectivo
      const totalBeforeRounding = this.total;
      const roundedTotal = Math.round(totalBeforeRounding * 10) / 10; // roundToValidAmount
      return Math.round((roundedTotal - totalBeforeRounding) * 100) / 100;
    },

    // Total con redondeo aplicado (para efectivo)
    totalWithRounding(state) {
      return this.total + this.anticipatedRounding;
    },

    totalPaid: (state) => {
      return state.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    },

    remainingAmount(state) {
      // 🔧 FIX: SIEMPRE usar el total redondeado (anticipatedRounding)
      // Esto asegura que la validación de pagos use el monto correcto desde el inicio
      const totalToPay = this.totalWithRounding;
      return Math.max(0, Math.round((totalToPay - this.totalPaid) * 100) / 100);
    },

    totalChange: (state) => {
      const cashPayments = state.payments.filter(p => p.method === 'efectivo');
      let totalChangeAmount = 0;

      cashPayments.forEach(payment => {
        const match = payment.reference?.match(/Cambio: S\/\s*([\d.]+)/);
        if (match) {
          totalChangeAmount += parseFloat(match[1]);
        }
      });

      return Math.round(totalChangeAmount * 100) / 100;
    },

    isFullyPaid(state) {
      return this.remainingAmount <= 0.01; // Tolerancia de 1 centavo
    },

    hasItems: (state) => state.items.length > 0,
    hasPayments: (state) => state.payments.length > 0,
    hasCustomer: (state) => state.customer !== null,

    isEmpty: (state) => state.items.length === 0 && state.payments.length === 0,

    // Estado para UI
    statusLabel: (state) => {
      const labels = {
        'ABIERTO': 'Abierto',
        'BLOQUEADO': 'Bloqueado',
        'PAGADO': 'Pagado',
        'FINALIZADO': 'Finalizado'
      };
      return labels[state.status] || state.status;
    },

    statusColor: (state) => {
      const colors = {
        'ABIERTO': 'green',
        'BLOQUEADO': 'yellow',
        'PAGADO': 'blue',
        'FINALIZADO': 'gray'
      };
      return colors[state.status] || 'gray';
    }
  },

  actions: {
    // ========== Gestión de Items ==========

    /**
     * Agregar producto al carrito
     * @param {Object} product - Producto a agregar
     * @param {Object} authorization - Opcional: datos de autorización si carrito está bloqueado
     */
    addItem(product, authorization = null) {
      console.log('🛒 [CART] addItem called:', {
        product: product.nombre,
        status: this.status,
        canAddProducts: this.canAddProducts,
        hasAuthorization: !!authorization,
        authData: authorization
      });

      // Validar estado
      if (!this.canAddProducts && !authorization) {
        console.error('❌ [CART] Cannot add products - invalid state');
        throw new Error('No se pueden agregar productos. Carrito en estado: ' + this.status);
      }

      // Si está bloqueado y no hay autorización, lanzar error
      if (this.status === 'BLOQUEADO' && !authorization) {
        console.error('❌ [CART] Cart blocked - requires authorization');
        throw new Error('Carrito bloqueado. Se requiere PIN del cajero para agregar productos.');
      }

      // Buscar si ya existe
      const existingItem = this.items.find(i => i.id === product.id);

      if (existingItem) {
        // Verificar stock (solo si no es ilimitado)
        if (!product.unlimited_stock && existingItem.quantity >= product.stock) {
          throw new Error('No hay suficiente stock disponible');
        }
        existingItem.quantity++;
      } else {
        // Agregar nuevo item
        this.items.push({
          ...product,
          quantity: 1
        });
      }

      this.unsavedChanges = true;

      // Log de auditoría si hubo autorización
      if (authorization) {
        this._logAudit('ADD_ITEM_BLOCKED', authorization, { productId: product.id });
      }
    },

    /**
     * Actualizar cantidad de un item
     */
    updateItemQuantity(productId, newQuantity, authorization = null) {
      // Validar permisos
      if (!this.canEditQuantity && !authorization) {
        throw new Error('Requiere PIN del cajero para editar cantidades en carrito bloqueado');
      }

      const item = this.items.find(i => i.id === productId);
      if (!item) {
        throw new Error('Producto no encontrado en el carrito');
      }

      // Validar stock (solo si no es ilimitado)
      const product = item; // Asumiendo que item tiene la info de stock
      if (!product.unlimited_stock && newQuantity > product.stock) {
        throw new Error('No hay suficiente stock disponible');
      }

      if (newQuantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0. Use removeItem para eliminar.');
      }

      item.quantity = newQuantity;
      this.unsavedChanges = true;

      if (authorization) {
        this._logAudit('UPDATE_QUANTITY_BLOCKED', authorization, { productId, newQuantity });
      }
    },

    /**
     * Incrementar cantidad de un item
     */
    incrementQuantity(productId, authorization = null) {
      const item = this.items.find(i => i.id === productId);
      if (!item) return;

      this.updateItemQuantity(productId, item.quantity + 1, authorization);
    },

    /**
     * Decrementar cantidad de un item
     */
    decrementQuantity(productId, authorization = null) {
      const item = this.items.find(i => i.id === productId);
      if (!item) return;

      if (item.quantity > 1) {
        this.updateItemQuantity(productId, item.quantity - 1, authorization);
      }
    },

    /**
     * Eliminar item del carrito
     * SIEMPRE requiere PIN supervisor si no está ABIERTO
     */
    removeItem(productId, supervisorAuth = null) {
      console.log('🗑️ [CART] removeItem called:', {
        productId,
        status: this.status,
        canRemoveProducts: this.canRemoveProducts,
        hasSupervisorAuth: !!supervisorAuth,
        authData: supervisorAuth
      });

      // Si no está ABIERTO, DEBE tener autorización de supervisor
      if (!this.canRemoveProducts && !supervisorAuth) {
        console.error('❌ [CART] Cannot remove - requires supervisor authorization');
        throw new Error('Requiere PIN de supervisor para eliminar productos del carrito bloqueado');
      }

      // Validar que el supervisor tiene el rol correcto
      if (supervisorAuth && !['supervisor', 'administrador'].includes(supervisorAuth.role)) {
        console.error('❌ [CART] Invalid role for removal:', supervisorAuth.role);
        throw new Error('Solo supervisores y administradores pueden eliminar productos del carrito bloqueado');
      }

      console.log('✅ [CART] Item removed successfully');
      this.items = this.items.filter(i => i.id !== productId);
      this.unsavedChanges = true;

      if (supervisorAuth) {
        this._logAudit('REMOVE_ITEM', supervisorAuth, { productId });
      }

      // Si se vacía el carrito, volver a ABIERTO
      if (this.items.length === 0 && this.payments.length === 0) {
        this.status = 'ABIERTO';
      }
    },

    // ========== Gestión de Pagos ==========

    /**
     * Agregar pago
     */
    addPayment(payment) {
      if (!this.canAddPayments) {
        throw new Error('No se pueden agregar pagos en estado: ' + this.status);
      }

      // Validar que el monto no exceda el restante
      if (payment.amount > this.remainingAmount) {
        // Permitir si es efectivo (para dar cambio)
        if (payment.method !== 'efectivo') {
          throw new Error('El monto del pago excede el total restante');
        }
      }

      this.payments.push({
        ...payment,
        timestamp: new Date().toISOString()
      });

      // Si es efectivo y es el primer pago, aplicar redondeo
      if (payment.method === 'efectivo' && this.payments.length === 1 && payment.roundingAmount) {
        this.roundingAdjustment = payment.roundingAmount;
        console.log('💰 [CART] Redondeo aplicado:', this.roundingAdjustment);
      }

      // Cambiar estado a BLOQUEADO al agregar primer pago
      if (this.payments.length === 1 && this.status === 'ABIERTO') {
        this.status = 'BLOQUEADO';
      }

      // Cambiar a PAGADO si se completó el pago
      if (this.isFullyPaid) {
        this.status = 'PAGADO';
      }

      this.unsavedChanges = true;
    },

    /**
     * Eliminar pago
     * SIEMPRE requiere PIN de supervisor
     */
    removePayment(paymentIndex, supervisorAuth) {
      if (!supervisorAuth) {
        throw new Error('Requiere PIN de supervisor para eliminar pagos');
      }

      if (paymentIndex < 0 || paymentIndex >= this.payments.length) {
        throw new Error('Índice de pago inválido');
      }

      const removedPayment = this.payments[paymentIndex];
      this.payments.splice(paymentIndex, 1);

      this._logAudit('REMOVE_PAYMENT', supervisorAuth, {
        paymentIndex,
        payment: removedPayment
      });

      // Ajustar estado según pagos restantes
      if (this.payments.length === 0) {
        this.status = 'ABIERTO';
      } else if (!this.isFullyPaid) {
        this.status = 'BLOQUEADO';
      }

      this.unsavedChanges = true;
    },

    // ========== Gestión de Cliente ==========

    setCustomer(customer) {
      this.customer = customer;
      this.unsavedChanges = true;
    },

    removeCustomer() {
      this.customer = null;
      this.unsavedChanges = true;
    },

    setDocumentType(type) {
      if (!['boleta', 'factura'].includes(type)) {
        throw new Error('Tipo de documento inválido');
      }
      this.documentType = type;
      this.unsavedChanges = true;
    },

    // ========== Finalizar Venta ==========

    /**
     * Completar la venta
     */
    async completeSale() {
      if (this.status !== 'PAGADO') {
        throw new Error('La venta debe estar pagada completamente antes de finalizar');
      }

      if (!this.hasCustomer) {
        throw new Error('Debe seleccionar un cliente antes de finalizar');
      }

      // Aquí iría la llamada al API para registrar la venta
      // const response = await ordersApi.createOrder({ ... });

      this.status = 'FINALIZADO';
      this.unsavedChanges = false;

      return {
        success: true,
        saleId: this.currentSaleId
      };
    },

    // ========== Reset ==========

    /**
     * Resetear carrito completamente
     */
    reset() {
      this.items = [];
      this.payments = [];
      this.customer = null;
      this.documentType = 'boleta';
      this.status = 'ABIERTO';
      this.currentSaleId = null;
      this.unsavedChanges = false;
      this.pendingAuthorization = null;
      this.roundingAdjustment = 0;
    },

    /**
     * Crear nuevo carrito (después de finalizar venta)
     */
    startNewSale() {
      this.reset();
    },

    // ========== Guardar para después ==========

    /**
     * Obtener snapshot del carrito para guardar
     */
    getSnapshot() {
      return {
        items: [...this.items],
        payments: [...this.payments],
        customer: this.customer ? { ...this.customer } : null,
        documentType: this.documentType,
        status: this.status,
        timestamp: new Date().toISOString()
      };
    },

    /**
     * Restaurar carrito desde snapshot
     */
    restoreSnapshot(snapshot) {
      this.items = [...snapshot.items];
      this.payments = [...snapshot.payments];
      this.customer = snapshot.customer ? { ...snapshot.customer } : null;
      this.documentType = snapshot.documentType || 'boleta';
      this.status = snapshot.status || 'ABIERTO';
      this.unsavedChanges = false;
    },

    // ========== Utilidades ==========

    /**
     * Log de auditoría interno
     */
    _logAudit(action, authorization, data = {}) {
      console.log('🔐 AUDIT LOG:', {
        action,
        employee_id: authorization?.employeeId,
        employee_name: authorization?.employeeName,
        role: authorization?.role,
        cart_status: this.status,
        timestamp: new Date().toISOString(),
        ...data
      });

      // TODO: Enviar a API de auditoría cuando esté implementada
    },

    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) return 'S/ 0.00';
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount);
    }
  }
});
