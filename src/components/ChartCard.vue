<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
} from 'chart.js'
import { Bar, Pie, Line } from 'vue-chartjs'

// registra módulos
ChartJS.register(
  Title, Tooltip, Legend,
  ArcElement, LineElement, BarElement, PointElement,
  CategoryScale, LinearScale, TimeScale
)

const props = defineProps({
  title: { type: String, default: '' },
  type: { type: String, default: 'bar' },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({ responsive: true, maintainAspectRatio: false }) }
})

// Paleta de cores padrão
const palette = [
  '#FF6384', '#36A2EB', '#FFCE56',
  '#4BC0C0', '#9966FF', '#FF9F40',
  '#C9CBCF', '#00A878', '#F87060',
  '#4D9078'
]

// Função para aplicar cores no dataset
const coloredData = computed(() => {
  const cloned = JSON.parse(JSON.stringify(props.data))
  cloned.datasets = cloned.datasets.map(dataset => ({
    ...dataset,
    backgroundColor: Array.isArray(dataset.data)
      ? dataset.data.map((_, i) => palette[i % palette.length])
      : palette[0],
    borderColor: '#fff',
    borderWidth: 1
  }))
  return cloned
})

const Comp = computed(() => {
  if (props.type === 'pie') return Pie
  if (props.type === 'line') return Line
  return Bar
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow p-4">
    <div class="text-sm font-semibold mb-2">{{ title }}</div>
    <div class="h-80">
      <component :is="Comp" :data="coloredData" :options="options" />
    </div>
  </div>
</template>
