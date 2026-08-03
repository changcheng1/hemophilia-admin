<template>
  <div class="finance-actions">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="操作类型" prop="action">
        <el-select
          v-model="form.action"
          placeholder="请选择操作类型"
          style="width: 100%"
          @change="handleActionChange"
        >
          <el-option
            v-for="action in availableActions"
            :key="action.value"
            :label="action.label"
            :value="action.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item 
        v-if="form.action === FinanceAction.COMPLETE_DISBURSEMENT"
        label="实际金额" 
        prop="amount"
      >
        <el-input-number
          v-model="form.amount"
          :min="0"
          :max="maxAmount || undefined"
          :precision="2"
          placeholder="请输入实际发放金额"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="操作说明" prop="comment">
        <el-input
          v-model="form.comment"
          type="textarea"
          :rows="4"
          placeholder="请输入操作说明"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ getSubmitButtonText() }}
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { FinanceAction, FinanceStatus } from '../types/finance'

interface Props {
  applicationId: number
  currentStatus: FinanceStatus
  applicationAmount?: number
  maxAmount?: number
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { action: FinanceAction; comment: string; amount?: number }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

const form = reactive({
  action: '' as FinanceAction | '',
  comment: '',
  amount: props.applicationAmount || 0
})

// Available actions based on current status
const availableActions = computed(() => {
  const actions: Array<{ label: string; value: FinanceAction }> = []
  
  switch (props.currentStatus) {
    case FinanceStatus.PENDING_DISBURSEMENT:
      actions.push(
        { label: '确认发放', value: FinanceAction.CONFIRM_DISBURSEMENT },
        { label: '发放失败', value: FinanceAction.FAIL_DISBURSEMENT }
      )
      break
    case FinanceStatus.DISBURSEMENT_CONFIRMED:
      actions.push(
        { label: '完成发放', value: FinanceAction.COMPLETE_DISBURSEMENT },
        { label: '发放失败', value: FinanceAction.FAIL_DISBURSEMENT }
      )
      break
    default:
      break
  }
  
  return actions
})

const rules: FormRules = {
  action: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入操作说明', trigger: 'blur' },
    { min: 5, max: 500, message: '操作说明长度在 5 到 500 个字符', trigger: 'blur' }
  ],
  amount: [
    { 
      required: true, 
      message: '请输入实际发放金额', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.action === FinanceAction.COMPLETE_DISBURSEMENT) {
          if (!value || value <= 0) {
            callback(new Error('请输入有效的发放金额'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ]
}

const handleActionChange = () => {
  // Reset amount when action changes
  if (form.action !== FinanceAction.COMPLETE_DISBURSEMENT) {
    form.amount = props.applicationAmount || 0
  }
}

const getSubmitButtonText = (): string => {
  switch (form.action) {
    case FinanceAction.CONFIRM_DISBURSEMENT:
      return '确认发放'
    case FinanceAction.COMPLETE_DISBURSEMENT:
      return '完成发放'
    case FinanceAction.FAIL_DISBURSEMENT:
      return '标记失败'
    default:
      return '提交'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const submitData: { action: FinanceAction; comment: string; amount?: number } = {
      action: form.action as FinanceAction,
      comment: form.comment
    }
    
    if (form.action === FinanceAction.COMPLETE_DISBURSEMENT) {
      submitData.amount = form.amount
    }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Watch for prop changes to update form
watch(() => props.applicationAmount, (newAmount) => {
  if (newAmount && form.action !== FinanceAction.COMPLETE_DISBURSEMENT) {
    form.amount = newAmount
  }
})
</script>

<style scoped>
.finance-actions {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>
