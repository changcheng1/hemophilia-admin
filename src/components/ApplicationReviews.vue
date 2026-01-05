<template>
  <div class="application-reviews">
    <!-- 审核记录标题 -->
    <div class="reviews-header">
      <h4 class="reviews-title">审核记录</h4>
    </div>

    <!-- 审核记录表格 -->
    <div v-loading="loading" class="reviews-content">
      <el-table
        :data="reviews"
        stripe
        style="width: 100%"
        class="reviews-table"
        empty-text="暂无审核记录"
        size="small"
      >
        <el-table-column prop="id" label="审核ID" width="80" />
        <el-table-column prop="stage" label="审核阶段" width="100">
          <template #default="{ row }">
            {{ getStageText(row.stage) }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)" size="small">
              {{ getResultText(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="问题记录/退回意见" min-width="200">
          <template #default="{ row }">
            <div class="review-comment">
              {{ row.comment || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="审核人" width="120">
          <template #default="{ row }">
            {{ row.reviewer?.phone || '系统' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="审核时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 审核操作按钮 -->
    <div class="review-actions" v-if="showActions">
      <el-button
        type="danger"
        @click="handleReview('reject')"
        :loading="submitting"
      >
        审核退回
      </el-button>
      <el-button
        type="primary"
        @click="handleReview('approve')"
        :loading="submitting"
      >
        审核通过
      </el-button>
    </div>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewAction === 'approve' ? '审核通过' : '审核退回'"
      width="500px"
      center
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-tag :type="reviewAction === 'approve' ? 'success' : 'danger'">
            {{ reviewAction === 'approve' ? '通过' : '退回' }}
          </el-tag>
        </el-form-item>
        <el-form-item 
          label="审核意见" 
          :required="reviewAction === 'reject'"
        >
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="reviewAction === 'reject' ? '请输入退回理由（必填）' : '请输入审核意见（可选）'"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button
            :type="reviewAction === 'approve' ? 'success' : 'danger'"
            :loading="submitting"
            @click="submitReview"
          >
            确认{{ reviewAction === 'approve' ? '通过' : '退回' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface ReviewRecord {
  id: number
  stage: string
  result: string
  comment?: string
  previousStatus?: string
  newStatus?: string
  createdAt: string
  reviewer?: {
    id: number
    phone: string
  }
}

interface Props {
  reviews: ReviewRecord[]
  loading?: boolean
  showActions?: boolean
  applicationStatus?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showActions: false,
  applicationStatus: ''
})

const emit = defineEmits<{
  reviewSubmitted: [result: 'approve' | 'reject', comment: string]
}>()

const reviewDialogVisible = ref(false)
const submitting = ref(false)
const reviewAction = ref<'approve' | 'reject'>('approve')

const reviewForm = reactive({
  comment: ''
})

// 计算属性
const reviews = computed(() => props.reviews || [])

// 方法
const getStageText = (stage: string): string => {
  const stageMap: Record<string, string> = {
    'initial': '初审',
    'final': '复核',
    'finance': '财务审核'
  }
  return stageMap[stage] || stage
}

const getResultText = (result: string): string => {
  const resultMap: Record<string, string> = {
    'pending_initial': '待审核',
    'initial_approved': '初审通过',
    'under_review': '初审存疑',
    'rejected': '审核退回',
    'final_approved': '审核通过',
    'disbursed': '援助发放'
  }
  return resultMap[result] || result
}

const getResultType = (result: string): string => {
  switch (result) {
    case 'final_approved':
    case 'initial_approved':
    case 'disbursed':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'under_review':
      return 'warning'
    case 'pending_initial':
    default:
      return 'info'
  }
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleReview = (action: 'approve' | 'reject') => {
  reviewAction.value = action
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  // 审核退回时必须填写理由，审核通过时理由可选
  if (reviewAction.value === 'reject' && !reviewForm.comment.trim()) {
    ElMessage.warning('审核退回时必须填写理由')
    return
  }

  submitting.value = true
  try {
    emit('reviewSubmitted', reviewAction.value, reviewForm.comment)
    reviewDialogVisible.value = false
  } catch (error) {
    console.error('Review submission failed:', error)
    ElMessage.error('审核提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.application-reviews {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  margin-top: 20px;
}

.reviews-header {
  margin-bottom: 16px;
}

.reviews-title {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-left: 8px;
  border-left: 4px solid #409eff;
}

.reviews-content {
  margin-bottom: 20px;
}

.reviews-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.review-comment {
  max-width: 300px;
  word-break: break-word;
  line-height: 1.4;
  color: #606266;
}

.review-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table__header) {
  background-color: #f8f9fa;
}

:deep(.el-table__header th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table__row) {
  background-color: #ffffff;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__empty-text) {
  color: #909399;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}
</style>