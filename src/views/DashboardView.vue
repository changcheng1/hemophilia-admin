<template>
  <div class="dashboard">
    <!-- 信息总览 -->
    <div class="info-overview">
      <h2 class="section-title">信息总览</h2>
      
      <!-- 第一行统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">用户数量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.totalApplications }}</div>
            <div class="stat-label">申请总量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.passedApplications }}</div>
            <div class="stat-label">通过总量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.returnedApplications }}</div>
            <div class="stat-label">退回总量</div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.totalBeneficiaries }}</div>
            <div class="stat-label">援助人数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ formatAmount(stats.totalAmount) }}</div>
            <div class="stat-label">援助金额</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ stats.averageApplications }}</div>
            <div class="stat-label">平均申请数量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="isLoading">
            <div class="stat-number">{{ formatAmount(stats.averageAmount) }}</div>
            <div class="stat-label">平均援助金额（元）</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 被援助者信息统计 -->
    <div class="assistance-statistics">
      <h2 class="section-title">被援助者信息统计</h2>
      
      <!-- 统计选项卡 -->
      <div class="stats-tabs">
        <div class="tab-buttons">
          <el-button 
            :type="activeTab === 'province' ? 'primary' : ''"
            @click="activeTab = 'province'"
          >
            援助省份
          </el-button>
          <el-button 
            :type="activeTab === 'today' ? 'primary' : ''"
            @click="activeTab = 'today'"
          >
            今日
          </el-button>
          <el-button 
            :type="activeTab === 'week' ? 'primary' : ''"
            @click="activeTab = 'week'"
          >
            本周
          </el-button>
          <el-button 
            :type="activeTab === 'month' ? 'primary' : ''"
            @click="activeTab = 'month'"
          >
            本月
          </el-button>
          <el-button 
            :type="activeTab === 'year' ? 'primary' : ''"
            @click="activeTab = 'year'"
          >
            全年
          </el-button>
        </div>
        
        <!-- 筛选控件组 -->
        <div class="filter-controls">
          <!-- 维度筛选下拉框 -->
          <div class="dimension-selector">
            <el-select 
              v-model="selectedDimensionLabel" 
              placeholder="选择筛选维度"
              @change="handleDimensionLabelChange"
              style="width: 140px; margin-right: 10px;"
            >
              <el-option label="受捐者区域" value="受捐者区域" />
              <el-option label="常住地址" value="常住地址" />
              <el-option label="医保所在地" value="医保所在地" />
              <el-option label="就诊地" value="就诊地" />
              <el-option label="户籍所在地" value="户籍所在地" />
            </el-select>
          </div>
          
          <!-- 日期选择器 -->
          <div class="date-picker">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="～"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
      </div>

      <!-- 图表和排名 -->
      <el-row :gutter="20" class="chart-section">
        <el-col :span="16">
          <div class="chart-container" v-loading="isLoading">
            <ProvinceChart 
              :data="provinceData" 
              :height="400"
              :title="chartTitle"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="ranking-container">
            <h3 class="ranking-title">{{ rankingTitle }}</h3>
            <div class="ranking-list">
              <div 
                v-for="(item, index) in provinceRanking" 
                :key="item.province"
                class="ranking-item"
              >
                <div class="ranking-number">{{ index + 1 }}</div>
                <div class="ranking-province">{{ item.province }}</div>
                <div class="ranking-amount">{{ formatAmount(item.amount) }}</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 性别和年龄统计 -->
    <div class="demographic-statistics">
      <h2 class="section-title">用户画像统计</h2>
      
      <el-row :gutter="20" class="pie-charts-section">
        <el-col :span="12">
          <div class="pie-chart-container" v-loading="isLoading">
            <PieChart 
              :data="genderData" 
              :height="300"
              title="性别占比"
              :colors="['#409eff', '#67c23a']"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="pie-chart-container" v-loading="isLoading">
            <PieChart 
              :data="ageData" 
              :height="300"
              title="年龄占比"
              :colors="['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c45656']"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/dashboard'
import ProvinceChart from '@/components/charts/ProvinceChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

const dashboardStore = useDashboardStore()

// 响应式数据
const activeTab = ref('province')
const dateRange = ref<[string, string] | []>([])
const selectedDimensionLabel = ref('受捐者区域')

// 计算属性
const stats = computed(() => dashboardStore.stats)
const isLoading = computed(() => dashboardStore.isLoading)
const lastUpdated = computed(() => dashboardStore.lastUpdated)
const provinceData = computed(() => dashboardStore.provinceData)
const provinceRanking = computed(() => dashboardStore.provinceRanking)
const genderData = computed(() => dashboardStore.genderData)
const ageData = computed(() => dashboardStore.ageData)

// 维度标签映射
const dimensionLabels = {
  recipient: '受捐者区域',
  residence: '常住地址',
  medical: '医保所在地',
  treatment: '就诊地',
  household: '户籍所在地'
}

// 反向映射：从中文标签到英文键值
const labelToDimension: Record<string, string> = {
  '受捐者区域': 'recipient',
  '常住地址': 'residence',
  '医保所在地': 'medical',
  '就诊地': 'treatment',
  '户籍所在地': 'household'
}

// 根据中文标签获取对应的英文维度键值
const selectedDimension = computed(() => {
  return labelToDimension[selectedDimensionLabel.value] || 'recipient'
})

const chartTitle = computed(() => {
  return `${selectedDimensionLabel.value}统计`
})

const rankingTitle = computed(() => {
  return `${selectedDimensionLabel.value}援助排名`
})

// 方法
const formatAmount = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toLocaleString()
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRefresh = async (): Promise<void> => {
  try {
    await dashboardStore.fetchStats()
    await dashboardStore.fetchProvinceData(activeTab.value, dateRange.value, selectedDimension.value)
    await dashboardStore.fetchGenderStats()
    await dashboardStore.fetchAgeStats()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  }
}

const handleDateRangeChange = (dates: [string, string] | null): void => {
  if (dates) {
    dateRange.value = dates
    dashboardStore.fetchProvinceData(activeTab.value, dates, selectedDimension.value)
  }
}

const handleDimensionLabelChange = (label: string): void => {
  selectedDimensionLabel.value = label
  const dimension = (labelToDimension as Record<string, string>)[label] || 'recipient'
  dashboardStore.fetchProvinceData(activeTab.value, dateRange.value, dimension)
}

// 监听activeTab变化
watch(activeTab, (newTab) => {
  dashboardStore.fetchProvinceData(newTab, dateRange.value, selectedDimension.value)
})

// 生命周期
onMounted(async () => {
  try {
    await dashboardStore.fetchStats()
    await dashboardStore.fetchProvinceData(activeTab.value, dateRange.value, selectedDimension.value)
    await dashboardStore.fetchGenderStats()
    await dashboardStore.fetchAgeStats()
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.section-title {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.info-overview {
  margin-bottom: 40px;
}

.demographic-statistics {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.pie-charts-section {
  margin-top: 20px;
}

.pie-chart-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  height: 350px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  line-height: 1;
}

.assistance-statistics {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.stats-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tab-buttons {
  display: flex;
  gap: 10px;
}

.tab-buttons .el-button {
  border-radius: 20px;
  padding: 8px 20px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dimension-selector {
  display: flex;
  align-items: center;
}

.date-picker {
  display: flex;
  align-items: center;
}

.chart-section {
  margin-top: 20px;
}

.chart-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  height: 450px;
}

.ranking-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  height: 450px;
}

.ranking-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.ranking-list {
  max-height: 380px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-right: 15px;
}

.ranking-item:nth-child(1) .ranking-number {
  background: #f56c6c;
}

.ranking-item:nth-child(2) .ranking-number {
  background: #e6a23c;
}

.ranking-item:nth-child(3) .ranking-number {
  background: #67c23a;
}

.ranking-province {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.ranking-amount {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.refresh-section {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.last-updated {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-tabs {
    flex-direction: column;
    gap: 15px;
  }
  
  .tab-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .dimension-selector {
    justify-content: center;
  }
  
  .dimension-selector .el-select {
    width: 100% !important;
  }
  
  .chart-section .el-col {
    margin-bottom: 20px;
  }
  
  .pie-charts-section .el-col {
    margin-bottom: 20px;
  }
}
</style>
