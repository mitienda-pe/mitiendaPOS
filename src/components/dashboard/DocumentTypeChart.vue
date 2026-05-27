<template>
  <div class="bg-white rounded-lg shadow p-3 sm:p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Tipo de comprobante</h2>
    <div v-if="!data || data.length === 0" class="h-64 flex items-center justify-center text-gray-400 text-sm">
      Sin comprobantes en este período
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

const colorByName = {
  Boleta: '#00b2a6',
  Factura: '#0ea5e9',
  Otro: '#94a3b8'
};

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p) =>
      `<b>${p.name}</b><br/>${p.value} comprobantes<br/>${p.percent}% del total`
  },
  legend: { bottom: 0, textStyle: { fontSize: 11, color: '#374151' } },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: { show: false },
      labelLine: { show: false },
      data: props.data.map((d) => ({
        name: d.name,
        value: d.count,
        itemStyle: { color: colorByName[d.name] || '#94a3b8' }
      }))
    }
  ]
}));
</script>
