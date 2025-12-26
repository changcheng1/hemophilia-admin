<template>
  <div class="file-upload-section">
    <!-- 按文件类型分组展示 -->
    <div v-for="group in fileGroups" :key="group.type" class="file-group">
      <div class="group-header">
        <h3 class="group-title">{{ group.title }}</h3>
        <span class="group-count" v-if="group.files.length > 0">
          ({{ group.files.length }})
        </span>
      </div>
      
      <div class="group-description" v-if="group.description">
        <p>{{ group.description }}</p>
      </div>
      
      <div class="group-content">
        <!-- 有文件时展示文件列表 -->
        <div v-if="group.files.length > 0" class="file-list">
          <div v-for="file in group.files" :key="file.uid" class="file-item" @click="handlePreview(file)">
            <!-- 文件图片预览 -->
            <div class="file-preview">
              <img 
                v-if="file.url" 
                :src="getFileUrl(file)" 
                :alt="getFileName(file)"
                class="file-image"
                @error="handleImageError"
              />
              <div v-else class="file-placeholder">
                <el-icon class="placeholder-icon"><Document /></el-icon>
              </div>
            </div>
            
            <!-- 文件名称 -->
            <div class="file-info">
              <span class="file-name">{{ getFileName(file) }}</span>
              <span class="file-size" v-if="file.size">{{ formatFileSize(getFileSize(file)) }}</span>
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
          <div class="placeholder-text">{{ group.placeholder || '暂无文件' }}</div>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文件预览"
      width="70%"
      :before-close="handlePreviewClose"
      class="preview-dialog"
    >
      <div class="preview-container">
        <img 
          v-if="currentPreviewUrl" 
          :src="currentPreviewUrl" 
          :alt="currentPreviewFile ? getFileName(currentPreviewFile) : ''"
          class="preview-image" 
        />
        <div v-else class="file-preview">
          <el-icon class="large-file-icon"><Document /></el-icon>
          <div class="file-details">
            <h3>{{ currentPreviewFile ? getFileName(currentPreviewFile) : '' }}</h3>
            <p>文件大小: {{ currentPreviewFile?.size ? formatFileSize(getFileSize(currentPreviewFile)) : '未知' }}</p>
            <p>文件类型: {{ getFileType(currentPreviewFile ? getFileName(currentPreviewFile) : '') }}</p>
            <el-button type="primary" @click="downloadFile(currentPreviewFile)">
              <el-icon><Download /></el-icon>
              下载文件
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Download, Plus } from '@element-plus/icons-vue'
import { normalizeFileUrl } from '@/utils/fileHandler'

interface FileItem {
  id?: number
  applicationId?: number
  fileType: string // 文件分类类型
  originalName: string // 原始文件名
  filename?: string // 存储文件名
  path?: string // 文件路径
  url: string // 文件访问URL
  mimetype?: string // MIME类型
  size: string | number // 文件大小
  createdAt?: string
  // 兼容旧格式
  name?: string
  uid?: number | string
  status?: string
  type?: string
}

interface FileGroup {
  type: string
  title: string
  description?: string
  placeholder?: string
  files: FileItem[]
}

interface Props {
  modelValue: FileItem[]
  title?: string
  description?: string
  requirements?: string[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 10
})

const previewVisible = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)

// 获取处理后的文件 URL
const getFileUrl = (file: FileItem): string => {
  return normalizeFileUrl(file.url)
}

// 获取当前预览文件的 URL
const currentPreviewUrl = computed(() => {
  return currentPreviewFile.value ? normalizeFileUrl(currentPreviewFile.value.url) : ''
})

// 文件列表
const fileList = computed(() => props.modelValue || [])

// 按文件类型分组
const fileGroups = computed((): FileGroup[] => {
  const groups: FileGroup[] = [
    {
      type: 'id_card_front',
      title: '患者身份证件（正面）',
      placeholder: '人像面',
      files: []
    },
    {
      type: 'id_card_back', 
      title: '患者身份证件（背面）',
      placeholder: '国徽面',
      files: []
    },
    {
      type: 'medical_record',
      title: '就诊病历',
      files: []
    },
    {
      type: 'medical_invoice',
      title: '医疗发票及费用清单',
      files: []
    },
    {
      type: 'medical_report',
      title: '检查报告和诊断证明',
      files: []
    },

  ]

  // 将文件分配到对应的组
  fileList.value.forEach(file => {
    // 直接使用文件的 fileType 字段进行匹配
    const fileType = file.fileType
    
    if (fileType) {
      // 排除交通费发票和住宿费发票，这些将在 invoiceUploadForm 组件中处理
      if (fileType === 'transport_invoice' || fileType === 'accommodation_invoice') {
        return // 跳过这些文件类型
      }
      const targetGroup = groups.find(g => g.type === fileType)
      
      if (targetGroup) {
        targetGroup.files.push(file)
      } else {
        // 如果没有找到匹配的分组，输出警告信息以便调试
        console.warn(`未找到文件类型 "${fileType}" 对应的分组，文件：`, file)
      }
    } else {
      console.warn('文件缺少 fileType 字段：', file)
    }
  })
  
  return groups
})



// 获取文件名
const getFileName = (file: FileItem): string => {
  return file.originalName || '未知文件'
}

// 获取文件大小
const getFileSize = (file: FileItem): number => {
  if (typeof file.size === 'string') {
    return parseInt(file.size) || 0
  }
  return file.size || 0
}





// 获取文件类型描述
const getFileType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'jpg': '图片',
    'jpeg': '图片', 
    'png': '图片',
    'gif': '图片',
    'bmp': '图片',
    'webp': '图片',
    'svg': '图片',
  }
  return typeMap[ext || ''] || '未知类型'
}

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

// 下载文件
const downloadFile = (file: FileItem | null) => {
  if (file?.url) {
    const link = document.createElement('a')
    link.href = normalizeFileUrl(file.url)
    link.download = getFileName(file)
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  
  // 隐藏图片，显示文件占位符
  img.style.display = 'none'
  
  // 可以在这里添加重试逻辑或显示默认图片
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = `
      <div class="file-placeholder">
        <el-icon class="placeholder-icon"><Document /></el-icon>
      </div>
    `
  }
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
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
.file-upload-section {
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

    .group-description {
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1890ff;

      p {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-line;
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

    // 银行卡特殊样式
    &:last-child {
      .group-content {
        background: linear-gradient(135deg, #fff9c4 0%, #f7e98e 100%);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #fadb14;

        .empty-placeholder {
          background: rgba(255, 255, 255, 0.8);
          border-color: #fadb14;

          .placeholder-box {
            border-color: #fadb14;
            background: #fff;

            .plus-icon {
              color: #fadb14;
            }
          }
        }

        .file-item-vertical {
          background: rgba(255, 255, 255, 0.9);
          border-color: #fadb14;

          &:hover {
            background: #fff;
            border-color: #d48806;
          }
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

    .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;

      .large-file-icon {
        font-size: 80px;
        color: #c0c4cc;
        margin-bottom: 20px;
      }

      .file-details {
        text-align: center;

        h3 {
          margin: 0 0 16px 0;
          color: #303133;
          font-size: 18px;
        }

        p {
          margin: 8px 0;
          color: #606266;
          font-size: 14px;
        }

        .el-button {
          margin-top: 20px;
        }
      }
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
  .file-upload-section {
    .file-group {
      .group-header {
        .group-title {
          font-size: 16px;
        }
      }

      .group-description {
        padding: 10px 12px;
        
        p {
          font-size: 13px;
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