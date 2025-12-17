<template>
  <div class="review-actions">
    <h3>审核操作</h3>
    <el-form 
      ref="formRef"
      :model="reviewForm" 
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="审核结果" prop="action">
        <el-radio-group v-model="reviewForm.action">
          <el-radio :label="ReviewAction.APPROVE">通过</el-radio>
          <el-radio :label="ReviewAction.REJECT">拒绝</el-radio>
          <el-radio :label="ReviewAction.REQUEST_MODIFICATION">退回修改</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="审核意见" prop="comment">
        <el-input
          v-model="reviewForm.comment"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见..."
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
          提交审核
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ReviewAction } from '@/types/application'

interface Props {
  applicationId: number
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { action: ReviewAction; comment: string }): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

const reviewForm = reactive({
  action: '' as ReviewAction | '',
  comment: ''
})

const rules: FormRules = {
  action: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入审核意见', trigger: 'blur' },
    { min: 5, message: '审核意见至少5个字符', trigger: 'blur' }
  ]
}

const getActionText = (action: ReviewAction): string => {
  switch (action) {
    case ReviewAction.APPROVE:
      return '通过'
    case ReviewAction.REJECT:
      return '拒绝'
    case ReviewAction.REQUEST_MODIFICATION:
      return '退回修改'
    default:
      return ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const actionText = getActionText(reviewForm.action as ReviewAction)
    
    await ElMessageBox.confirm(
      `确认${actionText}此申请吗？`,
      '确认审核',
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

// Expose reset method for parent component
defineExpose({
  reset: handleReset
})
</script>

<style scoped>
.review-actions {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.review-actions h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #495057;
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