<template>
  <div class="application-basic-info">
    <el-row :gutter="20">
      <!-- 受捐人信息 -->
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>受捐人信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名">
              {{ application.recipientName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ getGenderText(application.gender) }}
            </el-descriptions-item>
            <el-descriptions-item label="出生日期">
              {{ formatDate(application.dateOfBirth) }}
            </el-descriptions-item>
            <el-descriptions-item label="证件类型">
              {{ application.idType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="证件号码">
              {{ application.idNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="证件有效期">
              {{ formatDate(application.idExpiryDate) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 地址信息 -->
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>地址信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="户籍所在地">
              {{ application.householdLocation || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="常住地址">
              {{ application.residenceAddress || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="医保所在地">
              {{ application.medicalInsuranceLocation || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="就诊地">
              {{ application.treatmentLocation || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="受捐者区域">
              {{ application.recipientArea || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址">
              {{ application.detailedAddress || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 监护人信息 -->
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>监护人信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="监护人姓名">
              {{ application.guardianName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="证件类型">
              {{ application.guardianIdType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="证件号码">
              {{ application.guardianIdNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ application.guardianPhone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="与患者关系">
              {{ application.guardianRelationship || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系地址">
              {{ application.guardianAddress || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 申请信息 -->
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>申请信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="申请号">
              {{ application.applicationNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="援助项目">
              {{ application.donationProject || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="援助期数">
              {{ application.donationPeriod || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatDateTime(application.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(application.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请状态">
              <el-tag :type="getStatusType(application.status)">
                {{ getStatusText(application.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 银行信息 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>银行信息</span>
            </div>
          </template>
          
          <el-descriptions :column="3" border>
            <el-descriptions-item label="银行账户名">
              {{ application.bankAccountName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开户银行">
              {{ application.bankName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="银行账号">
              {{ application.bankAccountNumber || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 病例描述 -->
    <el-row style="margin-top: 20px;" v-if="application.caseDescription">
      <el-col :span="24">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>病例描述</span>
            </div>
          </template>
          
          <div class="case-description">
            {{ application.caseDescription }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
interface Application {
  recipientName?: string
  gender?: string
  dateOfBirth?: string
  idType?: string
  idNumber?: string
  idExpiryDate?: string
  householdLocation?: string
  residenceAddress?: string
  medicalInsuranceLocation?: string
  treatmentLocation?: string
  recipientArea?: string
  detailedAddress?: string
  guardianName?: string
  guardianIdType?: string
  guardianIdNumber?: string
  guardianPhone?: string
  guardianRelationship?: string
  guardianAddress?: string
  applicationNumber?: string
  donationProject?: string
  donationPeriod?: string
  createdAt?: string
  updatedAt?: string
  status?: string
  bankAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  caseDescription?: string
}

interface Props {
  application: Application
}

defineProps<Props>()

const getGenderText = (gender: string): string => {
  const genderMap: Record<string, string> = {
    'male': '男',
    'female': '女'
  }
  return genderMap[gender] || '-'
}

const getStatusType = (status: string): string => {
  switch (status) {
    case 'pending_initial':
    case 'under_review':
      return 'warning'
    case 'initial_approved':
    case 'final_approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': '待审核',
    'under_review': '初审存疑',
    'initial_approved': '初审通过',
    'final_approved': '审核通过',
    'rejected': '审核退回'
  }
  return statusMap[status] || '未知状态'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.application-basic-info {
  padding: 10px 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.case-description {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
  white-space: pre-wrap;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  width: 120px;
}

:deep(.el-descriptions__content) {
  color: #303133;
}
</style>