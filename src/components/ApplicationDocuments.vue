<template>
  <div class="application-documents">
    <el-row :gutter="20">
      <!-- 身份证件 -->
      <el-col :span="12">
        <el-card class="document-card">
          <template #header>
            <div class="card-header">
              <span>身份证件</span>
            </div>
          </template>
          
          <div class="document-section">
            <div class="document-item">
              <div class="document-label">身份证人像面</div>
              <div class="document-content">
                <div v-if="getDocumentByType('id_card_front')" class="file-item">
                  <el-image
                    :src="getDocumentByType('id_card_front')?.fileUrl"
                    :preview-src-list="[getDocumentByType('id_card_front')?.fileUrl].filter(Boolean)"
                    fit="cover"
                    class="document-image"
                  />
                  <div class="file-info">
                    <div class="file-name">{{ getDocumentByType('id_card_front')?.originalName }}</div>
                    <div class="file-size">{{ formatFileSize(getDocumentByType('id_card_front')?.fileSize || 0) }}</div>
                  </div>
                </div>
                <div v-else class="no-file">未上传</div>
              </div>
            </div>

            <div class="document-item">
              <div class="document-label">身份证国徽面</div>
              <div class="document-content">
                <div v-if="getDocumentByType('id_card_back')" class="file-item">
                  <el-image
                    :src="getDocumentByType('id_card_back')?.fileUrl"
                    :preview-src-list="[getDocumentByType('id_card_back')?.fileUrl].filter(Boolean)"
                    fit="cover"
                    class="document-image"
                  />
                  <div class="file-info">
                    <div class="file-name">{{ getDocumentByType('id_card_back')?.originalName }}</div>
                    <div class="file-size">{{ formatFileSize(getDocumentByType('id_card_back')?.fileSize || 0) }}</div>
                  </div>
                </div>
                <div v-else class="no-file">未上传</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 医疗资料 -->
      <el-col :span="12">
        <el-card class="document-card">
          <template #header>
            <div class="card-header">
              <span>医疗资料</span>
            </div>
          </template>
          
          <div class="document-section">
            <div class="document-item">
              <div class="document-label">就诊病历</div>
              <div class="document-content">
                <div v-if="getDocumentByType('medical_record')" class="file-item">
                  <el-image
                    :src="getDocumentByType('medical_record')?.fileUrl"
                    :preview-src-list="[getDocumentByType('medical_record')?.fileUrl].filter(Boolean)"
                    fit="cover"
                    class="document-image"
                  />
                  <div class="file-info">
                    <div class="file-name">{{ getDocumentByType('medical_record')?.originalName }}</div>
                    <div class="file-size">{{ formatFileSize(getDocumentByType('medical_record')?.fileSize || 0) }}</div>
                  </div>
                </div>
                <div v-else class="no-file">未上传</div>
              </div>
            </div>

            <div class="document-item">
              <div class="document-label">检查报告</div>
              <div class="document-content">
                <div v-if="getDocumentByType('examination_report')" class="file-item">
                  <el-image
                    :src="getDocumentByType('examination_report')?.fileUrl"
                    :preview-src-list="[getDocumentByType('examination_report')?.fileUrl].filter(Boolean)"
                    fit="cover"
                    class="document-image"
                  />
                  <div class="file-info">
                    <div class="file-name">{{ getDocumentByType('examination_report')?.originalName }}</div>
                    <div class="file-size">{{ formatFileSize(getDocumentByType('examination_report')?.fileSize || 0) }}</div>
                  </div>
                </div>
                <div v-else class="no-file">未上传</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 银行卡资料 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="document-card">
          <template #header>
            <div class="card-header">
              <span>银行卡资料</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="document-item">
                <div class="document-label">银行卡正面</div>
                <div class="document-content">
                  <div v-if="application.bankCardFrontPath" class="file-item">
                    <el-image
                      :src="application.bankCardFrontPath"
                      :preview-src-list="[application.bankCardFrontPath]"
                      fit="cover"
                      class="document-image"
                    />
                    <div class="file-info">
                      <div class="file-name">银行卡正面.jpg</div>
                    </div>
                  </div>
                  <div v-else class="no-file">未上传</div>
                </div>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="document-item">
                <div class="document-label">银行卡背面</div>
                <div class="document-content">
                  <div v-if="application.bankCardBackPath" class="file-item">
                    <el-image
                      :src="application.bankCardBackPath"
                      :preview-src-list="[application.bankCardBackPath]"
                      fit="cover"
                      class="document-image"
                    />
                    <div class="file-info">
                      <div class="file-name">银行卡背面.jpg</div>
                    </div>
                  </div>
                  <div v-else class="no-file">未上传</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 文件列表 -->
    <el-row style="margin-top: 20px;" v-if="documentFiles.length > 0">
      <el-col :span="24">
        <el-card class="document-card">
          <template #header>
            <div class="card-header">
              <span>所有上传文件</span>
            </div>
          </template>
          
          <el-table :data="documentFiles" stripe>
            <el-table-column prop="originalName" label="文件名" />
            <el-table-column prop="fileType" label="文件类型" width="120">
              <template #default="{ row }">
                {{ getFileTypeText(row.fileType) }}
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
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="previewFile(row)"
                >
                  预览
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DocumentFile {
  id: number
  fileType: string
  originalName: string
  fileUrl: string
  fileSize: number
  createdAt: string
}

interface Application {
  files?: DocumentFile[]
  bankCardFrontPath?: string
  bankCardBackPath?: string
}

interface Props {
  application: Application
}

const props = defineProps<Props>()

// 假设文件数据在 application.files 中
const documentFiles = computed(() => {
  return props.application.files || []
})

const getDocumentByType = (fileType: string): DocumentFile | undefined => {
  return documentFiles.value.find((file: DocumentFile) => file.fileType === fileType)
}

const getFileTypeText = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    'id_card_front': '身份证人像面',
    'id_card_back': '身份证国徽面',
    'medical_record': '就诊病历',
    'examination_report': '检查报告',
    'medical_report': '医疗报告',
    'medical_invoice': '医疗发票及费用清单',
    'transport_invoice': '交通发票',
    'accommodation_invoice': '住宿发票',
    'bank_card_front': '银行卡正面',
    'bank_card_back': '银行卡背面',
    'guardian_relationship_proof': '监护关系证明',
    'signature': '申请人签名'
  }
  return typeMap[fileType] || fileType
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

const previewFile = (file: DocumentFile) => {
  if (file.fileUrl) {
    window.open(file.fileUrl, '_blank')
  }
}
</script>

<style scoped>
.application-documents {
  padding: 10px 0;
}

.document-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.document-section {
  padding: 10px 0;
}

.document-item {
  margin-bottom: 20px;
}

.document-label {
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
}

.document-content {
  min-height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.document-image {
  width: 100px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.no-file {
  color: #c0c4cc;
  font-size: 14px;
}

:deep(.el-image__error) {
  font-size: 12px;
}
</style>
