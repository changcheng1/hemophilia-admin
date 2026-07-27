<template>
  <div class="application-files">
    <h3>申请材料</h3>
    <div v-if="files.length === 0" class="no-files">
      <el-empty description="暂无上传文件" />
    </div>
    <div v-else class="files-grid">
      <div 
        v-for="file in files" 
        :key="file.id" 
        class="file-item"
      >
        <div class="file-header">
          <span class="file-type">{{ getFileTypeLabel(file.fileType) }}</span>
          <div class="file-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="handlePreviewFile(file)"
              :icon="View"
            >
              预览
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="handleDownloadFile(file)"
              :icon="Download"
            >
              下载
            </el-button>
          </div>
        </div>
        <div class="file-info">
          <p class="file-name">{{ file.originalName }}</p>
          <p class="file-meta">
            大小: {{ formatFileSize(file.fileSize) }} | 
            上传时间: {{ formatDate(file.uploadedAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- File Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      :title="previewFile?.originalName"
      width="80%"
      center
      @close="handlePreviewClose"
    >
      <div class="preview-container">
        <div v-if="isImageFile(previewFile)" class="image-preview">
          <img 
            :src="previewUrl" 
            :alt="previewFile?.originalName"
            style="max-width: 100%; max-height: 70vh; object-fit: contain;"
          />
        </div>
        <div v-else class="unsupported-preview">
          <el-result
            icon="warning"
            title="无法预览此文件类型"
            sub-title="请下载文件后使用相应软件打开"
          >
            <template #extra>
              <el-button 
                type="primary" 
                @click="handleDownloadFile(previewFile!)"
                :icon="Download"
              >
                下载文件
              </el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Download } from '@element-plus/icons-vue'
import { useApplicationStore } from '@/stores/application'
import type { ApplicationFile, FileType } from '@/types/application'

interface Props {
  files: ApplicationFile[]
}

defineProps<Props>()

const applicationStore = useApplicationStore()

// Preview state
const previewVisible = ref(false)
const previewFile = ref<ApplicationFile | null>(null)
const previewUrl = ref('')

// File type labels
const fileTypeLabels: Record<FileType, string> = {
  id_card_front: '身份证人像面',
  id_card_back: '身份证国徽面',
  medical_record: '病历资料',
  medical_report: '医疗报告',
  medical_invoice: '医疗发票及费用清单',
  transport_invoice: '交通发票',
  accommodation_invoice: '住宿发票',
  bank_card_front: '银行卡正面',
  bank_card_back: '银行卡背面',
  guardian_relationship_proof: '监护关系证明',
  signature: '申请人签名'
}

const getFileTypeLabel = (fileType: FileType): string => {
  return fileTypeLabels[fileType] || '未知类型'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const isImageFile = (file: ApplicationFile | null): boolean => {
  if (!file) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageExtensions.some(ext => 
    file.originalName.toLowerCase().endsWith(ext)
  )
}

const handlePreviewFile = async (file: ApplicationFile) => {
  previewFile.value = file
  
  if (isImageFile(file)) {
    try {
      // For images, we can create a preview URL
      // In a real implementation, you might need to fetch the image blob first
      const blob = await applicationStore.downloadFile(file.id, file.originalName)
      previewUrl.value = URL.createObjectURL(blob)
    } catch {
      ElMessage.error('预览失败')
      return
    }
  }
  
  previewVisible.value = true
}

const handleDownloadFile = async (file: ApplicationFile) => {
  await applicationStore.downloadFile(file.id, file.originalName)
}

// Cleanup preview URL when dialog closes
const handlePreviewClose = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  previewFile.value = null
}
</script>

<style scoped>
.application-files {
  margin-top: 20px;
}

.files-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.file-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-type {
  font-weight: 600;
  color: #409eff;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-info {
  color: #606266;
}

.file-name {
  font-weight: 500;
  margin: 0 0 4px 0;
  word-break: break-all;
}

.file-meta {
  font-size: 12px;
  margin: 0;
  color: #909399;
}

.no-files {
  text-align: center;
  padding: 40px 0;
}

.preview-container {
  text-align: center;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.unsupported-preview {
  padding: 40px 0;
}
</style>
