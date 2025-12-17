<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>申请趋势</h3>
    </div>
    <div ref="chartRef" class="chart" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { MonthlyStats } from '@/types'

interface Props {
  data: MonthlyStats[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['申请数量', '申请金额']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: props.data.map(item => item.month)
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '申请数量',
        position: 'left',
      },
      {
        type: 'value',
        name: '金额(万元)',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '申请数量',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 3
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.8)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: props.data.map(item => item.applications)
      },
      {
        name: '申请金额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          width: 3
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(103, 194, 58, 0.8)'
            },
            {
              offset: 1,
              color: 'rgba(103, 194, 58, 0.1)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: props.data.map(item => Math.round(item.amount / 10000))
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const option = {
    xAxis: [
      {
        data: props.data.map(item => item.month)
      }
    ],
    series: [
      {
        data: props.data.map(item => item.applications)
      },
      {
        data: props.data.map(item => Math.round(item.amount / 10000))
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

watch(() => props.data, updateChart, { deep: true })
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