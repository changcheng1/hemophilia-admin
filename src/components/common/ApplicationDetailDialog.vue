<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="1400px"
    top="8vh"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div v-if="applicationDetail" class="application-detail-content">
      <!-- 申请基本信息 -->
      <div class="application-header">
        <h3>{{ applicationDetail.applicationNumber }} - {{ applicationDetail.recipientName }}</h3>
        <el-tag :type="statusType">
          {{ statusText }}
        </el-tag>
      </div>

      <!-- 左右分栏布局 -->
      <div class="content-layout">
        <!-- 左侧：申请信息 -->
        <div class="left-section">
          <h4 class="section-title">申请信息</h4>
          <BasicInfoDisplay
            :model-value="basicInfo"
            :readonly="true"
          />
        </div>

        <!-- 右侧：资料上传和发票上传 -->
        <div class="right-section">
          <el-tabs v-model="activeTab" class="upload-tabs">
            <el-tab-pane v-if="!hideDocuments" label="资料上传" name="documents">
              <FileUploadSection
                :model-value="documents"
                title="申请资料"
                :application-id="applicationDetail.id"
                :readonly="true"
              />
            </el-tab-pane>
            
            <el-tab-pane label="发票上传" name="invoices">
              <InvoiceUploadForm
                :model-value="invoices"
                :application-id="applicationDetail.id"
                :readonly="true"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 审核记录区域（如果提供） -->
      <div v-if="showReviews && reviews" class="review-records-section">
        <div class="section-divider"></div>
        <h4 class="section-title">审核记录</h4>
        <ApplicationReviews
          :reviews="reviews"
          :loading="loadingReviews"
          :show-actions="showReviewActions"
          :application-status="applicationDetail.status"
          @review-submitted="handleReviewSubmitted"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <slot name="footer-actions"></slot>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BasicInfoDisplay from './BasicInfoDisplay.vue'
import FileUploadSection from './FileUploadSection.vue'
import InvoiceUploadForm from './InvoiceUploadForm.vue'
import ApplicationReviews from '../ApplicationReviews.vue'

interface FileItem {
  id?: number
  fileType?: string
  originalName?: string
  url?: string
  size?: number | string
  [key: string]: unknown
}

interface InvoiceFileItem {
  id?: number
  name: string
  url: string
  uid: string
  status: string
  size: number
  fileType: string
  originalName: string
  recognizedAmount: number
  recognizedInvoiceNumber: string
  recognizedInvoiceDate: string
  verificationStatus: string
  verificationMessage: string
}

interface ApplicationDetail {
  id: number
  applicationNumber: string
  recipientName: string
  status: string
  files?: FileItem[]
  [key: string]: unknown
}

interface Review {
  id: number
  stage: string
  result: string
  comment?: string
  createdAt: string
  reviewer?: {
    id: number
    phone: string
  }
}

interface Props {
  visible: boolean
  title?: string
  applicationDetail: ApplicationDetail | null
  statusType?: string
  statusText?: string
  showReviews?: boolean
  reviews?: Review[]
  loadingReviews?: boolean
  showReviewActions?: boolean
  hideDocuments?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '申请详情',
  statusType: 'info',
  statusText: '',
  showReviews: false,
  reviews: () => [],
  loadingReviews: false,
  showReviewActions: false,
  hideDocuments: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'review-submitted': [result: 'approve' | 'reject', comment: string]
}>()

const activeTab = ref(props.hideDocuments ? 'invoices' : 'documents')

// 基本信息
const basicInfo = computed(() => {
  if (!props.applicationDetail) {
    return {
      applicationNumber: '',
      status: '',
      donationProject: '',
      donationPeriod: '',
      recipientName: '',
      gender: '',
      idType: '',
      idNumber: '',
      dateOfBirth: '',
      householdLocation: '',
      medicalInsuranceLocation: '',
      treatmentLocation: '',
      residenceAddress: '',
      guardianName: '',
      guardianRelationship: '',
      guardianIdType: '',
      guardianIdNumber: '',
      bankAccountName: '',
      bankName: '',
      bankAccountNumber: '',
      caseDescription: ''
    }
  }
  
  const app = props.applicationDetail
  return {
    applicationNumber: String(app.applicationNumber || ''),
    status: String(app.status || ''),
    donationProject: String(app.donationProject || ''),
    donationPeriod: String(app.donationPeriod || ''),
    recipientName: String(app.recipientName || ''),
    gender: String(app.gender || ''),
    idType: String(app.idType || ''),
    idNumber: String(app.idNumber || ''),
    dateOfBirth: String(app.dateOfBirth || ''),
    householdLocation: String(app.householdLocation || ''),
    medicalInsuranceLocation: String(app.medicalInsuranceLocation || ''),
    treatmentLocation: String(app.treatmentLocation || ''),
    residenceAddress: String(app.residenceAddress || ''),
    guardianName: String(app.guardianName || ''),
    guardianRelationship: String(app.guardianRelationship || ''),
    guardianIdType: String(app.guardianIdType || ''),
    guardianIdNumber: String(app.guardianIdNumber || ''),
    bankAccountName: String(app.bankAccountName || ''),
    bankName: String(app.bankName || ''),
    bankAccountNumber: String(app.bankAccountNumber || ''),
    caseDescription: String(app.caseDescription || '')
  }
})

const mapInvoiceFiles = (
  files: FileItem[],
  fileType: string,
  defaultName: string,
): InvoiceFileItem[] =>
  files
    .filter((file: FileItem) => file.fileType === fileType)
    .map((file: FileItem) => ({
      id: file.id,
      name: String(file.originalName || defaultName),
      url: String(file.url || ''),
      uid: String(file.id || Date.now()),
      status: 'success',
      size: Number(file.size) || 0,
      fileType: String(file.fileType || ''),
      originalName: String(file.originalName || ''),
      recognizedAmount: Number((file as Record<string, unknown>).recognizedAmount) || 0,
      recognizedInvoiceNumber: String((file as Record<string, unknown>).recognizedInvoiceNumber || ''),
      recognizedInvoiceDate: String((file as Record<string, unknown>).recognizedInvoiceDate || ''),
      verificationStatus: String((file as Record<string, unknown>).verificationStatus || ''),
      verificationMessage: String((file as Record<string, unknown>).verificationMessage || ''),
    }))

// 文档文件
const documents = computed(() => {
  if (!props.applicationDetail?.files) return []
  
  return props.applicationDetail.files
    .filter((file: FileItem) => 
      file.fileType !== 'transport_invoice' && 
      file.fileType !== 'accommodation_invoice'
    )
    .map((file: FileItem) => ({
      id: Number(file.id) || undefined,
      applicationId: Number(file.applicationId) || undefined,
      fileType: String(file.fileType || ''),
      originalName: String(file.originalName || ''),
      filename: String(file.filename || ''),
      path: String(file.path || ''),
      url: String(file.url || ''),
      mimetype: String(file.mimetype || ''),
      size: String(file.size || ''),
      createdAt: String(file.createdAt || ''),
      recognizedName: String((file as Record<string, unknown>).recognizedName || ''),
      recognizedIdNumber: String((file as Record<string, unknown>).recognizedIdNumber || ''),
      recognizedVisitDate: String((file as Record<string, unknown>).recognizedVisitDate || ''),
      ocrRawText: String((file as Record<string, unknown>).ocrRawText || ''),
      ocrPayload: String((file as Record<string, unknown>).ocrPayload || ''),
      verificationStatus: String((file as Record<string, unknown>).verificationStatus || ''),
      verificationMessage: String((file as Record<string, unknown>).verificationMessage || ''),
      name: String(file.originalName || ''),
      uid: Number(file.id) || Date.now()
    }))
})

// 发票文件
const invoices = computed(() => {
  if (!props.applicationDetail) {
    return {
      totalReimbursementAmount: 0,
      transportInvoiceFiles: [],
      accommodationInvoiceFiles: []
    }
  }
  
  const app = props.applicationDetail
  const files = (app.files || []) as FileItem[]
  const transportFiles = mapInvoiceFiles(files, 'transport_invoice', '交通费发票')
  const accommodationFiles = mapInvoiceFiles(files, 'accommodation_invoice', '住宿费发票')
  
  return {
    applicationId: Number(app.id) || 0,
    totalReimbursementAmount: Number(app.totalReimbursementAmount) || 0,
    transportReimbursementAmount: Number(app.transportReimbursementAmount) || 0,
    accommodationReimbursementAmount: Number(app.accommodationReimbursementAmount) || 0,
    transportInvoiceFiles: transportFiles,
    accommodationInvoiceFiles: accommodationFiles
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleReviewSubmitted = (result: 'approve' | 'reject', comment: string) => {
  emit('review-submitted', result, comment)
}
</script>

<style scoped>
.application-detail-content {
  /* 移除主容器的滚动条 */
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.application-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

/* 左右分栏布局 */
.content-layout {
  display: flex;
  gap: 20px;
  height: 60vh;
}

.left-section {
  flex: 1;
  min-width: 0;
  padding-right: 20px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  max-height: 100%;
}

.right-section {
  flex: 1;
  min-width: 0;
  padding-right: 20px;
  overflow-y: auto;
  max-height: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
}

.upload-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-weight: 500;
    font-size: 15px;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
}

/* 审核记录区域样式 */
.review-records-section {
  margin-top: 24px;
  padding-top: 24px;
}

.section-divider {
  height: 1px;
  background: #ebeef5;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 15px;
}
</style>
