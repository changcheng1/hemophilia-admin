<template>
  <div class="final-review-actions">
    <h3>复核操作</h3>
    
    <!-- Initial Review History Display -->
    <div v-if="initialReviewHistory.length > 0" class="initial-review-section">
      <h4>初审意见</h4>
      <el-card class="review-history-card">
        <div 
          v-for="record in initialReviewHistory" 
          :key="record.id"
          class="review-record"
        >
          <div class="record-header">
            <span class="reviewer">{{ record.reviewerName }}</span>
            <el-tag :type="getActionType(record.action)">
              {{ getActionText(record.action) }}
            </el-tag>
            <span class="record-time">{{ formatDate(record.createdAt) }}</span>
          </div>
          <p class="record-comment">{{ record.comment }}</p>
        </div>
      </el-card>
    </div>

    <el-form 
      ref="formRef"
      :model="reviewForm" 
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="复核结果" prop="action">
        <el-radio-group v-model="reviewForm.action">
          <el-radio :label="ReviewAction.APPROVE">审核通过</el-radio>
          <el-radio :label="ReviewAction.REJECT">审核退回</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="复核意见" prop="comment">
        <el-input
          v-model="reviewForm.comment"
          type="textarea"
          :rows="4"
          placeholder="请输入复核意见..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="loading"
          :disabled="!reviewForm.action"
        >
          提交复核
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ReviewAction } from '@/types/application'
import type { ReviewRecord } from '@/types/application'
import { useApplicationStore } from '@/stores/application'

interface Props {
  applicationId: number
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { action: ReviewAction; comment: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const applicationStore = useApplicationStore()
const formRef = ref<FormInstance>()

const reviewForm = reactive({
  action: '' as ReviewAction | '',
  comment: ''
})

const rules: FormRules = {
  action: [
    { required: true, message: '请选择复核结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入复核意见', trigger: 'blur' },
    { min: 5, message: '复核意见至少5个字符', trigger: 'blur' }
  ]
}

// Get initial review history from current application
const initialReviewHistory = computed(() => {
  if (!applicationStore.currentApplication?.reviewHistory) return []
  
  return applicationStore.currentApplication.reviewHistory.filter(record => 
    record.action === ReviewAction.APPROVE && 
    // Assuming initial review records come before final review
    new Date(record.createdAt) < new Date()
  )
})

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

const getFinalActionText = (action: ReviewAction): string => {
  switch (action) {
    case ReviewAction.APPROVE:
      return '审核通过'
    case ReviewAction.REJECT:
      return '审核退回'
    default:
      return ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const actionText = getFinalActionText(reviewForm.action as ReviewAction)
    
    await ElMessageBox.confirm(
      `确认${actionText}此申请吗？`,
      '确认复核',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    emit('submit', {
      action: reviewForm.action as ReviewAction,
      comment: reviewForm.comment
    })
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Form validation failed:', error)
    }
  }
}

const handleReset = () => {
  reviewForm.action = ''
  reviewForm.comment = ''
  formRef.value?.clearValidate()
}

// Load application detail when component mounts to get review history
onMounted(async () => {
  if (props.applicationId && !applicationStore.currentApplication) {
    try {
      await applicationStore.fetchApplicationDetail(props.applicationId)
    } catch (error) {
      console.error('Failed to load application detail for review history:', error)
    }
  }
})

// Expose reset method for parent component
defineExpose({
  reset: handleReset
})
</script>

<style scoped>
.final-review-actions {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.final-review-actions h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #495057;
}

.initial-review-section {
  margin-bottom: 24px;
}

.initial-review-section h4 {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
}

.review-history-card {
  margin-bottom: 20px;
}

.review-record {
  padding: 12px 0;
}

.review-record:not(:last-child) {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: 600;
  color: #303133;
}

.record-time {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.record-comment {
  margin: 0;
  color: #606266;
  line-height: 1.5;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-radio) {
  margin-right: 0;
}
</style>