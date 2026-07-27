// Application management related types
export interface ApplicationListItem {
  id: number
  applicationNumber: string
  recipientName: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export enum ApplicationStatus {
  /** 代补全资料 */
  DRAFT = 'draft',
  /** 已提交 */
  SUBMITTED = 'submitted',
  /** 待审核 */
  PENDING_INITIAL = 'pending_initial',
  /** 初审中 */
  INITIAL_REVIEW = 'initial_review',
  /** 初审存疑 */
  UNDER_REVIEW = 'under_review',
  /** 初审通过 */
  INITIAL_APPROVED = 'initial_approved',
  /** 复审中 */
  FINAL_REVIEW = 'final_review',
  /** 审核通过 */
  FINAL_APPROVED = 'final_approved',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 初审退回 */
  INITIAL_REJECTED = 'initial_rejected',
  /** 复审退回 */
  FINAL_REJECTED = 'final_rejected',
  /** 审核退回 */
  REJECTED = 'rejected',
}

// 状态标签映射
export const ApplicationStatusLabels = {
  [ApplicationStatus.DRAFT]: '代补全资料',
  [ApplicationStatus.SUBMITTED]: '已提交',
  [ApplicationStatus.PENDING_INITIAL]: '待审核',
  [ApplicationStatus.INITIAL_REVIEW]: '初审中',
  [ApplicationStatus.UNDER_REVIEW]: '初审存疑',
  [ApplicationStatus.INITIAL_APPROVED]: '初审通过',
  [ApplicationStatus.FINAL_REVIEW]: '复审中',
  [ApplicationStatus.FINAL_APPROVED]: '审核通过',
  [ApplicationStatus.COMPLETED]: '已完成',
  [ApplicationStatus.INITIAL_REJECTED]: '初审退回',
  [ApplicationStatus.FINAL_REJECTED]: '复审退回',
  [ApplicationStatus.REJECTED]: '审核退回',
}

export interface Application {
  id: number
  applicationNumber: string
  userId: number
  recipientName: string
  idType: string
  idNumber: string
  gender: string
  dateOfBirth: string
  status: ApplicationStatus
  reviewHistory: ReviewRecord[]
  files: ApplicationFile[]
  createdAt: string
  updatedAt: string
}

export interface ReviewRecord {
  id: number
  applicationId: number
  reviewerId: number
  reviewerName: string
  action: ReviewAction
  comment: string
  createdAt: string
}

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_MODIFICATION = 'request_modification',
}

export interface ApplicationFile {
  id: number
  applicationId: number
  fileType: FileType
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  uploadedAt: string
}

export enum FileType {
  ID_CARD_FRONT = 'id_card_front',
  ID_CARD_BACK = 'id_card_back',
  MEDICAL_RECORD = 'medical_record',
  MEDICAL_REPORT = 'medical_report',
  MEDICAL_INVOICE = 'medical_invoice',
  TRANSPORT_INVOICE = 'transport_invoice',
  ACCOMMODATION_INVOICE = 'accommodation_invoice',
  BANK_CARD_FRONT = 'bank_card_front',
  BANK_CARD_BACK = 'bank_card_back',
  GUARDIAN_RELATIONSHIP_PROOF = 'guardian_relationship_proof',
  SIGNATURE = 'signature',
}
