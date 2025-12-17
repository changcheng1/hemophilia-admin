<template>
  <div class="pie-chart">
    <div ref="chartRef" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface PieData {
  name: string
  value: number
  percentage?: string
}

interface Props {
  data: PieData[]
  height?: number
  title?: string
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  title: '',
  colors: () => ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c45656']
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: props.title,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'middle',
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        fontSize: 12,
        color: '#666'
      },
      formatter: (name: string) => {
        const item = props.data.find(d => d.name === name)
        const percentage = item?.percentage || '0%'
        return `${name} ${percentage}`
      }
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: props.colors[index % props.colors.length]
          }
        }))
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return
  
  const option = {
    legend: {
      formatter: (name: string) => {
        const item = props.data.find(d => d.name === name)
        const percentage = item?.percentage || '0%'
        return `${name} ${percentage}`
      }
    },
    series: [
      {
        data: props.data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: props.colors[index % props.colors.length]
          }
        }))
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 监听高度变化
watch(() => props.height, () => {
  nextTick(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// 响应式处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 100%;
}
</style>