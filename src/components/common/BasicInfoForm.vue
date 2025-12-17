<template>
  <div class="basic-info-form">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><User /></el-icon>
          <span class="header-title">基本信息</span>
        </div>
      </template>

      <div class="basic-form">
        <div class="form-section">
          <h4 class="section-title">申请信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">申请编号</label>
                <div class="info-value">{{ formData.applicationNumber || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">申请状态</label>
                <div class="info-value">
                  <el-tag :type="getStatusType(formData.status)" size="large">
                    {{ getStatusText(formData.status) }}
                  </el-tag>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">捐赠项目</label>
                <div class="info-value">{{ formData.donationProject || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">捐赠期数</label>
                <div class="info-value">{{ formData.donationPeriod || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <h4 class="section-title">受捐人信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">受捐人姓名</label>
                <div class="info-value">{{ formData.recipientName || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">性别</label>
                <div class="info-value">{{ formData.gender || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">证件类型</label>
                <div class="info-value">{{ formData.idType || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">证件号码</label>
                <div class="info-value">{{ formData.idNumber || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">出生日期</label>
                <div class="info-value">{{ formatDate(formData.dateOfBirth) || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">证件有效期</label>
                <div class="info-value">{{ formatDate(formData.idExpiryDate) || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <h4 class="section-title">地址信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">户籍所在地</label>
                <div class="info-value">{{ formData.householdLocation || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">医保所在地</label>
                <div class="info-value">{{ formData.medicalInsuranceLocation || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">就诊地</label>
                <div class="info-value">{{ formData.treatmentLocation || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">常住地址</label>
                <div class="info-value">{{ formData.residenceAddress || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="form-section" v-if="showGuardianInfo && hasGuardianInfo">
          <h4 class="section-title">监护人信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">监护人姓名</label>
                <div class="info-value">{{ formData.guardianName || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">与患者关系</label>
                <div class="info-value">{{ formData.guardianRelationship || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">监护人证件类型</label>
                <div class="info-value">{{ formData.guardianIdType || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">监护人证件号码</label>
                <div class="info-value">{{ formData.guardianIdNumber || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">监护人联系电话</label>
                <div class="info-value">{{ formData.guardianPhone || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">监护人联系地址</label>
                <div class="info-value">{{ formData.guardianAddress || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <h4 class="section-title">银行信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">银行账户名</label>
                <div class="info-value">{{ formData.bankAccountName || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">开户银行</label>
                <div class="info-value">{{ formData.bankName || '-' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">银行账号</label>
                <div class="info-value">{{ formData.bankAccountNumber || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="form-section" v-if="formData.caseDescription">
          <h4 class="section-title">病例描述</h4>
          <div class="info-item">
            <div class="info-value description-text">{{ formData.caseDescription }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'

interface BasicInfoData {
  applicationNumber?: string
  status?: string
  donationProject?: string
  donationPeriod?: string
  recipientName?: string
  gender?: string
  idType?: string
  idNumber?: string
  dateOfBirth?: Date | string
  idExpiryDate?: Date | string
  householdLocation?: string
  medicalInsuranceLocation?: string
  treatmentLocation?: string
  residenceAddress?: string
  guardianName?: string
  guardianRelationship?: string
  guardianIdType?: string
  guardianIdNumber?: string
  guardianPhone?: string
  guardianAddress?: string
  bankAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  caseDescription?: string
}

interface Props {
  modelValue: BasicInfoData
  showGuardianInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showGuardianInfo: true
})

const formData = computed(() => props.modelValue)

// 检查是否有监护人信息
const hasGuardianInfo = computed(() => {
  return !!(formData.value.guardianName || 
           formData.value.guardianRelationship || 
           formData.value.guardianIdType || 
           formData.value.guardianIdNumber || 
           formData.value.guardianPhone || 
           formData.value.guardianAddress)
})

// 状态相关方法
const getStatusType = (status?: string): string => {
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

const getStatusText = (status?: string): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': '待审核',
    'under_review': '初审存疑',
    'initial_approved': '初审通过',
    'final_approved': '审核通过',
    'rejected': '审核退回'
  }
  return statusMap[status || ''] || status || '未知状态'
}

// 格式化日期
const formatDate = (date?: Date | string): string => {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('zh-CN')
  } catch {
    return ''
  }
}
</script>

<style scoped lang="scss">
.basic-info-form {
  .info-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #e4e7ed;
      padding: 16px 20px;
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .header-icon {
      color: #409eff;
      font-size: 18px;
    }

    .header-title {
      font-weight: 600;
      color: #303133;
      font-size: 16px;
    }
  }

  .basic-form {
    .form-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #409eff;
        margin: 0 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e4e7ed;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 40px;
          height: 2px;
          background: #409eff;
        }
      }
    }

    .info-item {
      margin-bottom: 20px;

      .info-label {
        display: block;
        font-weight: 500;
        color: #606266;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .info-value {
        color: #303133;
        font-size: 14px;
        line-height: 1.5;
        min-height: 20px;

        &.description-text {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e4e7ed;
          line-height: 1.6;
        }
      }
    }

    :deep(.el-tag) {
      padding: 8px 16px;
      font-weight: 500;
      border-radius: 20px;
      border: none;

      &.el-tag--warning {
        background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
        color: #d63031;
      }

      &.el-tag--success {
        background: linear-gradient(135deg, #a8e6cf, #81c784);
        color: #2d5016;
      }

      &.el-tag--danger {
        background: linear-gradient(135deg, #fab1a0, #e17055);
        color: #2d3436;
      }

      &.el-tag--info {
        background: linear-gradient(135deg, #a8dadc, #74c0fc);
        color: #1e3a8a;
      }
    }
  }
}
</style>