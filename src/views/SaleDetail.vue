<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Cargando detalle de venta...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <svg class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Error al cargar la venta</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <router-link
          to="/sales"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Volver al Historial
        </router-link>
      </div>
    </div>

    <!-- Ticket View -->
    <div v-else-if="order" class="max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <!-- Header con botón volver -->
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <router-link
          to="/sales"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm sm:text-base"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Historial
        </router-link>

        <div class="flex flex-wrap gap-2 sm:gap-3">
          <button
            v-if="canShowEmailButton()"
            @click="openEmailModal"
            :disabled="sendingEmail"
            class="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <svg v-if="!sendingEmail" class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else class="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ sendingEmail ? 'Enviando...' : 'Email' }}
          </button>

          <button
            @click="printTicket"
            class="inline-flex items-center px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm sm:text-base"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Reimprimir
          </button>

          <!-- Emitir comprobante (modo manual). Deshabilitado + tooltip cuando
               está delegado al ERP o no hay proveedor configurado. -->
          <button
            v-if="showBillingEmitButton"
            @click="handleEmitBilling"
            :disabled="!canEmitBilling || billingEmitting"
            :title="billingEmitDisabledReason"
            class="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <svg v-if="!billingEmitting" class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <svg v-else class="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ billingEmitting ? 'Emitiendo...' : 'Emitir comprobante' }}
          </button>

          <button
            v-if="canVoidOrder()"
            @click="showVoidModal = true"
            class="inline-flex items-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Anular
          </button>
        </div>
      </div>

      <!-- Banner de venta anulada -->
      <div v-if="order.status == 4" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex items-center">
          <svg class="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <div>
            <p class="text-red-800 font-semibold">VENTA ANULADA</p>
            <p v-if="getVoidReason()" class="text-red-700 text-sm mt-1">Motivo: {{ getVoidReason() }}</p>
          </div>
        </div>
      </div>

      <!-- Notificación anulación exitosa -->
      <div v-if="voidSuccess" class="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-orange-700">{{ voidSuccess }}</p>
        </div>
      </div>

      <!-- Notificación de éxito -->
      <div v-if="emailSuccess" class="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-700">{{ emailSuccess }}</p>
        </div>
      </div>

      <!-- Notificación de error -->
      <div v-if="emailError" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700">{{ emailError }}</p>
        </div>
      </div>

      <!-- Notificación emisión de comprobante -->
      <div v-if="billingEmitSuccess" class="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-700">{{ billingEmitSuccess }}</p>
        </div>
      </div>
      <div v-if="billingEmitError" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex">
          <svg class="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700">{{ billingEmitError }}</p>
        </div>
      </div>

      <!-- Sincronización ERP -->
      <div
        v-if="showErpNotification()"
        class="mb-4 border-l-4 p-4 rounded"
        :class="{
          'bg-green-50 border-green-500': erpSyncState === 'success',
          'bg-yellow-50 border-yellow-500': erpSyncState === 'pending',
          'bg-red-50 border-red-500': erpSyncState === 'error',
        }"
      >
        <div class="flex items-start">
          <!-- Success icon -->
          <svg v-if="erpSyncState === 'success'" class="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Pending icon -->
          <svg v-else-if="erpSyncState === 'pending'" class="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Error icon -->
          <svg v-else class="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p
              class="font-medium mb-1"
              :class="{
                'text-green-800': erpSyncState === 'success',
                'text-yellow-800': erpSyncState === 'pending',
                'text-red-800': erpSyncState === 'error',
              }"
            >
              Sincronización ERP:
              {{ erpSyncState === 'success' ? 'Exitoso' : erpSyncState === 'pending' ? 'Pendiente' : 'Error' }}
            </p>
            <p v-if="erpSyncState === 'pending'" class="text-yellow-700 text-sm">
              La venta está en cola para sincronizarse con el ERP.
            </p>
            <!-- Error details -->
            <div v-if="erpSyncState === 'error' && erpErrorDetail" class="text-red-700 text-sm space-y-1">
              <p v-if="erpErrorDetail.error">{{ erpErrorDetail.error }}</p>
              <p v-if="erpErrorDetail.failed_at" class="text-red-600 text-xs">Paso: {{ erpErrorDetail.failed_at }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Componente de Ticket Reutilizable -->
      <ReceiptTicket
        :order-number="order.order_number"
        :created-at="order.created_at"
        :customer="order.customer"
        :items="getProducts()"
        :payments="order._rawDetail?.payments || []"
        :subtotal="getSubtotal()"
        :tax="getTax()"
        :total="getTotal()"
        :rounding-amount="getRoundingAmount()"
        :total-after-rounding="getTotalAfterRounding()"
        :cajero-name="order.cajero_nombre"
        :status="order.status"
        :source="order.source"
        :billing-document="getBillingDocument()"
        :company-info="getCompanyInfo()"
        :store-name="getStoreName()"
        :store-address="getStoreAddress()"
        :store-phone="getStorePhone()"
        :netsuite-customer-code="getNetsuiteCustomerCode()"
        :show-badges="true"
        :show-reprint="true"
      />

      <!-- Análisis de ganancia (solo dueño/admin) -->
      <div
        v-if="canSeeProfit && profitAnalysis"
        class="mt-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
      >
        <div class="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h3 class="text-sm font-semibold text-gray-800">Análisis de ganancia</h3>
          <span class="text-xs text-gray-400">(solo visible para el administrador)</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">Ingreso</p>
            <p class="text-base font-semibold text-gray-900">S/ {{ profitAnalysis.revenue.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Costo</p>
            <p class="text-base font-semibold text-gray-900">S/ {{ profitAnalysis.totalCost.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Ganancia</p>
            <p class="text-base font-bold" :class="profitAnalysis.profit >= 0 ? 'text-primary-600' : 'text-red-600'">
              S/ {{ profitAnalysis.profit.toFixed(2) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Margen</p>
            <p class="text-base font-bold" :class="profitAnalysis.profit >= 0 ? 'text-primary-600' : 'text-red-600'">
              {{ profitAnalysis.margin }}%
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-3">
          Calculado con el costo de compra registrado en cada producto. Los productos sin costo cuentan como costo 0.
        </p>
      </div>

      <!-- Debug Info (Collapsible) -->
      <div class="mt-6">
        <button
          @click="showDebug = !showDebug"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          {{ showDebug ? 'Ocultar' : 'Mostrar' }} datos técnicos (JSON)
        </button>
        <pre v-if="showDebug" class="mt-2 bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs">{{ JSON.stringify(order, null, 2) }}</pre>
      </div>
    </div>

    <!-- Modal para enviar email -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeEmailModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Enviar comprobante por email
                </h3>
                <div class="mt-4">
                  <label for="email-input" class="block text-sm font-medium text-gray-700 mb-2">
                    Email del destinatario
                  </label>
                  <input
                    id="email-input"
                    v-model="emailInput"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    @keyup.enter="confirmSendEmail"
                  />
                  <p v-if="emailInputError" class="mt-2 text-sm text-red-600">{{ emailInputError }}</p>
                  <p v-if="order?.customer?.email" class="mt-2 text-sm text-gray-500">
                    Email registrado: {{ order.customer.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmSendEmail"
              :disabled="sendingEmail"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ sendingEmail ? 'Enviando...' : 'Enviar' }}
            </button>
            <button
              type="button"
              @click="closeEmailModal"
              :disabled="sendingEmail"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal para anular venta -->
    <div v-if="showVoidModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="void-modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeVoidModal"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="void-modal-title">
                  Anular Venta
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  Venta #{{ order?.order_number }} - S/ {{ getTotal().toFixed(2) }}
                </p>

                <div class="mt-4 space-y-4">
                  <!-- Auth type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Autenticación</label>
                    <div class="flex gap-4">
                      <label class="inline-flex items-center">
                        <input type="radio" v-model="voidAuthType" value="pin" class="form-radio text-red-600" />
                        <span class="ml-2 text-sm text-gray-700">PIN de supervisor</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input type="radio" v-model="voidAuthType" value="password" class="form-radio text-red-600" />
                        <span class="ml-2 text-sm text-gray-700">Contraseña admin</span>
                      </label>
                    </div>
                  </div>

                  <!-- PIN or Password input -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ voidAuthType === 'pin' ? 'PIN de supervisor' : 'Contraseña de administrador' }}
                    </label>
                    <input
                      v-model="voidAuthValue"
                      :type="'password'"
                      :maxlength="voidAuthType === 'pin' ? 4 : undefined"
                      :placeholder="voidAuthType === 'pin' ? '****' : 'Ingresa tu contraseña'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      @keyup.enter="confirmVoid"
                    />
                  </div>

                  <!-- Motivo -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de anulación</label>
                    <textarea
                      v-model="voidMotivo"
                      rows="2"
                      placeholder="Ej: Cliente pidió anulación, error en documento..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    ></textarea>
                  </div>

                  <!-- Error -->
                  <p v-if="voidError" class="text-sm text-red-600">{{ voidError }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmVoid"
              :disabled="voidLoading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ voidLoading ? 'Anulando...' : 'Confirmar Anulación' }}
            </button>
            <button
              type="button"
              @click="closeVoidModal"
              :disabled="voidLoading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ordersApi } from '../services/ordersApi';
import ReceiptTicket from '../components/ReceiptTicket.vue';
import { buildCompanyInfo } from '../config/companyConfig';
import { useAuthStore } from '../stores/auth';
import { useBillingStore } from '../stores/billing';
import { useThermalPrinter } from '../composables/useThermalPrinter';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const billingStore = useBillingStore();
const { isConnected: thermalConnected, isEnabled: thermalEnabled, printReceipt: thermalPrint } = useThermalPrinter();

const order = ref(null);
const loading = ref(false);
const error = ref(null);
const showDebug = ref(false);
const sendingEmail = ref(false);
const emailSuccess = ref(null);
const emailError = ref(null);
const showEmailModal = ref(false);
const emailInput = ref('');
const emailInputError = ref(null);

// Void order state
const showVoidModal = ref(false);
const voidAuthType = ref('pin');
const voidAuthValue = ref('');
const voidMotivo = ref('');
const voidLoading = ref(false);
const voidError = ref(null);
const voidSuccess = ref(null);

const loadOrderDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const orderId = route.params.id;
    const response = await ordersApi.getOrder(orderId);

    console.log('Order Detail Response:', response);

    // Mapear la respuesta al formato esperado
    if (response) {
      // Intentar obtener datos del cliente desde diferentes fuentes
      let customerName = 'Cliente General';
      let customerEmail = '';
      let customerPhone = '';
      let customerDocumentNumber = '';
      let customerDocumentType = '';

      // Prioridad 1: Campos directos de la tabla
      if (response.tiendaventa_nombres || response.tiendaventa_apellidos) {
        customerName = `${response.tiendaventa_nombres || ''} ${response.tiendaventa_apellidos || ''}`.trim();
        customerEmail = response.tiendaventa_correoelectronico || '';
        customerPhone = response.tiendaventa_telefono || '';
      }
      // Prioridad 2: billing_info (ventas web antiguas)
      else if (response.billing_info) {
        const billing = response.billing_info;
        customerName = `${billing.name || ''} ${billing.last_name || ''}`.trim() || 'Cliente General';
        customerEmail = billing.email || '';
        customerPhone = billing.phone_number || '';
      }

      // Obtener información del documento si existe
      let customerNetsuiteCode = '';
      if (response.customer) {
        customerDocumentNumber = response.customer.document_number || '';
        customerDocumentType = response.customer.document_type || '';
        customerNetsuiteCode = response.customer.netsuite_code || '';
      }

      order.value = {
        id: parseInt(response.tiendaventa_id || orderId),
        order_number: response.tiendaventa_codigoreferencia || response.code || orderId,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          document_number: customerDocumentNumber,
          document_type: customerDocumentType,
          netsuite_code: customerNetsuiteCode
        },
        cajero_nombre: response.cajero_nombre || null,
        total: parseFloat(response.tiendaventa_totalpagar || response.total_amount || '0'),
        status: response.tiendaventa_pagado ?? response.status,
        source: response.source || response.tiendaventa_origen || 'web',
        created_at: response.tiendaventa_fecha || response.date_created,
        _rawDetail: response
      };
    } else {
      error.value = 'No se encontró la venta';
    }
  } catch (err) {
    console.error('Error loading order:', err);
    error.value = err.message || 'Error al cargar el detalle de la venta';
  } finally {
    loading.value = false;
  }
};

// Función para obtener productos desde diferentes estructuras de datos
const getProducts = () => {
  if (!order.value || !order.value._rawDetail) return [];

  // Intentar obtener desde order_items (formato web antiguo)
  if (order.value._rawDetail.order_items && Array.isArray(order.value._rawDetail.order_items)) {
    return order.value._rawDetail.order_items.map(item => ({
      id: item.id,
      name: item.tittle || item.name || 'Producto',
      quantity: item.quantity || 1,
      price: parseFloat(item.price || 0),
      original_price: item.original_price ? parseFloat(item.original_price) : null,
      discount_percent: item.discount_percent || null,
      total: parseFloat(item.total || 0),
      unit_cost: item.unit_cost != null ? parseFloat(item.unit_cost) : 0,
      cost_total: item.cost_total != null ? parseFloat(item.cost_total) : 0,
      profit: item.profit != null ? parseFloat(item.profit) : null
    }));
  }

  // Intentar obtener desde products (formato POS nuevo)
  if (order.value._rawDetail.products && Array.isArray(order.value._rawDetail.products)) {
    return order.value._rawDetail.products.map(item => ({
      id: item.id,
      name: item.name || item.producto_nombre || 'Producto',
      quantity: item.quantity || item.cantidad || 1,
      price: parseFloat(item.price || item.precio || 0),
      original_price: item.original_price ? parseFloat(item.original_price) : null,
      discount_percent: item.discount_percent || null,
      total: parseFloat(item.total || ((item.quantity || item.cantidad) * (item.price || item.precio)) || 0),
      unit_cost: item.unit_cost != null ? parseFloat(item.unit_cost) : 0,
      cost_total: item.cost_total != null ? parseFloat(item.cost_total) : 0,
      profit: item.profit != null ? parseFloat(item.profit) : null
    }));
  }

  return [];
};

// Función para calcular subtotal
const getSubtotal = () => {
  if (!order.value) return 0;

  // Si viene en el _rawDetail, usarlo
  if (order.value._rawDetail?.subtotal) {
    return parseFloat(order.value._rawDetail.subtotal);
  }

  // Calcular desde total_amount si existe
  const total = getTotal();
  return total / 1.18; // Quitar el 18% de IGV
};

// Función para calcular IGV
const getTax = () => {
  if (!order.value) return 0;

  // Si viene en el _rawDetail, usarlo
  if (order.value._rawDetail?.tax) {
    return parseFloat(order.value._rawDetail.tax);
  }

  // Calcular como 18% del total
  const total = getTotal();
  return total - (total / 1.18);
};

// Función para obtener el total
const getTotal = () => {
  if (!order.value) return 0;

  // Prioridad: total_amount del _rawDetail
  if (order.value._rawDetail?.total_amount) {
    return parseFloat(order.value._rawDetail.total_amount);
  }

  // Luego el total mapeado
  if (order.value.total) {
    return parseFloat(order.value.total);
  }

  return 0;
};

// Función para obtener el monto de redondeo
const getRoundingAmount = () => {
  if (!order.value) return 0;

  // Buscar el redondeo en _rawDetail
  if (order.value._rawDetail?.rounding_amount !== undefined && order.value._rawDetail?.rounding_amount !== null) {
    return parseFloat(order.value._rawDetail.rounding_amount);
  }

  return 0;
};

// Función para obtener el total después del redondeo
const getTotalAfterRounding = () => {
  if (!order.value) return 0;

  // Buscar el total después de redondeo en _rawDetail
  if (order.value._rawDetail?.total_after_rounding !== undefined && order.value._rawDetail?.total_after_rounding !== null) {
    return parseFloat(order.value._rawDetail.total_after_rounding);
  }

  // Si no existe, calcularlo
  const roundingAmount = getRoundingAmount();
  if (roundingAmount !== 0) {
    return getTotal() + roundingAmount;
  }

  return getTotal();
};

// Función para obtener información del comprobante electrónico
const getBillingDocument = () => {
  if (!order.value?._rawDetail?.billing_info?.['e-billing']) {
    return null;
  }

  const eBilling = order.value._rawDetail.billing_info['e-billing'];
  // status = 1 cuando fue emitido por Nubefact O NetSuite (delegate_billing)
  if (!eBilling.status) {
    return null;
  }

  return {
    serie: eBilling.serie,
    correlative: eBilling.correlative,
    status: eBilling.status,
    source: eBilling.source || null, // 'nubefact' | 'netsuite' | null
    billingDate: eBilling.billing_date,
    files: {
      pdf: eBilling.url_pdf,
      xml: eBilling.url_xml
    }
  };
};

// ===== Análisis de ganancia (solo dueño/admin) =====
// El costo y el margen son información sensible del negocio: se ocultan a cajeros.
const canSeeProfit = computed(() => authStore.isAdmin);

const profitAnalysis = computed(() => {
  const products = getProducts();
  if (!products.length) return null;
  // Solo tiene sentido si al menos un producto tiene costo registrado.
  const hasCost = products.some(p => p.unit_cost > 0);
  if (!hasCost) return null;

  const revenue = products.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost_total || 0), 0);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  return { revenue, totalCost, profit, margin };
});

// ===== Emisión manual de comprobante =====
// Estado del botón "Emitir comprobante" según el modo de facturación de la tienda.
const billingEmitError = ref(null);
const billingEmitSuccess = ref(null);
const billingEmitting = computed(() => billingStore.isEmitting);

const hasEmittedDocument = computed(() => !!getBillingDocument());
const isPaidOrder = computed(() => Number(order.value?.status) === 1);
// Solo en modo manual el cajero puede emitir el comprobante.
const canEmitBilling = computed(() =>
  isPaidOrder.value && !hasEmittedDocument.value && authStore.isBillingManual
);
// El botón se muestra (deshabilitado + tooltip) también cuando está delegado al
// ERP o no hay proveedor, para dar contexto al cajero.
const showBillingEmitButton = computed(() =>
  isPaidOrder.value && !hasEmittedDocument.value &&
  (authStore.isBillingManual || authStore.isBillingDelegated || !authStore.hasBillingProvider)
);
const billingEmitDisabledReason = computed(() => {
  if (authStore.isBillingDelegated) return 'La facturación está delegada al ERP; el comprobante se emite automáticamente.';
  if (!authStore.hasBillingProvider) return 'Configura un proveedor de facturación electrónica para emitir comprobantes.';
  return '';
});

const handleEmitBilling = async () => {
  if (!canEmitBilling.value || !order.value?.id) return;
  billingEmitError.value = null;
  billingEmitSuccess.value = null;

  // El tipo (boleta/factura) lo deriva el backend del documento_id_facturacion
  // de la orden (elegido en el checkout del POS).
  const result = await billingStore.emitDocument({
    order_id: Number(order.value.id),
    pdf_format: 'TICKET',
  });

  if (result.success) {
    const doc = result.data || {};
    billingEmitSuccess.value = `Comprobante emitido: ${doc.serie || ''}-${doc.correlative || ''}`;
    setTimeout(() => { billingEmitSuccess.value = null; }, 5000);
    // Recargar para que getBillingDocument() refleje el comprobante recién emitido.
    await loadOrderDetail();
  } else {
    billingEmitError.value = result.error || 'No se pudo emitir el comprobante';
    setTimeout(() => { billingEmitError.value = null; }, 8000);
  }
};

// Información de la empresa para el ticket, derivada de la tienda autenticada
const getCompanyInfo = () => {
  return buildCompanyInfo(authStore.selectedStore);
};

// Función para obtener la dirección de la sucursal
const getStoreAddress = () => {
  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_address) {
    return order.value._rawDetail.store_address;
  }

  // Intentar obtener desde authStore (tienda autenticada)
  const store = authStore.selectedStore;
  if (store?.direccionCompleta) {
    return store.direccionCompleta;
  }
  if (store?.direccion) {
    return store.direccion;
  }

  return null;
};

// Función para obtener el teléfono de la sucursal
const getStorePhone = () => {
  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_phone) {
    return order.value._rawDetail.store_phone;
  }

  // Intentar obtener desde authStore (tienda autenticada)
  if (authStore.selectedStore?.telefono) {
    return authStore.selectedStore.telefono;
  }

  return null;
};

// Función para obtener el nombre de la tienda/sucursal
const getStoreName = () => {
  // Intentar obtener desde authStore
  if (authStore.selectedStore?.name) {
    return authStore.selectedStore.name;
  }

  // Intentar obtener desde la respuesta de la orden
  if (order.value?._rawDetail?.store_name) {
    return order.value._rawDetail.store_name;
  }

  return 'LIMA'; // Default
};

// Función para obtener código NetSuite del cliente
const getNetsuiteCustomerCode = () => {
  // Prioridad 1: Desde el objeto customer mapeado
  if (order.value?.customer?.netsuite_code) {
    return order.value.customer.netsuite_code;
  }

  // Prioridad 2: Desde _rawDetail (respuesta completa del API)
  if (order.value?._rawDetail?.customer?.netsuite_code) {
    return order.value._rawDetail.customer.netsuite_code;
  }

  return null;
};

// Función para obtener información de la tienda (DEPRECATED - mantener por compatibilidad)
const getStoreInfo = () => {
  return null;
};

const printTicket = async () => {
  // Intentar impresión térmica ESC/POS primero
  if (thermalEnabled.value && thermalConnected.value) {
    const thermalData = {
      companyInfo: getCompanyInfo(),
      storeName: getStoreName(),
      storeAddress: getStoreAddress(),
      storePhone: getStorePhone(),
      orderNumber: order.value.order_number,
      billingDoc: getBillingDocument(),
      items: getProducts(),
      payments: order.value._rawDetail?.payments || [],
      customer: order.value.customer,
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotal(),
      roundingAmount: 0,
      totalAfterRounding: getTotal(),
      cajero: order.value.cajero_nombre || '',
      createdAt: order.value.created_at,
    };
    const printed = await thermalPrint(thermalData);
    if (printed) {
      console.log('🖨️ [SaleDetail] Printed via thermal ESC/POS');
      return;
    }
    console.log('🖨️ [SaleDetail] Thermal print failed, falling back to HTML popup');
  }

  const products = getProducts();
  const payments = order.value._rawDetail?.payments || [];
  const billingDoc = getBillingDocument();
  const companyInfo = getCompanyInfo();
  const storeName = getStoreName();
  const storeAddress = getStoreAddress();
  const storePhone = getStorePhone();

  // Determinar tipo de documento
  let docType = 'COMPROBANTE ELECTRÓNICO';
  if (billingDoc?.serie) {
    const serie = billingDoc.serie.toString().toUpperCase();
    if (serie.startsWith('F')) docType = 'FACTURA ELECTRÓNICA';
    else if (serie.startsWith('B')) docType = 'BOLETA ELECTRÓNICA';
  }

  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta #${order.value.order_number}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          margin: 0;
          padding: 10px;
          width: 80mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 13px; font-weight: bold; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .small { font-size: 9px; }
        img { max-width: 60px; height: auto; }
      </style>
    </head>
    <body>
      <!-- Header -->
      ${companyInfo.logoUrl ? `<div class="center"><img src="${companyInfo.logoUrl}" alt="Logo" /></div>` : ''}
      <div class="center bold">${companyInfo.legalName || 'TICKET DE VENTA'}</div>
      ${storeAddress ? `<div class="center small">${storeAddress}</div>` : ''}
      ${companyInfo.ruc ? `<div class="center small">RUC: ${companyInfo.ruc}</div>` : ''}
      ${storeName ? `<div class="center small">TIENDA ${storeName.toUpperCase()}</div>` : ''}
      ${storePhone ? `<div class="center small">TLF.: ${storePhone}</div>` : ''}
      <div class="line"></div>

      <!-- Información del Documento -->
      ${billingDoc ? `
        <div class="center bold">${docType}</div>
        <div class="center bold">${billingDoc.serie}-${billingDoc.correlative}</div>
      ` : `
        <div class="center bold">Nro: ${order.value.order_number}</div>
      `}
      <div class="line"></div>

      <!-- Información General -->
      <div>Fecha: ${formatDate(order.value.created_at)}</div>
      <div>Cliente: ${order.value.customer?.name || 'Cliente General'}</div>
      ${order.value.customer?.document_number ? `<div>Doc: ${order.value.customer.document_number}</div>` : ''}
      <div class="line"></div>

      <!-- Productos -->
      <div class="bold">PRODUCTOS</div>
      <div class="line"></div>
      ${products.map(item => `
        <div>
          ${item.name}${item.discount_percent ? ` <span style="font-size: 9px; background: #fee2e2; color: #dc2626; padding: 1px 3px; border-radius: 2px;">-${item.discount_percent}%</span>` : ''}
          <table>
            <tr>
              <td>${item.quantity} x ${item.original_price ? `<span style="text-decoration: line-through; color: #999;">S/ ${item.original_price.toFixed(2)}</span> ` : ''}S/ ${item.price.toFixed(2)}</td>
              <td class="right">S/ ${item.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      `).join('')}
      <div class="line"></div>

      <!-- Totales -->
      <table>
        <tr>
          <td>OPERACIONES GRAVADAS:</td>
          <td class="right">S/ ${getSubtotal().toFixed(2)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">S/ ${getTax().toFixed(2)}</td>
        </tr>
        <tr class="total">
          <td>TOTAL GENERAL S/:</td>
          <td class="right">S/ ${getTotal().toFixed(2)}</td>
        </tr>
      </table>

      <!-- Pagos -->
      ${payments.length > 0 ? `
        <div class="line"></div>
        <div class="bold">PAGOS</div>
        ${payments.map(p => `
          <div class="item-row">
            <span>${p.method_name || p.metodo}</span>
            <span>S/ ${parseFloat(p.amount || p.monto || 0).toFixed(2)}</span>
          </div>
        `).join('')}
      ` : ''}
      <div class="line"></div>

      <!-- Footer Legal -->
      ${companyInfo.sunat ? `
        <div class="center small" style="margin-bottom: 5px;">
          ${companyInfo.sunat.authorizationText}
        </div>
        <div class="center small" style="margin-bottom: 10px;">
          ${companyInfo.sunat.representationText}
        </div>
      ` : ''}

      <!-- QR Code (si hay comprobante electrónico) -->
      ${billingDoc?.files?.pdf ? `
        <div class="center" style="margin: 10px 0;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(billingDoc.files.pdf)}" alt="QR Comprobante" style="width: 120px; height: 120px; border: 1px solid #ccc; padding: 4px;" />
        </div>
      ` : ''}

      <!-- Website después del QR -->
      ${companyInfo.website ? `
        <div class="center small" style="margin-bottom: 10px;">
          Para más productos visita<br />
          <span class="bold">${companyInfo.website}</span>
        </div>
      ` : ''}

      <div class="center bold">¡Gracias por su compra!</div>
      <div class="center small">${formatDate(order.value.created_at)}</div>
      ${order.value.cajero_nombre ? `<div class="center small">Cajero: ${order.value.cajero_nombre}</div>` : ''}
      <div class="center small bold" style="margin-top: 10px;">REIMPRESIÓN</div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=300,height=600');
  printWindow.document.write(ticketHTML);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
  };
};

const openEmailModal = () => {
  // Pre-cargar el email del cliente si existe
  emailInput.value = order.value?.customer?.email || '';
  emailInputError.value = null;
  showEmailModal.value = true;
};

const closeEmailModal = () => {
  if (!sendingEmail.value) {
    showEmailModal.value = false;
    emailInput.value = '';
    emailInputError.value = null;
  }
};

const confirmSendEmail = async () => {
  // Limpiar errores previos
  emailInputError.value = null;
  emailSuccess.value = null;
  emailError.value = null;

  // Validar que se ingresó un email
  if (!emailInput.value || emailInput.value.trim() === '') {
    emailInputError.value = 'Por favor ingresa un email';
    return;
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    emailInputError.value = 'El formato del email no es válido';
    return;
  }

  try {
    sendingEmail.value = true;

    const response = await ordersApi.resendInvoiceEmail(order.value.id, emailInput.value.trim());

    // El axios interceptor ya transformó la respuesta a { success: true/false }
    if (response.success) {
      emailSuccess.value = `Comprobante enviado exitosamente a ${emailInput.value.trim()}`;
      setTimeout(() => emailSuccess.value = null, 5000);
      closeEmailModal();
    } else {
      throw new Error(response.message || 'Error al enviar el email');
    }
  } catch (err) {
    console.error('Error sending email:', err);
    emailError.value = err.message || 'No se pudo enviar el email. Inténtalo nuevamente.';
    setTimeout(() => emailError.value = null, 8000);
  } finally {
    sendingEmail.value = false;
  }
};

// === Void order functions ===
const canVoidOrder = () => {
  return order.value &&
         order.value.status == 1 &&
         order.value.source === 'pos';
};

const getVoidReason = () => {
  try {
    const raw = order.value?._rawDetail?.tiendaventa_errormensajeusuario;
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed.tipo === 'anulacion_pos') return parsed.motivo;
    return null;
  } catch {
    return null;
  }
};

const closeVoidModal = () => {
  if (!voidLoading.value) {
    showVoidModal.value = false;
    voidAuthValue.value = '';
    voidMotivo.value = '';
    voidError.value = null;
  }
};

const confirmVoid = async () => {
  voidError.value = null;

  if (!voidAuthValue.value) {
    voidError.value = voidAuthType.value === 'pin' ? 'Ingresa el PIN' : 'Ingresa la contraseña';
    return;
  }

  if (!voidMotivo.value || voidMotivo.value.trim().length < 3) {
    voidError.value = 'Ingresa un motivo válido (mínimo 3 caracteres)';
    return;
  }

  try {
    voidLoading.value = true;
    const result = await ordersApi.voidOrder(order.value.id, {
      authType: voidAuthType.value,
      authValue: voidAuthValue.value,
      motivo: voidMotivo.value.trim()
    });

    // Update local state
    order.value.status = 4;
    showVoidModal.value = false;
    voidSuccess.value = 'Venta anulada correctamente';
    setTimeout(() => voidSuccess.value = null, 5000);

    // Reload order to get updated data
    await loadOrderDetail();
  } catch (err) {
    console.error('Error voiding order:', err);
    voidError.value = err.message || 'Error al anular la venta';
  } finally {
    voidLoading.value = false;
  }
};

const canShowEmailButton = () => {
  // Mostrar botón si la orden está aprobada (status = 1). El backend envía el
  // comprobante de la compra; si la venta tiene comprobante electrónico adjunta
  // serie/PDF/XML, y si no, manda solo el resumen.
  return order.value && order.value.status == 1;
};

const showErpNotification = () => {
  // Solo tiene sentido si la tienda tiene integración con el ERP (NetSuite).
  // Sin ERP configurado, toda orden POS queda con estado_notif_erp = 9 (pendiente)
  // de forma permanente porque no hay nada que la sincronice: no mostramos el bloque.
  if (!authStore.canNetsuite) return false;
  return order.value?._rawDetail?.tiendaventa_estado_notif_erp != null;
};

// Estado de sincronización ERP. El código numérico es genérico y ambiguo entre
// NetSuite y los WMS (p.ej. 1 = éxito en WMS pero no lo usa NetSuite), así que:
//   0 = éxito · 9 = pendiente (encolada, aún no procesada, NO es error)
//   resto = se decide por el `success` del JSON de respuesta; si no hay, es error.
const erpSyncState = computed(() => {
  const estado = order.value?._rawDetail?.tiendaventa_estado_notif_erp;
  if (estado == null) return null;
  const n = Number(estado);
  if (n === 0) return 'success';
  if (n === 9) return 'pending';

  const raw = order.value?._rawDetail?.tiendaventa_mensaje_notif_erp;
  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && parsed.success === true) return 'success';
    } catch { /* JSON inválido: tratar como error abajo */ }
  }
  return 'error';
});

const erpErrorDetail = computed(() => {
  if (erpSyncState.value !== 'error') return null;
  const raw = order.value?._rawDetail?.tiendaventa_mensaje_notif_erp;
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      error: parsed.error || parsed.message || parsed.error_message || null,
      failed_at: parsed.failed_at || parsed.step || null,
    };
  } catch {
    return { error: raw, failed_at: null };
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadOrderDetail();
});
</script>
