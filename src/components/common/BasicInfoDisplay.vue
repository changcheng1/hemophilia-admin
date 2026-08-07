<template>
  <div class="basic-info-display">
    <!-- 受捐人信息 -->
    <div class="info-section">
      <h3 class="section-title">受捐人信息</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">受捐人姓名</span>
          <span class="info-value">{{ formData.recipientName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">证件类型</span>
          <span class="info-value">{{ formData.idType || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">证件号码</span>
          <span class="info-value">{{ formData.idNumber || '-' }}</span>
        </div>
        <div class="info-item" v-if="formData.gender">
          <span class="info-label">性别</span>
          <span class="info-value">{{ formData.gender || '-' }}</span>
        </div>
        <div class="info-item" v-if="formData.dateOfBirth">
          <span class="info-label">出生日期</span>
          <span class="info-value">{{ formatDate(formData.dateOfBirth) || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">户籍所在地</span>
          <span class="info-value">{{ formData.householdLocation || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">医保所在地</span>
          <span class="info-value">{{ formData.medicalInsuranceLocation || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">就诊地</span>
          <span class="info-value">{{ formData.treatmentLocation || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">常住地址</span>
          <span class="info-value">{{ formData.residenceAddress || '-' }}</span>
          
        </div>
      </div>
    </div>

    <!-- 监护人信息 -->
    <div class="info-section" v-if="hasGuardianInfo">
      <h3 class="section-title">监护人信息</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">和受捐人关系</span>
          <span class="info-value">{{ formData.guardianRelationship || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">监护人姓名</span>
          <span class="info-value">{{ formData.guardianName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">证件类型</span>
          <span class="info-value">{{ formData.guardianIdType || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">证件号码</span>
          <span class="info-value">{{ formData.guardianIdNumber || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 支付信息 -->
    <div class="info-section">
      <h3 class="section-title">支付信息</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">银行账户名</span>
          <span class="info-value">{{ formData.bankAccountName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">开户银行</span>
          <span class="info-value">{{ formData.bankName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">银行账号</span>
          <span class="info-value">{{ formData.bankAccountNumber || '-' }}</span>
        </div>
        <div class="info-item verification-tip">
          <span class="info-label">三要素验证</span>
          <span class="info-value verification-value">{{ threeElementVerificationText }}</span>
        </div>
      </div>
    </div>

    <!-- 申请信息 -->
    <div class="info-section">
      <h3 class="section-title">申请信息</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">申请项目</span>
          <span class="info-value">{{ formData.donationProject || '-' }}</span>
          
        </div>
        <div class="info-item">
          <span class="info-label">申请期数</span>
          <span class="info-value">{{ formData.donationPeriod || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">病例描述</span>
          <span class="info-value">{{ formData.caseDescription || '-' }}</span>
        </div>
        <div class="info-item" v-if="formData.totalReimbursementAmount">
          <span class="info-label">申请总金额</span>
          <span class="info-value">¥{{ formData.totalReimbursementAmount || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getThreeElementVerificationText } from '@/utils/threeElementVerification'

interface FormData {
  // 受捐人信息
  recipientName?: string
  idType?: string
  idNumber?: string
  gender?: string
  dateOfBirth?: string
  householdLocation?: string
  medicalInsuranceLocation?: string
  treatmentLocation?: string
  residenceAddress?: string
  
  // 监护人信息
  guardianRelationship?: string
  guardianName?: string
  guardianIdType?: string
  guardianIdNumber?: string
  
  // 支付信息
  bankAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  threeElementVerified?: boolean | string
  threeElementRequired?: boolean | string
  threeElementVerifiedAt?: string
  threeElementVerificationStatus?: string
  threeElementVerificationMessage?: string
  
  // 申请信息
  applicationNumber?: string
  donationProject?: string
  donationPeriod?: string
  caseDescription?: string
  status?: string
  
  // 发票信息
  totalReimbursementAmount?: string | number
}

interface Props {
  modelValue: FormData
}

const props = defineProps<Props>()

const formData = computed(() => props.modelValue)

const threeElementVerificationText = computed(() =>
  getThreeElementVerificationText(formData.value),
)

// 检查是否有监护人信息
const hasGuardianInfo = computed(() => {
  return !!(formData.value.guardianName || 
           formData.value.guardianRelationship || 
           formData.value.guardianIdType || 
           formData.value.guardianIdNumber)
})

// 格式化日期
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch {
    return dateStr
  }
}
</script>

<style scoped lang="scss">
.basic-info-display {
  background: #fff;
  .info-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
    }

    .info-list {
      .info-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f5f5f5;
        min-height: 48px;
        
        &:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #666;
          font-size: 14px;
          flex-shrink: 0;
          margin-right: 16px;
        }

        .info-value {
          color: #333;
          font-size: 14px;
          flex: 1;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          
          &:empty::after {
            content: '-';
            color: #ccc;
          }
        }

        &.verification-tip {
          .verification-value {
            color: #f56c6c;
            font-weight: 500;
            white-space: normal;
            word-break: break-word;
          }
        }

        .dropdown-icon {
          color: #ccc;
          font-size: 12px;
          margin-left: 8px;
          flex-shrink: 0;
        }

        // 特殊提示信息样式
        &:has(.info-label:contains("不可编辑")),
        &:has(.info-label:contains("必须使用")) {
          .info-label {
            color: #999;
            font-size: 12px;
          }
          
          .info-value {
            color: #999;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .basic-info-display {
    .info-section {
      .info-list {
        .info-item {
          padding: 10px 12px;
          min-height: 44px;
          
          .info-label {
            font-size: 13px;
          }
          
          .info-value {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
