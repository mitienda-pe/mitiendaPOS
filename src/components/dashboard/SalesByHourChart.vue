<template>
  <div class="bg-white rounded-lg shadow p-3 sm:p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Ventas por hora del día</h2>
    <div v-if="!data || data.length === 0" class="h-64 flex items-center justify-center text-gray-400 text-sm">
      Sin ventas en este período
    </div>
    <v-chart v-else :option="option" autoresize class="h-64" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);

const props = defineProps({
  data: { type: Array, default: () => [] }
});

// Rellenar las 24 horas con 0 cuando no hay datos
const fullData = computed(() => {
  const map = new Map(props.data.map((d) => [d.hour, d]));
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: map.get(h)?.count || 0,
    amount: Number(map.get(h)?.amount || 0)
  }));
});

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const p = params[0];
      const row = fullData.value[p.dataIndex];
      return `<b>${String(row.hour).padStart(2, '0')}:00</b><br/>
        Monto: S/ ${row.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}<br/>
        Transacciones: ${row.count}`;
    }
  },
  grid: { top: 20, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category',
    data: fullData.value.map((r) => String(r.hour).padStart(2, '0') + 'h'),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 10, interval: 1 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#f3f4f6' } },
    axisLabel: {
      color: '#6b7280',
      fontSize: 11,
      formatter: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v)
    }
  },
  series: [
    {
      type: 'bar',
      data: fullData.value.map((r) => Number(r.amount.toFixed(2))),
      itemStyle: { color: '#00b2a6', borderRadius: [4, 4, 0, 0] }
    }
  ]
}));
</script>
