<template>
  <div class="workload-statistics">
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="手机号">
              <el-input
                v-model="searchForm.phone"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核周期">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="～"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disableBeforeDatePickerMinDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="search-buttons">
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>审核工作量统计</span>
          <el-button
            type="success"
            :loading="exporting"
            :disabled="loading"
            @click="handleExport"
          >
            导出
          </el-button>
        </div>
      </template>

      <el-table
        v-if="loading || workloads.length"
        v-loading="loading"
        :data="workloads"
        stripe
        style="width: 100%"
        class="workload-table"
        empty-text="暂无数据"
      >
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="name" label="姓名" min-width="110" />
        <el-table-column prop="totalCount" label="审核总数" min-width="110" />
        <el-table-column prop="approvedCount" label="审核通过数" min-width="120" />
        <el-table-column prop="doubtCount" label="审核存疑数" min-width="120" />
        <el-table-column prop="rejectedCount" label="审核驳回数" min-width="120" />
        <el-table-column prop="startTime" label="开始时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-else
        description="暂无审核工作量数据"
        :image-size="100"
      />

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import {
  adminReviewWorkloadAPI,
  type ReviewWorkload,
  type ReviewWorkloadQueryParams,
} from '@/api/admin-review-workload'
import { disableBeforeDatePickerMinDate } from '@/utils/datePicker'

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentMonthRange = (): string[] => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return [formatDateInput(firstDay), formatDateInput(lastDay)]
}

const searchForm = reactive<{
  phone: string
  name: string
  dateRange: string[]
}>({
  phone: '',
  name: '',
  dateRange: getCurrentMonthRange(),
})

const workloads = ref<ReviewWorkload[]>([])
const loading = ref(false)
const exporting = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const buildFilterParams = (): Omit<ReviewWorkloadQueryParams, 'page' | 'limit'> => {
  const params: Omit<ReviewWorkloadQueryParams, 'page' | 'limit'> = {}

  if (searchForm.phone.trim()) {
    params.phone = searchForm.phone.trim()
  }
  if (searchForm.name.trim()) {
    params.name = searchForm.name.trim()
  }
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }

  return params
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const fetchWorkloads = async () => {
  loading.value = true
  try {
    const response = await adminReviewWorkloadAPI.getReviewWorkloads({
      ...buildFilterParams(),
      page: currentPage.value,
      limit: pageSize.value,
    })
    workloads.value = response.data || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取审核工作量统计失败:', error)
    ElMessage.error('获取审核工作量统计失败')
    workloads.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  void fetchWorkloads()
}

const handleReset = () => {
  searchForm.phone = ''
  searchForm.name = ''
  searchForm.dateRange = getCurrentMonthRange()
  currentPage.value = 1
  void fetchWorkloads()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  void fetchWorkloads()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  void fetchWorkloads()
}

const handleExport = async () => {
  if (exporting.value) return

  exporting.value = true
  try {
    const rows = await adminReviewWorkloadAPI.exportReviewWorkloads(buildFilterParams())
    if (!rows.length) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('审核工作量统计')
    worksheet.columns = [
      { header: '手机号', key: 'phone', width: 18 },
      { header: '姓名', key: 'name', width: 14 },
      { header: '审核总数', key: 'totalCount', width: 14 },
      { header: '审核通过数', key: 'approvedCount', width: 16 },
      { header: '审核存疑数', key: 'doubtCount', width: 16 },
      { header: '审核驳回数', key: 'rejectedCount', width: 16 },
      { header: '开始时间', key: 'startTime', width: 22 },
      { header: '结束时间', key: 'endTime', width: 22 },
    ]
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    rows.forEach((row) => {
      worksheet.addRow({
        phone: row.phone || '-',
        name: row.name || '-',
        totalCount: row.totalCount ?? 0,
        approvedCount: row.approvedCount ?? 0,
        doubtCount: row.doubtCount ?? 0,
        rejectedCount: row.rejectedCount ?? 0,
        startTime: formatDateTime(row.startTime),
        endTime: formatDateTime(row.endTime),
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `审核工作量统计_${formatDateInput(new Date())}.xlsx`)
    ElMessage.success(`Excel导出成功！共导出 ${rows.length} 条数据`)
  } catch (error) {
    console.error('导出审核工作量统计失败:', error)
    ElMessage.error('Excel导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  void fetchWorkloads()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}

.search-form {
  padding: 10px 0;
}

.search-buttons {
  margin-top: 10px;
  text-align: right;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.workload-table {
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}
</style>
