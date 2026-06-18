<template>
  <div class="invoice-upload-form">
    <!-- 总金额显示 -->
    <div class="total-amount-header">
      <div class="amount-card">
        <div class="amount-content">
          <span class="amount-label">发票总计</span>
          <span class="amount-value">¥{{ formatAmount(totalAmount) }}</span>
        </div>
        <div class="amount-sub">
          <span>交通票合计 ¥{{ formatAmount(transportAmount) }}</span>
          <span>住宿票合计 ¥{{ formatAmount(accommodationAmount) }}</span>
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

    <!-- 交通费发票 -->
    <div class="file-group">
      <div class="group-header">
        <h3 class="group-title">交通费发票</h3>
        <span class="group-count" v-if="transportInvoiceFiles.length > 0">
          ({{ transportInvoiceFiles.length }})
        </span>
      </div>
      
      <div class="group-content">
        <!-- 有文件时展示文件列表 -->
        <div v-if="transportInvoiceFiles.length > 0" class="file-list">
          <div 
            v-for="file in transportInvoiceFiles" 
            :key="file.uid" 
            class="file-item" 
            @click="handlePreview(file)"
          >
            <!-- 文件图片预览 -->
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
            
            <!-- 文件名称 -->
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</span>
              <span class="file-extra recognized-text" v-if="file.recognizedInvoiceNumber">
                发票号：{{ file.recognizedInvoiceNumber }}
              </span>
              <span class="file-extra recognized-text" v-if="formatRecognizedDate(file.recognizedInvoiceDate)">
                发票日期：{{ formatRecognizedDate(file.recognizedInvoiceDate) }}
              </span>
            <span class="file-extra" v-if="file.recognizedAmount !== undefined && file.recognizedAmount !== null">
                发票金额¥{{ formatAmount(file.recognizedAmount) }}
              </span>
              <span class="file-extra error-text" v-else>
                发票金额识别失败
              </span>
              <span
                class="file-extra"
                :class="file.verificationStatus === 'success' ? 'success-text' : 'error-text'"
                v-if="file.verificationMessage"
              >
                {{ file.verificationMessage }}
              </span>
            </div>
            
            <!-- 查看按钮 -->
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
        
        <!-- 无文件时的占位符 -->
        <div v-else class="empty-placeholder">
          <div class="placeholder-box">
            <el-icon class="plus-icon"><Plus /></el-icon>
          </div>
          <div class="placeholder-text">暂无发票文件</div>
        </div>
      </div>
    </div>

    <!-- 住宿费发票 -->
    <div class="file-group">
      <div class="group-header">
        <h3 class="group-title">住宿费发票</h3>
        <span class="group-count" v-if="accommodationInvoiceFiles.length > 0">
          ({{ accommodationInvoiceFiles.length }})
        </span>
      </div>
      
      <div class="group-content">
        <!-- 有文件时展示文件列表 -->
        <div v-if="accommodationInvoiceFiles.length > 0" class="file-list">
          <div 
            v-for="file in accommodationInvoiceFiles" 
            :key="file.uid" 
            class="file-item" 
            @click="handlePreview(file)"
          >
            <!-- 文件图片预览 -->
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
            
            <!-- 文件名称 -->
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</span>
              <span class="file-extra recognized-text" v-if="file.recognizedInvoiceNumber">
                发票号：{{ file.recognizedInvoiceNumber }}
              </span>
              <span class="file-extra recognized-text" v-if="formatRecognizedDate(file.recognizedInvoiceDate)">
                发票日期：{{ formatRecognizedDate(file.recognizedInvoiceDate) }}
              </span>
              <span class="file-extra" v-if="file.recognizedAmount !== undefined && file.recognizedAmount !== null">
                发票金额¥{{ formatAmount(file.recognizedAmount) }}
              </span>
              <span class="file-extra error-text" v-else>
                发票金额识别失败
              </span>
              <span
                class="file-extra"
                :class="file.verificationStatus === 'success' ? 'success-text' : 'error-text'"
                v-if="file.verificationMessage"
              >
                {{ file.verificationMessage }}
              </span>
            </div>
            
            <!-- 查看按钮 -->
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
        
        <!-- 无文件时的占位符 -->
        <div v-else class="empty-placeholder">
          <div class="placeholder-box">
            <el-icon class="plus-icon"><Plus /></el-icon>
          </div>
          <div class="placeholder-text">暂无发票文件</div>
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
  transportReimbursementAmount?: string | number
  accommodationReimbursementAmount?: string | number
  transportInvoiceFiles?: FileItem[]
  accommodationInvoiceFiles?: FileItem[]
}

interface Props {
  modelValue: InvoiceData
  readonly?: boolean
}

const props = defineProps<Props>()

const previewVisible = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)
const verifying = ref(false)
const localInvoiceData = ref<InvoiceData>({
  applicationId: undefined,
  totalReimbursementAmount: 0,
  transportReimbursementAmount: 0,
  accommodationReimbursementAmount: 0,
  transportInvoiceFiles: [],
  accommodationInvoiceFiles: [],
})

watch(
  () => props.modelValue,
  (value) => {
    localInvoiceData.value = {
      applicationId: value?.applicationId,
      totalReimbursementAmount: value?.totalReimbursementAmount || 0,
      transportReimbursementAmount: value?.transportReimbursementAmount || 0,
      accommodationReimbursementAmount: value?.accommodationReimbursementAmount || 0,
      transportInvoiceFiles: (value?.transportInvoiceFiles || []).map((item) => ({ ...item })),
      accommodationInvoiceFiles: (value?.accommodationInvoiceFiles || []).map((item) => ({ ...item })),
    }
  },
  { immediate: true, deep: true },
)

// 表单数据
const formData = computed(() => localInvoiceData.value)

// 交通费发票文件
const transportInvoiceFiles = computed(() => localInvoiceData.value.transportInvoiceFiles || [])

// 住宿费发票文件
const accommodationInvoiceFiles = computed(() => localInvoiceData.value.accommodationInvoiceFiles || [])

// 总金额
const totalAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.totalReimbursementAmount || 0)) || 0
})

const transportAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.transportReimbursementAmount || 0)) || 0
})

const accommodationAmount = computed(() => {
  return parseFloat(String(localInvoiceData.value.accommodationReimbursementAmount || 0)) || 0
})

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
  localInvoiceData.value.totalReimbursementAmount = result.totalAmount
  localInvoiceData.value.transportReimbursementAmount = result.transportAmount
  localInvoiceData.value.accommodationReimbursementAmount = result.accommodationAmount

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
      .amount-sub {
        display: flex;
        gap: 24px;
        margin-top: 10px;
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
          font-size: 20px;
          font-weight: 700;
          color: red;
          letter-spacing: 0.5px;
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

// 响应式设计
@media (max-width: 768px) {
  .invoice-upload-form {
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
