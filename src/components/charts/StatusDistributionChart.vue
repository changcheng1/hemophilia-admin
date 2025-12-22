<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>申请状态分布</h3>
    </div>
    <div ref="chartRef" class="chart" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { DashboardStats } from '@/types/dashboard'

interface Props {
  stats: DashboardStats
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const chartData = computed(() => [
  { value: props.stats.pendingReview, name: '待处理', itemStyle: { color: '#e6a23c' } },
  { value: props.stats.approvedApplications, name: '已完成', itemStyle: { color: '#67c23a' } },
  { value: props.stats.rejectedApplications, name: '已拒绝', itemStyle: { color: '#f56c6c' } },
])

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: chartData.value.map(item => item.name)
    },
    series: [
      {
        name: '申请状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const option = {
    legend: {
      data: chartData.value.map(item => item.name)
    },
    series: [
      {
        data: chartData.value
      }
    ]
  }

  chartInstance.setOption(option)
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})

watch(() => props.stats, updateChart, { deep: true })
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.chart {
  width: 100%;
}
</style>