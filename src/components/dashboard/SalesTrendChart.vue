<template>
  <div class="bg-white rounded-lg shadow p-3 sm:p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Ventas por día</h2>
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
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const props = defineProps({
  data: { type: Array, default: () => [] }
});

const formatDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const p = params[0];
      const row = props.data[p.dataIndex];
      return `<div style="font-size:12px">
        <b>${formatDate(row.date)}</b><br/>
        Ventas netas: S/ ${row.net.toLocaleString('es-PE', { minimumFractionDigits: 2 })}<br/>
        Transacciones: ${row.orders}
      </div>`;
    }
  },
  grid: { top: 20, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category',
    data: props.data.map((r) => formatDate(r.date)),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 11 }
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
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: props.data.map((r) => Number(r.net.toFixed(2))),
      lineStyle: { color: '#00b2a6', width: 2 },
      itemStyle: { color: '#00b2a6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,178,166,0.3)' },
            { offset: 1, color: 'rgba(0,178,166,0.02)' }
          ]
        }
      }
    }
  ]
}));
</script>
