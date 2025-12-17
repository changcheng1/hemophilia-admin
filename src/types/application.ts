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
  /** 待审核 */
  PENDING_INITIAL = 'pending_initial',
  /** 初审存疑 */
  UNDER_REVIEW = 'under_review',
  /** 初审通过 */
  INITIAL_APPROVED = 'initial_approved',
  /** 审核通过 */
  FINAL_APPROVED = 'final_approved',
  /** 审核退回 */
  REJECTED = 'rejected',
}

// 状态标签映射
export const ApplicationStatusLabels = {
  [ApplicationStatus.PENDING_INITIAL]: '待审核',
  [ApplicationStatus.UNDER_REVIEW]: '初审存疑',
  [ApplicationStatus.INITIAL_APPROVED]: '初审通过',
  [ApplicationStatus.FINAL_APPROVED]: '审核通过',
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
  MEDICAL_INVOICE = 'medical_invoice',
  MEDICAL_REPORT = 'medical_report',
}
