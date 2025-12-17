<template>
  <div class="file-upload-section">
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Upload /></el-icon>
          <span class="header-title">{{ title }}</span>
        </div>
      </template>

      <div class="upload-content">
        <div class="section-description" v-if="description">
          <el-alert
            :title="description"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        <div class="upload-area">
          <!-- 文件列表展示 -->
          <div v-if="fileList.length > 0" class="file-list">
            <div v-for="file in fileList" :key="file.uid" class="file-item">
              <div class="file-info">
                <el-icon class="file-icon"><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</span>
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
          
          <!-- 无文件时的提示 -->
          <div v-else class="no-files">
            <el-empty description="暂无文件" :image-size="60" />
          </div>
        </div>

        <div class="file-count" v-if="maxCount > 1">
          <el-text type="info" size="small">
            共 {{ fileList.length }} 个文件
          </el-text>
        </div>
      </div>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
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
import { Upload, Document } from '@element-plus/icons-vue'

interface FileItem {
  name: string
  url: string
  uid?: number | string
  status?: string
  size?: number
  type?: string
}

interface Props {
  modelValue: FileItem[]
  title: string
  description?: string
  requirements?: string[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 10
})

const previewVisible = ref(false)
const previewImageUrl = ref('')

// 文件列表
const fileList = computed(() => props.modelValue || [])

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
  .upload-card {
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
      flex: 1;
    }
  }

  .upload-content {
    .section-description {
      margin-bottom: 20px;

      :deep(.el-alert) {
        border-radius: 8px;
        border-left: 4px solid #409eff;
      }
    }

    .upload-requirements {
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #409eff;

      .requirements-title {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #409eff;
      }

      .requirements-list {
        margin: 0;
        padding-left: 20px;
        color: #606266;

        li {
          margin-bottom: 8px;
          line-height: 1.5;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .upload-area {
      margin-bottom: 16px;

      .file-list {
        .file-item {
          padding: 12px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          margin-bottom: 8px;
          background: #fafafa;
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

            .file-size {
              color: #909399;
              font-size: 12px;
            }
          }
        }
      }

      .no-files {
        padding: 40px 20px;
        text-align: center;
        background: #fafafa;
        border-radius: 8px;
        border: 1px dashed #d9d9d9;
      }
    }

    .file-count {
      text-align: right;
      padding-top: 12px;
      border-top: 1px solid #e4e7ed;
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