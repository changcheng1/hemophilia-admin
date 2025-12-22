<template>
  <div class="application-detail">
    <div class="detail-header">
      <el-button 
        @click="goBack" 
        :icon="ArrowLeft"
        type="default"
      >
        返回列表
      </el-button>
      <h2 v-if="application">申请详情 - {{ application.applicationNumber }}</h2>
    </div>

    <el-card v-loading="loading" class="detail-card">
      <template v-if="application">
        <!-- Basic Information -->
        <div class="info-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请编号">
              {{ application.applicationNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="申请状态">
              <el-tag :type="getStatusType(application.status)">
                {{ getStatusText(application.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="受助人姓名">
              {{ application.recipientName }}
            </el-descriptions-item>
            <el-descriptions-item label="证件类型">
              {{ application.idType }}
            </el-descriptions-item>
            <el-descriptions-item label="证件号码">
              {{ application.idNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ application.gender }}
            </el-descriptions-item>
            <el-descriptions-item label="出生日期">
              {{ formatDate(application.dateOfBirth) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatDate(application.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Application Files -->
        <ApplicationFiles :files="application.files" />

        <!-- Review History -->
        <div v-if="application.reviewHistory.length > 0" class="info-section">
          <h3>审核历史</h3>
          <el-timeline>
            <el-timeline-item
              v-for="record in application.reviewHistory"
              :key="record.id"
              :timestamp="formatDate(record.createdAt)"
              placement="top"
            >
              <el-card>
                <div class="review-record">
                  <div class="record-header">
                    <span class="reviewer">{{ record.reviewerName }}</span>
                    <el-tag :type="getActionType(record.action)">
                      {{ getActionText(record.action) }}
                    </el-tag>
                  </div>
                  <p class="record-comment">{{ record.comment }}</p>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- Review Actions (only show if user can review) -->
        <ReviewActions
          v-if="canReview && reviewType === 'initial'"
          :application-id="application.id"
          :loading="submitting"
          @submit="handleReviewSubmit"
        />
        
        <!-- Final Review Actions -->
        <FinalReviewActions
          v-if="canReview && reviewType === 'final'"
          :application-id="application.id"
          :loading="submitting"
          @submit="handleFinalReviewSubmit"
        />
      </template>

      <el-empty v-else-if="!loading" description="未找到申请信息" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useApplicationStore } from '@/stores/application'
import { useAuthStore } from '@/stores/auth'
import ApplicationFiles from '@/components/ApplicationFiles.vue'
import ReviewActions from '@/components/ReviewActions.vue'
import FinalReviewActions from '@/components/FinalReviewActions.vue'
import { ApplicationStatus, ReviewAction } from '@/types/application'
import { UserRole } from '@/types/auth'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)

const application = computed(() => applicationStore.currentApplication)

const canReview = computed(() => {
  if (!authStore.user || !application.value) return false
  
  const userRole = authStore.user.role
  const appStatus = application.value.status
  
  // Initial reviewers can review applications in submitted/initial_review status
  const canInitialReview = (
    (userRole === UserRole.ADMIN || 
     userRole === UserRole.BUSINESS_MANAGER || 
     userRole === UserRole.INITIAL_REVIEWER) &&
    (appStatus === ApplicationStatus.SUBMITTED || 
     appStatus === ApplicationStatus.INITIAL_REVIEW)
  )

  // Final reviewers can review applications in initial_approved/final_review status
  const canFinalReview = (
    (userRole === UserRole.ADMIN || 
     userRole === UserRole.BUSINESS_MANAGER || 
     userRole === UserRole.FINAL_REVIEWER) &&
    (appStatus === ApplicationStatus.INITIAL_APPROVED || 
     appStatus === ApplicationStatus.FINAL_REVIEW)
  )

  return canInitialReview || canFinalReview
})

const reviewType = computed(() => {
  if (!authStore.user || !application.value) return 'initial'
  
  const userRole = authStore.user.role
  const appStatus = application.value.status
  
  // Determine if this should be final review
  const isFinalReview = (
    (userRole === UserRole.ADMIN || 
     userRole === UserRole.BUSINESS_MANAGER || 
     userRole === UserRole.FINAL_REVIEWER) &&
    (appStatus === ApplicationStatus.INITIAL_APPROVED || 
     appStatus === ApplicationStatus.FINAL_REVIEW)
  )

  return isFinalReview ? 'final' : 'initial'
})

const getStatusType = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.DRAFT:
      return 'info'
    case ApplicationStatus.SUBMITTED:
    case ApplicationStatus.INITIAL_REVIEW:
      return 'warning'
    case ApplicationStatus.INITIAL_APPROVED:
    case ApplicationStatus.FINAL_APPROVED:
    case ApplicationStatus.COMPLETED:
      return 'success'
    case ApplicationStatus.INITIAL_REJECTED:
    case ApplicationStatus.FINAL_REJECTED:
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: ApplicationStatus): string => {
  const statusMap: Record<ApplicationStatus, string> = {
    [ApplicationStatus.PENDING_INITIAL]: '待审核',
    [ApplicationStatus.INITIAL_APPROVED]: '初审通过',
    [ApplicationStatus.UNDER_REVIEW]: '初审存疑',
    [ApplicationStatus.REJECTED]: '审核退回',
    [ApplicationStatus.FINAL_APPROVED]: '审核通过',
    [ApplicationStatus.DRAFT]: '草稿',
    [ApplicationStatus.SUBMITTED]: '已提交',
    [ApplicationStatus.INITIAL_REVIEW]: '初审中',
    [ApplicationStatus.INITIAL_REJECTED]: '初审拒绝',
    [ApplicationStatus.FINAL_REVIEW]: '复审中',
    [ApplicationStatus.FINAL_REJECTED]: '复审拒绝',
    [ApplicationStatus.COMPLETED]: '已完成'
  }
  return statusMap[status] || '未知状态'
}

const getActionType = (action: ReviewAction): string => {
  switch (action) {
    case ReviewAction.APPROVE:
      return 'success'
    case ReviewAction.REJECT:
      return 'danger'
    case ReviewAction.REQUEST_MODIFICATION:
      return 'warning'
    default:
      return 'info'
  }
}

const getActionText = (action: ReviewAction): string => {
  const actionMap = {
    [ReviewAction.APPROVE]: '通过',
    [ReviewAction.REJECT]: '拒绝',
    [ReviewAction.REQUEST_MODIFICATION]: '退回修改'
  }
  return actionMap[action] || '未知操作'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleReviewSubmit = async (data: { action: ReviewAction; comment: string }) => {
  if (!application.value) return
  
  submitting.value = true
  try {
    await applicationStore.submitReview(application.value.id, data.action, data.comment)
    // Refresh application detail to show updated status
    await applicationStore.fetchApplicationDetail(application.value.id)
  } catch (error) {
    console.error('Review submission failed:', error)
  } finally {
    submitting.value = false
  }
}

const handleFinalReviewSubmit = async (data: { action: ReviewAction; comment: string }) => {
  if (!application.value) return
  
  submitting.value = true
  try {
    await applicationStore.submitFinalReview(application.value.id, data.action, data.comment)
    // Refresh application detail to show updated status
    await applicationStore.fetchApplicationDetail(application.value.id)
  } catch (error) {
    console.error('Final review submission failed:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  const from = route.query.from as string
  if (from === 'final-review') {
    router.push('/final-review')
  } else {
    router.push('/initial-review')
  }
}

onMounted(async () => {
  const applicationId = Number(route.params.id)
  if (applicationId) {
    loading.value = true
    try {
      await applicationStore.fetchApplicationDetail(applicationId)
    } catch (error) {
      console.error('Failed to load application detail:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.application-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin: 0;
  color: #303133;
}

.detail-card {
  margin-bottom: 20px;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  margin-bottom: 16px;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.review-record {
  padding: 8px 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: 600;
  color: #303133;
}

.record-comment {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}
</style>