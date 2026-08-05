<template>
  <div class="invoice-upload-form">
    <!-- 金额汇总 -->
    <div class="total-amount-header">
      <div class="amount-card">
        <div class="amount-content">
          <span class="amount-label">申请金额</span>
          <span class="amount-value">¥{{ formatAmount(requestAmount) }}</span>
        </div>
        <div class="amount-content">
          <span class="amount-label">发票识别金额小计</span>
          <span class="amount-value">¥{{ formatAmount(totalAmount) }}</span>
        </div>
        <div class="amount-sub">
          <span>交通票合计 ¥{{ formatAmount(transportAmount) }}</span>
          <span>住宿票合计 ¥{{ formatAmount(accommodationAmount) }}</span>
        </div>
        <div class="amount-content limit-row">
          <span class="amount-label">季度上限</span>
          <span class="amount-value">¥{{ formatAmount(limitAmount) }}</span>
        </div>
        <div class="amount-content disbursement-row">
          <span class="amount-label">发放金额</span>
          <el-input-number
            v-if="editableDisbursementAmount"
            v-model="localDisbursementAmount"
            :min="0"
            :max="limitAmount || undefined"
            :precision="2"
            controls-position="right"
            @change="handleDisbursementAmountChange"
          />
          <span v-else class="amount-value">¥{{ formatAmount(localDisbursementAmount) }}</span>
        </div>
      </div>
    </div>

    <div class="section-actions">
      <el-button
        type="primary"
        :loading="verifying"
        @click="handleVerifyInvoices"
      >
        发票核验
      </el-button>
    </div>

    <div v-for="group in invoiceGroups" :key="group.type" class="file-group">
      <div class="group-header">
        <h3 class="group-title">{{ group.title }}</h3>
        <div class="group-actions">
          <span class="group-count" v-if="group.files.length > 0">
            ({{ group.files.length }})
          </span>
          <el-button
            v-if="group.type === 'medical_invoice'"
            type="primary"
            plain
            size="small"
            :loading="verifying"
            @click.stop="handleVerifyInvoices"
          >
            医疗发票核验
          </el-button>
        </div>
      </div>
      
      <div class="group-content">
        <div v-if="group.files.length > 0" class="file-list">
          <div 
            v-for="file in group.files" 
            :key="file.uid" 
            class="file-item" 
            @click="handlePreview(file)"
          >
            <div class="file-preview">
              <img 
                v-if="file.url" 
                :src="getFileUrl(file)" 
                :alt="file.name"
                class="file-image"
                @error="handleImageError"
              />
              <div v-else class="file-placeholder">
                <el-icon class="placeholder-icon"><Document /></el-icon>
              </div>
            </div>
            
            <div class="file-info">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-meta">
                <span v-if="file.size">{{ formatFileSize(file.size) }}</span>
                <span>{{ group.title }}</span>
              </div>
              <div class="result-tags">
                <el-tag
                  v-for="tag in invoiceTags(file)"
                  :key="tag.label"
                  :type="tag.type"
                  size="small"
                  effect="light"
                >
                  {{ tag.label }}：{{ tag.value }}
                </el-tag>
              </div>
            </div>
            
            <div class="file-action">
              <el-button 
                type="primary" 
                link 
                size="small"
                @click.stop="handlePreview(file)"
              >
                查看
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-placeholder">
          <div class="placeholder-box">
            <el-icon class="plus-icon"><Plus /></el-icon>
          </div>
          <div class="placeholder-text">暂无{{ group.title }}</div>
        </div>
      </div>
    </div>
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="发票预览"
      width="70%"
      :before-close="handlePreviewClose"
      class="preview-dialog"
    >
      <div class="preview-container">
        <img 
          v-if="currentPreviewUrl" 
          :src="currentPreviewUrl" 
          :alt="currentPreviewFile?.name || ''"
          class="preview-image" 
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { adminApplicationAPI, type InvoiceVerificationResponse } from '@/api/admin-application'
import { normalizeFileUrl } from '@/utils/fileHandler'

interface FileItem {
  name: string
  url: string
  uid?: number | string
  status?: string
  size?: number
  type?: string
  id?: number
  fileType?: string
  recognizedAmount?: number
  recognizedInvoiceNumber?: string
  recognizedInvoiceDate?: string
  verificationStatus?: string
  verificationMessage?: string
}

interface InvoiceData {
  applicationId?: number
  totalReimbursementAmount?: string | number
  verifiedInvoiceTotalAmount?: string | number
  singlePeriodLimitAmount?: string | number
  disbursementAmount?: string | number | null
  transportReimbursementAmount?: string | number
  accommodationReimbursementAmount?: string | number
  medicalInvoiceAmount?: string | number
  transportInvoiceFiles?: FileItem[]
  accommodationInvoiceFiles?: FileItem[]
  medicalInvoiceFiles?: FileItem[]
}

interface InvoiceGroup {
  type: string
  title: string
  files: FileItem[]
}

interface Props {
  modelValue: InvoiceData
  readonly?: boolean
  editableDisbursementAmount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editableDisbursementAmount: false,
})
const emit = defineEmits<{
  'disbursement-amount-change': [value: number]
}>()

const previewVisible = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)
const verifying = ref(false)
const localInvoiceData = ref<InvoiceData>({
  applicationId: undefined,
  totalReimbursementAmount: 0,
  verifiedInvoiceTotalAmount: 0,
  singlePeriodLimitAmount: 0,
  disbursementAmount: null,
  transportReimbursementAmount: 0,
  accommodationReimbursementAmount: 0,
  medicalInvoiceAmount: 0,
  transportInvoiceFiles: [],
  accommodationInvoiceFiles: [],
  medicalInvoiceFiles: [],
})
const localDisbursementAmount = ref(0)

watch(
  () => props.modelValue,
  (value) => {
    localInvoiceData.value = {
      applicationId: value?.applicationId,
      totalReimbursementAmount: value?.totalReimbursementAmount || 0,
      verifiedInvoiceTotalAmount: value?.verifiedInvoiceTotalAmount || 0,
      singlePeriodLimitAmount: value?.singlePeriodLimitAmount || 0,
      disbursementAmount: value?.disbursementAmount ?? null,
      transportReimbursementAmount: value?.transportReimbursementAmount || 0,
      accommodationReimbursementAmount: value?.accommodationReimbursementAmount || 0,
      medicalInvoiceAmount: value?.medicalInvoiceAmount || 0,
      transportInvoiceFiles: (value?.transportInvoiceFiles || []).map((item) => ({ ...item })),
      accommodationInvoiceFiles: (value?.accommodationInvoiceFiles || []).map((item) => ({ ...item })),
      medicalInvoiceFiles: (value?.medicalInvoiceFiles || []).map((item) => ({ ...item })),
    }
    localDisbursementAmount.value = Number(value?.disbursementAmount ?? 0)
    emit('disbursement-amount-change', localDisbursementAmount.value)
  },
  { immediate: true, deep: true },
)

// 表单数据
const formData = computed(() => localInvoiceData.value)

// 交通费发票文件
const transportInvoiceFiles = computed(() => localInvoiceData.value.transportInvoiceFiles || [])

// 住宿费发票文件
const accommodationInvoiceFiles = computed(() => localInvoiceData.value.accommodationInvoiceFiles || [])
const medicalInvoiceFiles = computed(() => localInvoiceData.value.medicalInvoiceFiles || [])

const invoiceGroups = computed((): InvoiceGroup[] => [
  {
    type: 'transport_invoice',
    title: '交通费发票',
    files: transportInvoiceFiles.value,
  },
  {
    type: 'accommodation_invoice',
    title: '住宿费发票',
    files: accommodationInvoiceFiles.value,
  },
  {
    type: 'medical_invoice',
    title: '医疗发票及费用清单',
    files: medicalInvoiceFiles.value,
  },
])

const requestAmount = computed(() =>
  parseFloat(String(localInvoiceData.value.totalReimbursementAmount || 0)) || 0,
)

// OCR 核验后的发票总金额，不覆盖用户填写的申请金额。
const totalAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.verifiedInvoiceTotalAmount || 0)) || 0
})

const transportAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.transportReimbursementAmount || 0)) || 0
})

const accommodationAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.accommodationReimbursementAmount || 0)) || 0
})

const limitAmount = computed(() =>
  parseFloat(String(localInvoiceData.value.singlePeriodLimitAmount || 0)) || 0,
)

const handleDisbursementAmountChange = (value?: number) => {
  const amount = Number(value || 0)
  emit('disbursement-amount-change', amount)
}

// 获取处理后的文件 URL
const getFileUrl = (file: FileItem): string => {
  return normalizeFileUrl(file.url)
}

// 获取当前预览文件的 URL
const currentPreviewUrl = computed(() => {
  return currentPreviewFile.value ? normalizeFileUrl(currentPreviewFile.value.url) : ''
})

// 预览文件
const handlePreview = (file: FileItem) => {
  if (file.url) {
    currentPreviewFile.value = file
    previewVisible.value = true
  }
}

// 关闭预览
const handlePreviewClose = () => {
  previewVisible.value = false
  currentPreviewFile.value = null
}

const handleVerifyInvoices = async () => {
  const applicationId = localInvoiceData.value.applicationId
  if (!applicationId) {
    ElMessage.warning('缺少申请ID，无法核验')
    return
  }

  verifying.value = true
  try {
    const result = await adminApplicationAPI.verifyInvoices(applicationId)
    syncVerificationResult(result)
    ElMessage.success(result.summaryMessage || '发票核验完成')
  } catch (error) {
    console.error('发票核验失败:', error)
    ElMessage.error('发票核验失败')
  } finally {
    verifying.value = false
  }
}

const syncVerificationResult = (result: InvoiceVerificationResponse) => {
  localInvoiceData.value.verifiedInvoiceTotalAmount = result.totalAmount
  localInvoiceData.value.transportReimbursementAmount = result.transportAmount
  localInvoiceData.value.accommodationReimbursementAmount = result.accommodationAmount
  localInvoiceData.value.medicalInvoiceAmount = result.medicalAmount

  const replaceFiles = (files: FileItem[] = []) =>
    files.map((file) => {
      const matched = result.files.find((item) => Number(item.id) === Number(file.id))
      return matched
        ? {
            ...file,
            recognizedAmount: matched.recognizedAmount,
            recognizedInvoiceNumber: matched.recognizedInvoiceNumber,
            recognizedInvoiceDate: matched.recognizedInvoiceDate
              ? String(matched.recognizedInvoiceDate)
              : '',
            verificationStatus: matched.verificationStatus,
            verificationMessage: matched.verificationMessage,
          }
        : file
    })

  localInvoiceData.value.transportInvoiceFiles = replaceFiles(
    localInvoiceData.value.transportInvoiceFiles,
  )
  localInvoiceData.value.accommodationInvoiceFiles = replaceFiles(
    localInvoiceData.value.accommodationInvoiceFiles,
  )
  localInvoiceData.value.medicalInvoiceFiles = replaceFiles(
    localInvoiceData.value.medicalInvoiceFiles,
  )
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  img.style.display = 'none'
}

// 格式化金额显示
const formatAmount = (amount: string | number | undefined): string => {
  const num = parseFloat(String(amount || 0)) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatRecognizedDate = (value?: string): string => {
  if (!value) return ''
  return String(value).split('T')[0] || ''
}

const invoiceTags = (
  file: FileItem,
): Array<{ label: string; value: string; type: 'success' | 'warning' | 'danger' | 'info' }> => {
  const tags: Array<{ label: string; value: string; type: 'success' | 'warning' | 'danger' | 'info' }> = []
  if (file.recognizedInvoiceNumber) {
    tags.push({ label: '发票号', value: file.recognizedInvoiceNumber, type: 'info' })
  }
  const invoiceDate = formatRecognizedDate(file.recognizedInvoiceDate)
  if (invoiceDate) {
    tags.push({ label: '日期', value: invoiceDate, type: 'info' })
  }
  if (file.recognizedAmount !== undefined && file.recognizedAmount !== null) {
    tags.push({ label: '金额', value: `¥${formatAmount(file.recognizedAmount)}`, type: 'success' })
  } else {
    tags.push({ label: '金额', value: '识别失败，请人工核对原图', type: 'danger' })
  }
  if (file.verificationMessage) {
    tags.push({
      label: '核验',
      value: file.verificationMessage,
      type: file.verificationStatus === 'success' ? 'success' : 'warning',
    })
  }
  return tags
}

// 格式化文件大小
const formatFileSize = (size: number | undefined): string => {
  if (!size) return ''
  if (size < 1024) {
    return `${size}B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)}KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  }
}
</script>

<style scoped lang="scss">
.invoice-upload-form {
  .section-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  .total-amount-header {
    margin-bottom: 24px;

    .amount-card {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .amount-sub {
        display: flex;
        gap: 24px;
        font-size: 13px;
        color: #606266;
      }

      .amount-content {
        display: flex;
        align-items: baseline;
        gap: 12px;

        .amount-label {
          font-size: 15px;
          font-weight: 500;
          color: #606266;
        }
        .amount-value {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          letter-spacing: 0;
        }
      }
    }
  }

  .file-group {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .group-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .group-title {
        font-size: 18px;
        font-weight: 600;
        color: #1890ff;
        margin: 0;
        flex: 1;
      }

      .group-count {
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }

      .group-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .group-content {
      .file-list {
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        overflow: hidden;

        .file-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f5f5f5;
          background: #fff;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: #f8f9fa;
          }

          .file-preview {
            width: 40px;
            height: 40px;
            margin-right: 12px;
            border-radius: 6px;
            overflow: hidden;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .file-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .file-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #c0c4cc;

              .placeholder-icon {
                font-size: 20px;
              }
            }
          }

          .file-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .file-name {
              font-size: 14px;
              color: #333;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .file-size {
              font-size: 12px;
              color: #999;
            }

            .file-extra {
              font-size: 12px;
              line-height: 1.5;
              color: #f56c6c;
            }
          }

          .file-action {
            flex-shrink: 0;

            .el-button {
              color: #1890ff;
              
              &:hover {
                color: #40a9ff;
              }
            }
          }
        }
      }

      .empty-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
        border: 2px dashed #d9d9d9;
        border-radius: 12px;
        background: #fafafa;

        .placeholder-box {
          width: 80px;
          height: 80px;
          border: 2px dashed #c0c4cc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          background: #fff;

          .plus-icon {
            font-size: 32px;
            color: #c0c4cc;
          }
        }

        .placeholder-text {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .preview-container {
    text-align: center;

    .preview-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.success-text {
  color: #f56c6c;
}

.error-text {
  color: #f56c6c;
}

// 预览对话框样式
:deep(.preview-dialog) {
  .el-dialog__body {
    padding: 20px;
  }
}

// 压缩发票核验卡片展示
.invoice-upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-actions {
    margin-bottom: 0;
  }

  .total-amount-header {
    margin-bottom: 0;
    padding: 12px 14px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafcff;

  }

  .file-group {
    margin-bottom: 0;
  }

  .invoice-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 12px;
  }

  .invoice-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: #c6e2ff;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    }
  }

  .invoice-card .file-preview {
    width: 100%;
    height: auto;
    margin-right: 0;
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    overflow: hidden;
    background: #f5f7fa;
  }

  .invoice-card .file-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .invoice-card .file-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .invoice-card .file-name {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-meta,
  .result-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .file-meta {
    color: #909399;
    font-size: 12px;
  }

  .invoice-card .file-action {
    display: flex;
    justify-content: flex-end;
  }

  .empty-placeholder {
    min-height: 120px;
    padding: 24px 16px;
    border-width: 1px;
    border-radius: 8px;
  }

  .file-list {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    background: #fff;
    cursor: pointer;

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      background: #f8f9fa;
    }
  }

  .file-item .file-preview {
    width: 40px;
    height: 40px;
    margin-right: 0;
    aspect-ratio: auto;
    flex-shrink: 0;
  }

  .file-item .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-item .file-action {
    flex-shrink: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .invoice-upload-form {
    .amount-sub {
      flex-direction: column;
      gap: 6px;
    }

    .invoice-grid {
      grid-template-columns: 1fr;
    }

    .total-amount-header {
      margin-bottom: 20px;

      .amount-card {
        .amount-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;

          .amount-label {
            font-size: 14px;
          }

          .amount-value {
            font-size: 22px;
          }
        }
      }
    }

    .file-group {
      .group-header {
        .group-title {
          font-size: 16px;
        }
      }

      .amount-info {
        padding: 10px 12px;
        
        .amount-label {
          font-size: 13px;
        }

        .amount-value {
          font-size: 14px;
        }
      }

      .group-content {
        .file-list {
          .file-item {
            padding: 10px 12px;

            .file-preview {
              width: 36px;
              height: 36px;
              margin-right: 10px;

              .placeholder-icon {
                font-size: 18px;
              }
            }

            .file-info {
              .file-name {
                font-size: 13px;
              }

              .file-size {
                font-size: 11px;
              }
            }

            .file-action {
              .el-button {
                font-size: 12px;
              }
            }
          }
        }

        .empty-placeholder {
          padding: 30px 15px;

          .placeholder-box {
            width: 60px;
            height: 60px;

            .plus-icon {
              font-size: 24px;
            }
          }

          .placeholder-text {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
