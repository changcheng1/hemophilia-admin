<template>
  <div class="invoice-upload-form">
    <!-- 总金额显示 -->
    <div class="total-amount-header">
      <div class="amount-card">
        <div class="amount-content">
          <span class="amount-label">申请总金额</span>
          <span class="amount-value">¥{{ formatAmount(totalAmount) }}</span>
        </div>
      </div>
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
import { ref, computed } from 'vue'
import { Document, Plus } from '@element-plus/icons-vue'
import { normalizeFileUrl } from '@/utils/fileHandler'

interface FileItem {
  name: string
  url: string
  uid?: number | string
  status?: string
  size?: number
  type?: string
}

interface InvoiceData {
  totalReimbursementAmount?: string | number
  transportInvoiceFiles?: FileItem[]
  accommodationInvoiceFiles?: FileItem[]
}

interface Props {
  modelValue: InvoiceData
}

const props = defineProps<Props>()

const previewVisible = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)

// 表单数据
const formData = computed(() => props.modelValue)

// 交通费发票文件
const transportInvoiceFiles = computed(() => props.modelValue.transportInvoiceFiles || [])

// 住宿费发票文件
const accommodationInvoiceFiles = computed(() => props.modelValue.accommodationInvoiceFiles || [])

// 总金额
const totalAmount = computed(() => {
  return parseFloat(String(props.modelValue.totalReimbursementAmount || 0)) || 0
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
  .total-amount-header {
    margin-bottom: 24px;

    .amount-card {
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