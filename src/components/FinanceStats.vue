<template>
  <div class="finance-stats">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ formatCurrency(stats?.totalPendingAmount || 0) }}</div>
            <div class="stat-label">待发放金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ formatCurrency(stats?.totalDisbursedAmount || 0) }}</div>
            <div class="stat-label">已发放金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats?.pendingCount || 0 }}</div>
            <div class="stat-label">待处理申请</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats?.completedCount || 0 }}</div>
            <div class="stat-label">已完成申请</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Monthly Disbursement Chart -->
    <el-card class="chart-card" v-if="stats?.monthlyDisbursement?.length">
      <template #header>
        <div class="card-header">
          <span>月度发放统计</span>
        </div>
      </template>
      <div class="chart-container">
        <canvas ref="chartRef" width="800" height="300"></canvas>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { FinanceStats } from '../types/finance'

interface Props {
  stats: FinanceStats | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartRef = ref<HTMLCanvasElement>()

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const drawChart = async () => {
  if (!chartRef.value || !props.stats?.monthlyDisbursement?.length) return

  await nextTick()
  
  const canvas = chartRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const data = props.stats.monthlyDisbursement
  const width = canvas.width
  const height = canvas.height
  const padding = 60

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Set styles
  ctx.fillStyle = '#303133'
  ctx.strokeStyle = '#409EFF'
  ctx.lineWidth = 2
  ctx.font = '12px Arial'

  // Calculate chart dimensions
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Find max values
  const maxAmount = Math.max(...data.map(d => d.amount))

  // Draw axes
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw bars for amounts
  const barWidth = chartWidth / data.length * 0.6
  const barSpacing = chartWidth / data.length

  data.forEach((item, index) => {
    const x = padding + index * barSpacing + barSpacing * 0.2
    const barHeight = (item.amount / maxAmount) * chartHeight * 0.8
    const y = height - padding - barHeight

    // Draw bar
    ctx.fillStyle = '#409EFF'
    ctx.fillRect(x, y, barWidth, barHeight)

    // Draw month label
    ctx.fillStyle = '#303133'
    ctx.textAlign = 'center'
    ctx.fillText(item.month, x + barWidth / 2, height - padding + 20)

    // Draw amount label
    ctx.fillText(
      formatCurrency(item.amount),
      x + barWidth / 2,
      y - 5
    )
  })

  // Draw Y-axis labels
  ctx.textAlign = 'right'
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * chartHeight * 0.8
    const value = (maxAmount / 5) * i
    ctx.fillText(formatCurrency(value), padding - 10, y + 4)
  }

  // Draw title
  ctx.textAlign = 'center'
  ctx.font = 'bold 14px Arial'
  ctx.fillText('月度发放金额统计', width / 2, 30)
}

// Watch for stats changes to redraw chart
watch(() => props.stats, () => {
  drawChart()
}, { deep: true })

onMounted(() => {
  drawChart()
})
</script>

<style scoped>
.finance-stats {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.chart-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>