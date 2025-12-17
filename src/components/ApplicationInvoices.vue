<template>
  <div class="application-invoices">
    <!-- 发票金额汇总 -->
    <el-row style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>发票金额汇总</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic
                title="交通费报销金额"
                :value="application.transportReimbursementAmount || 0"
                suffix="元"
                :precision="2"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="住宿费报销金额"
                :value="application.accommodationReimbursementAmount || 0"
                suffix="元"
                :precision="2"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="申请总金额"
                :value="totalAmount"
                suffix="元"
                :precision="2"
                class="total-amount"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发票上传 -->
    <el-row>
      <el-col :span="24">
        <el-card class="invoice-card">
          <template #header>
            <div class="card-header">
              <span>发票上传</span>
            </div>
          </template>
          
          <div class="invoice-section">
            <div v-if="invoiceFiles.length > 0">
              <el-row :gutter="20">
                <el-col 
                  :span="8" 
                  v-for="(invoice, index) in invoiceFiles" 
                  :key="index"
                  style="margin-bottom: 20px;"
                >
                  <div class="invoice-item">
                    <div class="invoice-preview">
                      <el-image
                        :src="invoice.fileUrl"
                        :preview-src-list="[invoice.fileUrl]"
                        fit="cover"
                        class="invoice-image"
                      />
                    </div>
                    <div class="invoice-info">
                      <div class="invoice-name">{{ invoice.originalName }}</div>
                      <div class="invoice-details">
                        <div class="detail-item">
                          <span class="label">文件大小:</span>
                          <span class="value">{{ formatFileSize(invoice.fileSize) }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">上传时间:</span>
                          <span class="value">{{ formatDateTime(invoice.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="invoice-actions">
                        <el-button
                          type="primary"
                          size="small"
                          @click="previewInvoice(invoice)"
                        >
                          预览
                        </el-button>
                        <el-button
                          type="success"
                          size="small"
                          @click="downloadInvoice(invoice)"
                        >
                          下载
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <div v-else class="no-invoices">
              <el-empty description="暂无发票上传" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发票详细列表 -->
    <el-row style="margin-top: 20px;" v-if="invoiceFiles.length > 0">
      <el-col :span="24">
        <el-card class="invoice-list-card">
          <template #header>
            <div class="card-header">
              <span>发票详细列表</span>
            </div>
          </template>
          
          <el-table :data="invoiceFiles" stripe>
            <el-table-column prop="originalName" label="发票文件名" />
            <el-table-column label="发票类型" width="120">
              <template #default="{ row }">
                {{ getInvoiceTypeText(row.fileType) }}
              </template>
            </el-table-column>
            <el-table-column prop="fileSize" label="文件大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="上传时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default>
                <el-tag type="success" size="small">已上传</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="previewInvoice(row)"
                >
                  预览
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="downloadInvoice(row)"
                >
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发票预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="发票预览"
      width="800px"
      center
    >
      <div v-if="currentPreviewInvoice" class="invoice-preview-dialog">
        <el-image
          :src="currentPreviewInvoice.fileUrl"
          fit="contain"
          style="width: 100%; max-height: 600px;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface InvoiceFile {
  id: number
  fileType: string
  originalName: string
  fileUrl: string
  fileSize: number
  createdAt: string
}

interface Application {
  files?: InvoiceFile[]
  transportReimbursementAmount?: number
  accommodationReimbursementAmount?: number
}

interface Props {
  application: Application
}

const props = defineProps<Props>()

const previewDialogVisible = ref(false)
const currentPreviewInvoice = ref<InvoiceFile | null>(null)

// 计算发票文件
const invoiceFiles = computed(() => {
  return (props.application.files || []).filter((file: InvoiceFile) => 
    file.fileType === 'medical_invoice'
  )
})

// 计算总金额
const totalAmount = computed(() => {
  const transport = props.application.transportReimbursementAmount || 0
  const accommodation = props.application.accommodationReimbursementAmount || 0
  return transport + accommodation
})

const getInvoiceTypeText = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    'medical_invoice': '医疗发票',
    'transport_invoice': '交通发票',
    'accommodation_invoice': '住宿发票'
  }
  return typeMap[fileType] || '其他发票'
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const previewInvoice = (invoice: InvoiceFile) => {
  currentPreviewInvoice.value = invoice
  previewDialogVisible.value = true
}

const downloadInvoice = (invoice: InvoiceFile) => {
  if (invoice.fileUrl) {
    const link = document.createElement('a')
    link.href = invoice.fileUrl
    link.download = invoice.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.application-invoices {
  padding: 10px 0;
}

.summary-card,
.invoice-card,
.invoice-list-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.total-amount :deep(.el-statistic__content) {
  color: #f56c6c;
  font-weight: 600;
}

.invoice-section {
  padding: 10px 0;
}

.invoice-item {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.invoice-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.invoice-preview {
  height: 200px;
  overflow: hidden;
}

.invoice-image {
  width: 100%;
  height: 100%;
}

.invoice-info {
  padding: 15px;
}

.invoice-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}

.label {
  color: #909399;
}

.value {
  color: #606266;
}

.invoice-actions {
  display: flex;
  gap: 10px;
}

.no-invoices {
  text-align: center;
  padding: 40px 0;
}

.invoice-preview-dialog {
  text-align: center;
}

:deep(.el-statistic__number) {
  font-size: 24px;
  font-weight: 600;
}

:deep(.el-statistic__title) {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}
</style>