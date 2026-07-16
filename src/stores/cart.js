import { defineStore } from 'pinia';
import { ordersApi } from '../services/ordersApi';

// Afectación IGV: 1=Gravado, 2=Exonerado, 3=Inafecto. Exonerado/Inafecto NO tributan.
const isExemptItem = (item) => {
  const a = parseInt(item?.tax_affectation);
  return a === 2 || a === 3;
};

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
    pendingAuthorization: null, // { action: 'remove_item', data: {...}, resolve, reject }

    // Totales calculados por el backend (método NetSuite)
    calculatedTotals: null // { subtotal, tax, total, items: [...] }
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
    // IMPORTANTE: Los totales son calculados por el backend usando el método de NetSuite
    // Esto garantiza que los montos coincidan exactamente con lo que se envía a NetSuite
    // Base gravada (sin IGV) de los ítems afectos (afectación 1). Solo esta base tributa.
    taxableBase: (state) => {
      return state.items.reduce((sum, item) => {
        if (isExemptItem(item)) return sum;
        const cantidad = parseFloat(item.quantity) || 0;
        let precioSinIGV;
        if (item.price_without_tax !== null && item.price_without_tax !== undefined) {
          precioSinIGV = parseFloat(item.price_without_tax) || 0;
        } else {
          const precioConIGV = parseFloat(item.precio || item.price) || 0;
          precioSinIGV = precioConIGV / 1.18;
        }
        return sum + (precioSinIGV * cantidad);
      }, 0);
    },

    // Base exenta: ítems exonerados (2) o inafectos (3). No tributan; el precio ya es sin IGV.
    exemptBase: (state) => {
      return state.items.reduce((sum, item) => {
        if (!isExemptItem(item)) return sum;
        const cantidad = parseFloat(item.quantity) || 0;
        const precio = parseFloat(item.precio || item.price) || 0;
        return sum + (precio * cantidad);
      }, 0);
    },

    subtotal(state) {
      // Si hay totales calculados por el backend, usar esos
      if (state.calculatedTotals) {
        return state.calculatedTotals.subtotal;
      }
      // Fallback: base gravada + base exenta (respetando afectación por producto)
      return this.taxableBase + this.exemptBase;
    },

    tax() {
      // Si hay totales calculados por el backend, usar esos
      if (this.calculatedTotals) {
        return this.calculatedTotals.tax;
      }
      // Fallback: IGV solo sobre la base gravada (exonerados/inafectos no tributan)
      return this.taxableBase * 0.18;
    },

    total() {
      // Si hay totales calculados por el backend, usar esos
      if (this.calculatedTotals) {
        return this.calculatedTotals.total;
      }
      // Fallback: cálculo local
      return this.subtotal + this.tax;
    },

    // Indica si los totales vienen del backend (precisos) o son cálculo local (impreciso)
    hasBackendTotals() {
      return this.calculatedTotals !== null;
    },

    // 🔧 FIX: Redondeo aplicado (solo cuando hay pago en efectivo registrado)
    // Ya no calculamos redondeo anticipado - solo usamos el que se guardó al registrar el pago
    appliedRounding(state) {
      return state.roundingAdjustment;
    },

    // Total con redondeo aplicado (solo si ya se aplicó)
    totalWithRounding(state) {
      return this.total + this.appliedRounding;
    },

    totalPaid: (state) => {
      return state.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    },

    remainingAmount(state) {
      // 🔧 FIX: Usar total con redondeo solo si ya se aplicó
      // Si no hay redondeo aplicado, usar el total normal
      const totalToPay = this.totalWithRounding;
      const remaining = totalToPay - this.totalPaid;

      // Redondear a 2 decimales para evitar problemas de precisión flotante
      const roundedRemaining = Math.round(remaining * 100) / 100;

      console.log('🔍 [CART] remainingAmount calculation:', {
        total: this.total,
        appliedRounding: this.appliedRounding,
        totalWithRounding: this.totalWithRounding,
        totalPaid: this.totalPaid,
        rawRemaining: remaining,
        roundedRemaining: roundedRemaining,
        paymentsCount: state.payments.length,
        payments: state.payments.map(p => ({ method: p.method, amount: p.amount, roundingAmount: p.roundingAmount }))
      });

      // 🔧 CRITICAL FIX: Si el saldo es muy pequeño (menor a 0.01), considerarlo como 0
      // Esto evita que queden residuos de 0.01-0.09 después de aplicar redondeos
      if (Math.abs(roundedRemaining) < 0.01) {
        console.log('✅ [CART] Saldo muy pequeño, considerando como 0');
        return 0;
      }

      console.log(`📊 [CART] Saldo pendiente: S/ ${roundedRemaining.toFixed(2)}`);
      return Math.max(0, roundedRemaining);
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
      // 🔧 FIX: Tolerancia más estricta para evitar residuos
      // Considerar pagado si el saldo es menor a 0.005 (medio centavo)
      // Esto maneja correctamente los casos de redondeo donde el saldo puede quedar en 0.001-0.009
      return this.remainingAmount < 0.005;
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
    // ========== Recalcular Totales desde Backend ==========

    /**
     * Recalcular totales usando el método de NetSuite desde el backend
     * Esto garantiza que los totales coincidan exactamente con lo que se enviará a NetSuite
     */
    async recalculateTotals() {
      if (this.items.length === 0) {
        this.calculatedTotals = null;
        return;
      }

      try {
        console.log('🧮 [CART] Recalculating totals from backend...');

        // Mapear items al formato esperado por el backend
        const itemsForCalculation = this.items.map(item => ({
          producto_id: item.id,
          // La variación elegida (si la hay) ajusta el precio de la línea en el backend.
          productoatributo_id: item.variant_id || 0,
          cantidad: item.quantity,
          tiendaventa_cantidad: item.quantity
        }));

        const response = await ordersApi.calculateTotal(itemsForCalculation);

        if (response.success) {
          this.calculatedTotals = response.data;
          console.log('✅ [CART] Totals calculated:', this.calculatedTotals);
        } else {
          console.error('❌ [CART] Backend returned error calculating totals');
          this.calculatedTotals = null;
        }
      } catch (error) {
        console.error('❌ [CART] Error recalculating totals:', error);
        // Mantener calculatedTotals como null para usar fallback local
        this.calculatedTotals = null;
      }
    },

    // ========== Gestión de Items ==========

    /**
     * Agregar producto al carrito
     * @param {Object} product - Producto a agregar
     * @param {Object} authorization - Opcional: datos de autorización si carrito está bloqueado
     */
    async addItem(product, authorization = null) {
      console.log('🛒 [CART] addItem called:', {
        product: product.nombre,
        status: this.status,
        canAddProducts: this.canAddProducts,
        hasAuthorization: !!authorization,
        authData: authorization,
        productData: {
          id: product.id,
          precio: product.precio,
          precio_original: product.precio_original,
          promocion: product.promocion,
          allKeys: Object.keys(product)
        }
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

      // Venta al peso: cada pesada es una línea independiente con cantidad = peso
      // (kg). No se fusiona con otras líneas del mismo producto (dos pesadas = dos
      // líneas) y no aplica el stepper de +1. __weight viene del modal de peso.
      const isWeight = product.sold_by_weight === true && product.__weight != null;
      if (isWeight) {
        const weight = Number(product.__weight) || 0;
        if (weight <= 0) {
          throw new Error('El peso debe ser mayor a 0');
        }
        this._weightLineSeq = (this._weightLineSeq || 0) + 1;
        const newItem = {
          ...product,
          lineId: `${product.id}:w:${this._weightLineSeq}`,
          variant_id: null,
          variant_name: null,
          variant_sku: null,
          sold_by_weight: true,
          sale_unit: product.sale_unit || 'kg',
          quantity: weight
        };
        delete newItem.__weight;
        delete newItem.__initialWeight;
        this.items.push(newItem);
        this.unsavedChanges = true;
        await this.recalculateTotals();
        if (authorization) {
          this._logAudit('ADD_ITEM_BLOCKED', authorization, { productId: product.id });
        }
        return;
      }

      // Identidad de línea: producto + variación (talla/color, etc.). Dos variaciones
      // del mismo producto son dos líneas distintas. Para productos simples
      // lineId === String(id), así el comportamiento previo no cambia.
      const variantId = product.variant_id ?? null;
      const lineId = variantId ? `${product.id}:${variantId}` : String(product.id);

      // Buscar si ya existe la MISMA línea (mismo producto y misma variación)
      const existingItem = this.items.find(i => (i.lineId ?? String(i.id)) === lineId);

      if (existingItem) {
        // Verificar stock (solo si no es ilimitado)
        if (!product.unlimited_stock && existingItem.quantity >= product.stock) {
          throw new Error('No hay suficiente stock disponible');
        }
        existingItem.quantity++;
      } else {
        // Agregar nuevo item
        const newItem = {
          ...product,
          lineId,
          variant_id: variantId,
          variant_name: product.variant_name ?? null,
          variant_sku: product.variant_sku ?? null,
          quantity: 1
        };
        this.items.push(newItem);

        console.log('📦 [CART] New item added to cart:', {
          id: newItem.id,
          nombre: newItem.nombre,
          precio: newItem.precio,
          precio_original: newItem.precio_original,
          promocion: newItem.promocion,
          allKeys: Object.keys(newItem)
        });
      }

      this.unsavedChanges = true;

      // Recalcular totales desde el backend
      await this.recalculateTotals();

      // Log de auditoría si hubo autorización
      if (authorization) {
        this._logAudit('ADD_ITEM_BLOCKED', authorization, { productId: product.id });
      }
    },

    /**
     * Actualizar cantidad de un item
     */
    async updateItemQuantity(lineId, newQuantity, authorization = null) {
      // Validar permisos
      if (!this.canEditQuantity && !authorization) {
        throw new Error('Requiere PIN del cajero para editar cantidades en carrito bloqueado');
      }

      // lineId identifica la línea (producto + variación). Compat: productos simples
      // usan String(id) como lineId, así que pasar el id sigue funcionando.
      const item = this.items.find(i => (i.lineId ?? String(i.id)) === String(lineId));
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

      // Recalcular totales desde el backend
      await this.recalculateTotals();

      if (authorization) {
        this._logAudit('UPDATE_QUANTITY_BLOCKED', authorization, { lineId, newQuantity });
      }
    },

    /**
     * Incrementar cantidad de un item
     */
    incrementQuantity(lineId, authorization = null) {
      const item = this.items.find(i => (i.lineId ?? String(i.id)) === String(lineId));
      if (!item) return;

      this.updateItemQuantity(item.lineId ?? String(item.id), item.quantity + 1, authorization);
    },

    /**
     * Decrementar cantidad de un item
     */
    decrementQuantity(lineId, authorization = null) {
      const item = this.items.find(i => (i.lineId ?? String(i.id)) === String(lineId));
      if (!item) return;

      if (item.quantity > 1) {
        this.updateItemQuantity(item.lineId ?? String(item.id), item.quantity - 1, authorization);
      }
    },

    /**
     * Eliminar item del carrito
     * SIEMPRE requiere PIN supervisor si no está ABIERTO
     */
    async removeItem(lineId, supervisorAuth = null) {
      console.log('🗑️ [CART] removeItem called:', {
        lineId,
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
      this.items = this.items.filter(i => (i.lineId ?? String(i.id)) !== String(lineId));
      this.unsavedChanges = true;

      // Recalcular totales desde el backend
      await this.recalculateTotals();

      if (supervisorAuth) {
        this._logAudit('REMOVE_ITEM', supervisorAuth, { lineId });
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
      console.log('💳 [CART] addPayment called:', {
        payment,
        remainingAmountBefore: this.remainingAmount,
        totalBefore: this.total,
        appliedRoundingBefore: this.appliedRounding,
        paymentsCountBefore: this.payments.length
      });

      if (!this.canAddPayments) {
        throw new Error('No se pueden agregar pagos en estado: ' + this.status);
      }

      // 🔧 CRITICAL FIX: Si es efectivo y es el primer pago, aplicar redondeo ANTES de agregar el pago
      // Esto asegura que remainingAmount se calcule correctamente desde el inicio
      console.log('🔍 [CART] Verificando condición de redondeo:', {
        method: payment.method,
        paymentsLength: this.payments.length,
        roundingAmount: payment.roundingAmount,
        hasRoundingAmount: !!payment.roundingAmount,
        roundingAmountType: typeof payment.roundingAmount
      });

      if (payment.method === 'efectivo' && this.payments.length === 0 && payment.roundingAmount !== undefined && payment.roundingAmount !== 0) {
        this.roundingAdjustment = payment.roundingAmount;
        console.log('💰 [CART] Redondeo aplicado ANTES de agregar pago:', {
          roundingAmount: this.roundingAdjustment,
          totalOriginal: this.total,
          totalConRedondeo: this.totalWithRounding
        });
      } else {
        console.log('⚠️ [CART] Condición de redondeo NO cumplida');
      }

      // 🔧 CRITICAL FIX: Calcular el saldo pendiente correcto ANTES de validar
      // Si vamos a eliminar el redondeo (método no-efectivo + hay pagos previos),
      // usar el saldo SIN redondeo para la validación
      let remainingForValidation = this.remainingAmount;
      const willRemoveRounding = this.roundingAdjustment !== 0 && payment.method !== 'efectivo' && this.payments.length > 0;

      if (willRemoveRounding) {
        // Calcular el saldo sin el redondeo aplicado
        remainingForValidation = this.total - this.totalPaid;
        console.log('🔧 [CART] Validando con saldo sin redondeo:', {
          remainingWithRounding: this.remainingAmount,
          remainingWithoutRounding: remainingForValidation,
          paymentAmount: payment.amount
        });
      }

      // Validar que el monto no exceda el restante
      if (payment.amount > remainingForValidation) {
        // Permitir si es efectivo (para dar cambio)
        if (payment.method !== 'efectivo') {
          console.error('❌ [CART] Payment amount exceeds remaining:', {
            paymentAmount: payment.amount,
            remaining: remainingForValidation
          });
          throw new Error('El monto del pago excede el total restante');
        }
      }

      // 🔧 CRITICAL FIX: Si hay redondeo aplicado y se agrega un método que NO es efectivo,
      // ELIMINAR el redondeo porque los otros métodos permiten pagos exactos con centavos
      // IMPORTANTE: Hacer esto DESPUÉS de la validación
      if (willRemoveRounding) {
        console.log('🔧 [CART] Removiendo redondeo porque se está agregando método no-efectivo:', {
          oldRounding: this.roundingAdjustment,
          paymentMethod: payment.method,
          paymentsCount: this.payments.length
        });
        this.roundingAdjustment = 0;
      }

      this.payments.push({
        ...payment,
        timestamp: new Date().toISOString()
      });

      console.log('✅ [CART] Pago agregado. Estado actual:', {
        paymentsCount: this.payments.length,
        totalPaid: this.totalPaid,
        remainingAmount: this.remainingAmount,
        totalWithRounding: this.totalWithRounding,
        appliedRounding: this.appliedRounding
      });

      // Cambiar estado a BLOQUEADO al agregar primer pago
      if (this.payments.length === 1 && this.status === 'ABIERTO') {
        this.status = 'BLOQUEADO';
      }

      // Cambiar a PAGADO si se completó el pago
      if (this.isFullyPaid) {
        console.log('✅ [CART] Pago completo detectado!');
        this.status = 'PAGADO';
      } else {
        console.log('⚠️ [CART] Pago parcial. Saldo pendiente:', this.remainingAmount);
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
      this.calculatedTotals = null;
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
     * Formatear moneda — delega al formatter central que respeta la config
     * global de moneda (seteada al login vía setCurrencyConfig).
     */
    formatCurrency(amount) {
      // Import lazy para evitar ciclos con el store al boot.
      const { formatCurrency } = require('@/utils/formatters');
      return formatCurrency(amount);
    }
  }
});
