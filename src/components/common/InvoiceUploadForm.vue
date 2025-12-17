<template>
  <div class="invoice-upload-form">
    <el-card class="invoice-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Document /></el-icon>
          <span class="header-title">发票信息</span>
        </div>
      </template>

      <div class="invoice-content">
        <!-- 交通费发票 -->
        <div class="invoice-section">
          <div class="section-header">
            <h4 class="section-title">交通费发票</h4>
          </div>

          <div class="amount-display">
            <div class="info-item">
              <label class="info-label">报销金额</label>
              <div class="info-value amount-text">
                {{ formatAmount(formData.transportReimbursementAmount) }}
              </div>
            </div>
          </div>

          <!-- 交通费发票文件 -->
          <div class="invoice-files" v-if="transportInvoiceFiles.length > 0">
            <h5 class="files-title">发票文件</h5>
            <div class="file-list">
              <div v-for="file in transportInvoiceFiles" :key="file.uid" class="file-item">
                <div class="file-info">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="handlePreview(file)"
                  >
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 住宿费发票 -->
        <div class="invoice-section">
          <div class="section-header">
            <h4 class="section-title">住宿费发票</h4>
          </div>

          <div class="amount-display">
            <div class="info-item">
              <label class="info-label">报销金额</label>
              <div class="info-value amount-text">
                {{ formatAmount(formData.accommodationReimbursementAmount) }}
              </div>
            </div>
          </div>

          <!-- 住宿费发票文件 -->
          <div class="invoice-files" v-if="accommodationInvoiceFiles.length > 0">
            <h5 class="files-title">发票文件</h5>
            <div class="file-list">
              <div v-for="file in accommodationInvoiceFiles" :key="file.uid" class="file-item">
                <div class="file-info">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="handlePreview(file)"
                  >
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 总计金额 -->
        <div class="total-amount" v-if="totalAmount > 0">
          <el-card class="amount-card" shadow="never">
            <div class="amount-display">
              <span class="amount-label">申请报销总金额：</span>
              <span class="amount-value">¥{{ formatAmount(totalAmount) }}</span>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="发票预览"
      width="60%"
      :before-close="handlePreviewClose"
    >
      <div class="preview-container">
        <img :src="previewImageUrl" alt="预览图片" class="preview-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'

interface FileItem {
  name: string
  url: string
  uid?: number | string
  status?: string
  size?: number
  type?: string
}

interface InvoiceData {
  transportReimbursementAmount?: string | number
  accommodationReimbursementAmount?: string | number
  transportInvoiceFiles?: FileItem[]
  accommodationInvoiceFiles?: FileItem[]
}

interface Props {
  modelValue: InvoiceData
}

const props = defineProps<Props>()

const previewVisible = ref(false)
const previewImageUrl = ref('')

// 表单数据
const formData = computed(() => props.modelValue)

// 交通费发票文件
const transportInvoiceFiles = computed(() => props.modelValue.transportInvoiceFiles || [])

// 住宿费发票文件
const accommodationInvoiceFiles = computed(() => props.modelValue.accommodationInvoiceFiles || [])

// 总金额计算
const totalAmount = computed(() => {
  const transport = parseFloat(String(props.modelValue.transportReimbursementAmount || 0)) || 0
  const accommodation = parseFloat(String(props.modelValue.accommodationReimbursementAmount || 0)) || 0
  return transport + accommodation
})

// 预览文件
const handlePreview = (file: FileItem) => {
  if (file.url) {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    
    if (imageTypes.includes(fileType || '')) {
      previewImageUrl.value = file.url
      previewVisible.value = true
    } else {
      // 对于非图片文件，在新窗口打开
      window.open(file.url, '_blank')
    }
  }
}

// 关闭预览
const handlePreviewClose = () => {
  previewVisible.value = false
  previewImageUrl.value = ''
}

// 格式化金额显示
const formatAmount = (amount: string | number | undefined): string => {
  const num = parseFloat(String(amount || 0)) || 0
  return num > 0 ? num.toFixed(2) + '元' : '0.00元'
}
</script>

<style scoped lang="scss">
.invoice-upload-form {
  .invoice-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #e4e7ed;
      padding: 16px 20px;
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .header-icon {
      color: #409eff;
      font-size: 18px;
    }

    .header-title {
      font-weight: 600;
      color: #303133;
      font-size: 16px;
    }
  }

  .invoice-content {
    .invoice-section {
      margin-bottom: 40px;
      padding: 20px;
      background: #fafbfc;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }

      .amount-display {
        margin-bottom: 20px;

        .info-item {
          .info-label {
            display: block;
            font-weight: 500;
            color: #606266;
            margin-bottom: 8px;
            font-size: 14px;
          }

          .info-value {
            color: #303133;
            font-size: 14px;
            line-height: 1.5;

            &.amount-text {
              font-size: 16px;
              font-weight: 600;
              color: #409eff;
            }
          }
        }
      }

      .invoice-files {
        .files-title {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
          margin: 0 0 12px 0;
        }

        .file-list {
          .file-item {
            padding: 12px;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            margin-bottom: 8px;
            background: #ffffff;
            transition: all 0.3s ease;

            &:hover {
              background: #f0f8ff;
              border-color: #409eff;
            }

            &:last-child {
              margin-bottom: 0;
            }

            .file-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .file-icon {
                color: #409eff;
                font-size: 18px;
              }

              .file-name {
                flex: 1;
                color: #303133;
                font-weight: 500;
              }
            }
          }
        }
      }
    }

    .total-amount {
      margin: 32px 0;

      .amount-card {
        background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
        border: 1px solid #b3d8ff;

        :deep(.el-card__body) {
          padding: 20px;
        }

        .amount-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          .amount-label {
            font-size: 16px;
            font-weight: 500;
            color: #606266;
          }

          .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #409eff;
            text-shadow: 0 1px 2px rgba(64, 158, 255, 0.2);
          }
        }
      }
    }
  }

  .preview-container {
    text-align: center;

    .preview-image {
      max-width: 100%;
      max-height: 60vh;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>