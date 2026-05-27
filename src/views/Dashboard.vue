<template>
  <div class="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">
          {{ authStore.isCashier ? 'Mi Desempeño' : 'Dashboard' }}
        </h1>
        <p v-if="authStore.isCashier && cashierStore.cashier" class="text-xs sm:text-sm text-gray-500 mt-1">
          {{ cashierStore.cashierName }}
        </p>
      </div>
    </div>

    <!-- Filtro de fechas -->
    <div class="mb-6">
      <DateRangePicker
        :model-value="store.filters"
        @preset="(p) => store.setPreset(p)"
        @custom-range="(r) => store.setCustomRange(r.dateFrom, r.dateTo)"
        @toggle-compare="() => store.toggleCompare()"
      />
    </div>

    <!-- Error state -->
    <div
      v-if="store.error"
      class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 mb-6"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-medium text-red-800">No se pudieron cargar las analíticas</h3>
          <p class="text-sm text-gray-600 mt-1">{{ store.error }}</p>
        </div>
        <button
          class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          @click="store.fetchAnalytics()"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- KPIs principales -->
    <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
      <MetricCard
        label="Ventas netas"
        :value="scorecards.net_sales?.value || 0"
        :previous="scorecards.net_sales?.previous ?? null"
        format="currency"
        color="primary"
        :is-loading="store.isLoading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </template>
      </MetricCard>

      <MetricCard
        label="Transacciones"
        :value="scorecards.orders_count?.value || 0"
        :previous="scorecards.orders_count?.previous ?? null"
        format="number"
        color="green"
        :is-loading="store.isLoading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </template>
      </MetricCard>

      <MetricCard
        label="Ticket promedio"
        :value="scorecards.avg_ticket?.value || 0"
        :previous="scorecards.avg_ticket?.previous ?? null"
        format="currency"
        color="purple"
        :is-loading="store.isLoading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-purple-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
          </svg>
        </template>
      </MetricCard>

      <MetricCard
        v-if="!authStore.isCashier"
        label="Productos bajo stock"
        :value="analytics?.low_stock?.length || 0"
        format="number"
        color="red"
        invert-delta
        :is-loading="store.isLoading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </template>
      </MetricCard>
    </div>

    <!-- KPIs secundarios -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
      <MetricCard
        label="Ventas brutas (con IGV)"
        :value="scorecards.gross_sales?.value || 0"
        :previous="scorecards.gross_sales?.previous ?? null"
        format="currency"
        color="primary"
        :is-loading="store.isLoading"
      />
      <MetricCard
        label="Mayor venta"
        :value="scorecards.max_ticket?.value || 0"
        :previous="scorecards.max_ticket?.previous ?? null"
        format="currency"
        color="amber"
        :is-loading="store.isLoading"
      />
      <MetricCard
        label="Items por venta"
        :value="scorecards.avg_items_per_order?.value || 0"
        :previous="scorecards.avg_items_per_order?.previous ?? null"
        format="decimal"
        color="blue"
        :is-loading="store.isLoading"
      />
    </div>

    <!-- Gráficos: tendencia + métodos de pago -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <SalesTrendChart :data="trends.daily_sales || []" />
      <PaymentMethodChart :data="distributions.payment_methods || []" />
    </div>

    <!-- Gráficos: hora del día + comprobantes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <SalesByHourChart :data="distributions.by_hour || []" />
      <DocumentTypeChart :data="distributions.document_types || []" />
    </div>

    <!-- Tablas: productos + cajeros -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <TopProductsTable :data="analytics?.top_products || []" />
      <TopCashiersTable v-if="!authStore.isCashier" :data="analytics?.top_cashiers || []" />
    </div>

    <!-- Stock bajo (solo admins) -->
    <LowStockList v-if="!authStore.isCashier" :data="analytics?.low_stock || []" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';
import DateRangePicker from '../components/dashboard/DateRangePicker.vue';
import MetricCard from '../components/dashboard/MetricCard.vue';
import SalesTrendChart from '../components/dashboard/SalesTrendChart.vue';
import PaymentMethodChart from '../components/dashboard/PaymentMethodChart.vue';
import SalesByHourChart from '../components/dashboard/SalesByHourChart.vue';
import DocumentTypeChart from '../components/dashboard/DocumentTypeChart.vue';
import TopProductsTable from '../components/dashboard/TopProductsTable.vue';
import TopCashiersTable from '../components/dashboard/TopCashiersTable.vue';
import LowStockList from '../components/dashboard/LowStockList.vue';

const store = useDashboardStore();
const authStore = useAuthStore();
const cashierStore = useCashierStore();

const analytics = computed(() => store.analytics);
const scorecards = computed(() => store.analytics?.scorecards || {});
const trends = computed(() => store.analytics?.trends || {});
const distributions = computed(() => store.analytics?.distributions || {});

onMounted(() => {
  store.fetchAnalytics();
});
</script>
