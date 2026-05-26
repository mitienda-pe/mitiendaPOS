<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Métodos de pago</h2>
    <div v-if="!data || data.length === 0" class="h-64 flex items-center justify-center text-gray-400 text-sm">
      Sin pagos en este período
    </div>
    <v-chart v-else :option="option" autoresize class="h-64" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

const props = defineProps({
  data: { type: Array, default: () => [] }
});

const palette = ['#00b2a6', '#0ea5e9', '#f59e0b', '#a855f7', '#ef4444', '#10b981', '#6366f1'];

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p) =>
      `<b>${p.name}</b><br/>Monto: S/ ${Number(p.value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}<br/>${p.percent}% del total`
  },
  legend: {
    bottom: 0,
    type: 'scroll',
    textStyle: { fontSize: 11, color: '#374151' }
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: props.data.map((d, i) => ({
        name: d.name,
        value: Number(d.amount.toFixed(2)),
        itemStyle: { color: palette[i % palette.length] }
      }))
    }
  ]
}));
</script>
