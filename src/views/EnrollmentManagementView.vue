<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { enrollmentAPI, type EnrollmentListItem } from '@/api/enrollment'
import { normalizeFileUrl } from '@/utils/fileHandler'

const loading = ref(false)
const rows = ref<EnrollmentListItem[]>([])
const total = ref(0)
const detailVisible = ref(false)
const reviewVisible = ref(false)
const current = ref<any>(null)
const reviewResult = ref<'approve' | 'reject'>('approve')
const reviewComment = ref('')
const query = reactive({
  donationProject: '', phone: '', recipientName: '', idNumber: '', status: '',
  dateRange: [] as string[], page: 1, limit: 10,
})

const statusLabel: Record<string, string> = {
  pending_review: '待审核', approved: '审核通过', rejected: '初审驳回',
}
const statusType: Record<string, 'warning' | 'success' | 'danger'> = {
  pending_review: 'warning', approved: 'success', rejected: 'danger',
}
const fileTypeLabel: Record<string, string> = {
  id_card_front: '身份证人像面',
  id_card_back: '身份证国徽面',
  medical_report: '确诊报告和诊断证明',
  bank_card_front: '银行卡正面',
  bank_card_back: '银行卡反面',
  guardian_relationship_proof: '监护人关系证明',
}
const detailFiles = computed(() => (current.value?.files || []).map((file: any) => {
  const url = normalizeFileUrl(file.url || file.fileUrl || file.path)
  const name = String(file.originalName || file.filename || '未命名材料')
  const mimetype = String(file.mimetype || '')
  const isImage = mimetype.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)
  return {
    ...file,
    name,
    url,
    label: fileTypeLabel[file.fileType] || '其他材料',
    isImage,
  }
}))
const previewImageUrls = computed(() => detailFiles.value
  .filter((file: any) => file.isImage && file.url)
  .map((file: any) => file.url))

const load = async () => {
  loading.value = true
  try {
    const result = await enrollmentAPI.search({
      donationProject: query.donationProject,
      phone: query.phone,
      recipientName: query.recipientName,
      idNumber: query.idNumber,
      status: query.status as any,
      startDate: query.dateRange?.[0],
      endDate: query.dateRange?.[1],
      page: query.page,
      limit: query.limit,
    })
    rows.value = result.data || []
    total.value = result.total || 0
  } finally { loading.value = false }
}

const reset = () => {
  Object.assign(query, { donationProject: '', phone: '', recipientName: '', idNumber: '', status: '', dateRange: [], page: 1 })
  void load()
}
const showDetail = async (row: EnrollmentListItem) => {
  current.value = await enrollmentAPI.getDetail(row.id)
  detailVisible.value = true
}
const showReview = async (row: EnrollmentListItem) => {
  // 审核只需要加载当前入组资料，不应触发“查看”详情弹窗。
  current.value = await enrollmentAPI.getDetail(row.id)
  reviewResult.value = 'approve'
  reviewComment.value = ''
  reviewVisible.value = true
}
const submitReview = async () => {
  if (reviewResult.value === 'reject' && !reviewComment.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  await ElMessageBox.confirm(
    reviewResult.value === 'approve' ? '确认审核通过该入组资料？' : '确认驳回该入组资料？',
    '审核确认', { type: 'warning' },
  )
  await enrollmentAPI.review(current.value.id, reviewResult.value, reviewComment.value.trim())
  ElMessage.success('审核已提交')
  reviewVisible.value = false
  await load()
}
const handlePage = (page: number) => { query.page = page; void load() }
const handlePageSize = (limit: number) => {
  query.limit = limit
  query.page = 1
  void load()
}

onMounted(load)
</script>

<template>
  <main class="enrollment-management">
    <el-card class="search-card">
      <el-form :model="query" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6"><el-form-item label="援助项目"><el-input v-model="query.donationProject" placeholder="请输入" clearable /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="手机号码"><el-input v-model="query.phone" placeholder="请输入" clearable /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="患者姓名"><el-input v-model="query.recipientName" placeholder="请输入" clearable /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="证件号码"><el-input v-model="query.idNumber" placeholder="请输入" clearable /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6"><el-form-item label="状态"><el-select v-model="query.status" placeholder="请选择" clearable style="width: 100%"><el-option label="待审核" value="pending_review" /><el-option label="审核通过" value="approved" /><el-option label="初审驳回" value="rejected" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="申请日期"><el-date-picker v-model="query.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="～" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row><el-col :span="24" class="search-buttons"><el-button type="primary" @click="query.page = 1; load()">搜索</el-button><el-button @click="reset">重置</el-button></el-col></el-row>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header><div class="card-header"><span>入组列表</span></div></template>
      <el-table :data="rows" v-loading="loading" stripe style="width: 100%" class="enrollment-table">
        <el-table-column prop="donationProject" label="援助项目" min-width="180" show-overflow-tooltip />
        <el-table-column label="手机号" min-width="120"><template #default="{ row }">{{ row.user?.phone || '-' }}</template></el-table-column>
        <el-table-column prop="recipientName" label="患者姓名" min-width="110" />
        <el-table-column prop="idType" label="证件类型" min-width="100" />
        <el-table-column prop="idNumber" label="证件号码" min-width="180" show-overflow-tooltip />
        <el-table-column label="申请状态" min-width="110"><template #default="{ row }"><el-tag :type="statusType[row.status]">{{ statusLabel[row.status] || row.status }}</el-tag></template></el-table-column>
        <el-table-column label="申请时间" min-width="170"><template #default="{ row }">{{ row.submittedAt || row.createdAt }}</template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><div class="action-buttons"><el-button type="info" size="small" @click="showDetail(row)">查看</el-button><el-button v-if="row.status === 'pending_review'" type="primary" size="small" @click="showReview(row)">审核</el-button></div></template></el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="query.page" v-model:page-size="query.limit" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handlePageSize" @current-change="handlePage" /></div>
    </el-card>

    <el-dialog v-model="detailVisible" title="入组资料详情" width="900px" class="enrollment-detail-dialog">
      <div v-if="current" class="enrollment-detail">
        <section class="detail-section">
          <h3>入组信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="入组编号">{{ current.enrollmentNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态"><el-tag :type="statusType[current.status]">{{ statusLabel[current.status] || current.status }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="援助项目">{{ current.projectName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ current.user?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="患者姓名">{{ current.recipientName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="证件号码">{{ current.idNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ current.submittedAt || current.createdAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ current.reviewedAt || '-' }}</el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <h3>就医与支付信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="就诊区域">{{ current.treatmentArea || current.treatmentLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="发生时间">{{ current.occurrenceDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="银行账户名">{{ current.bankAccountName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="银行卡号">{{ current.bankAccountNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开户银行">{{ current.bankName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开户地区">{{ current.bankLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审核意见" :span="2">{{ current.reviewComment || '-' }}</el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <h3>上传材料</h3>
          <el-empty v-if="!detailFiles.length" description="暂无上传材料" :image-size="72" />
          <div v-else class="file-grid">
            <article v-for="file in detailFiles" :key="file.id" class="file-card">
              <div class="file-label">{{ file.label }}</div>
              <el-image
                v-if="file.isImage && file.url"
                :src="file.url"
                :preview-src-list="previewImageUrls"
                :initial-index="previewImageUrls.indexOf(file.url)"
                fit="cover"
                class="file-image"
                preview-teleported
              >
                <template #error><div class="file-image-error">图片加载失败</div></template>
              </el-image>
              <a v-else-if="file.url" :href="file.url" target="_blank" rel="noopener" class="file-link">打开文件</a>
              <div v-else class="file-image-error">文件地址不可用</div>
              <div class="file-name" :title="file.name">{{ file.name }}</div>
            </article>
          </div>
        </section>
      </div>
    </el-dialog>

    <el-dialog v-model="reviewVisible" title="入组审核" width="480px">
      <el-radio-group v-model="reviewResult"><el-radio value="approve">审核通过</el-radio><el-radio value="reject">初审驳回</el-radio></el-radio-group>
      <el-input v-model="reviewComment" :placeholder="reviewResult === 'reject' ? '请填写驳回原因（必填）' : '可填写审核意见'" type="textarea" :rows="4" class="review-comment" />
      <template #footer><el-button @click="reviewVisible = false">取消</el-button><el-button type="primary" @click="submitReview">确认</el-button></template>
    </el-dialog>
  </main>
</template>

<style scoped>
.search-card { margin-bottom: 20px; }
.search-form { padding: 10px 0; }
.search-buttons { margin-top: 10px; text-align: right; }
.list-card { margin-bottom: 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.enrollment-table { font-size: 14px; }
.action-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.action-buttons .el-button { margin: 0; }
.pagination-container { display: flex; justify-content: center; margin-top: 20px; }
.review-comment { margin-top: 20px; }
.detail-section + .detail-section { margin-top: 24px; }
.detail-section h3 { margin: 0 0 12px; font-size: 15px; color: #303133; }
.file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
.file-card { min-width: 0; padding: 12px; border: 1px solid #ebeef5; border-radius: 8px; background: #fafafa; }
.file-label { margin-bottom: 8px; color: #606266; font-size: 13px; }
.file-image { display: block; width: 100%; height: 120px; border-radius: 4px; cursor: zoom-in; }
.file-image-error { display: flex; width: 100%; height: 120px; align-items: center; justify-content: center; color: #909399; background: #f4f4f5; font-size: 12px; }
.file-name { margin-top: 8px; overflow: hidden; color: #606266; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.file-link { display: flex; height: 120px; align-items: center; justify-content: center; color: #409eff; background: #ecf5ff; border-radius: 4px; text-decoration: none; }
:deep(.el-table) { font-size: 14px; }
:deep(.el-table .cell) { padding: 8px 12px; }
:deep(.el-form-item) { margin-bottom: 16px; width: 100%; }
:deep(.el-form-item__content) { flex: 1; min-width: 0; }
:deep(.el-form-item__label) { color: #606266; font-weight: 500; }
</style>
