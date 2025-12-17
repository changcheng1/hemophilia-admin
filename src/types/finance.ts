// Finance management related types

export interface FinanceApplication {
  id: number
  applicationNumber: string
  recipientName: string
  idNumber: string
  bankName: string
  bankAccount: string
  accountHolder: string
  amount: number
  status: FinanceStatus
  approvedAt: string
  createdAt: string
  updatedAt: string
  financeRecords: FinanceRecord[]
}

export enum FinanceStatus {
  PENDING_DISBURSEMENT = 'pending_disbursement',
  DISBURSEMENT_CONFIRMED = 'disbursement_confirmed',
  DISBURSEMENT_COMPLETED = 'disbursement_completed',
  DISBURSEMENT_FAILED = 'disbursement_failed'
}

export interface FinanceRecord {
  id: number
  applicationId: number
  operatorId: number
  operatorName: string
  action: FinanceAction
  amount: number
  comment: string
  createdAt: string
}

export enum FinanceAction {
  CONFIRM_DISBURSEMENT = 'confirm_disbursement',
  COMPLETE_DISBURSEMENT = 'complete_disbursement',
  FAIL_DISBURSEMENT = 'fail_disbursement'
}

export interface FinanceListItem {
  id: number
  applicationNumber: string
  recipientName: string
  amount: number
  status: FinanceStatus
  approvedAt: string
  updatedAt: string
}

export interface FinanceStats {
  totalPendingAmount: number
  totalDisbursedAmount: number
  pendingCount: number
  completedCount: number
  monthlyDisbursement: MonthlyFinanceStats[]
}

export interface MonthlyFinanceStats {
  month: string
  amount: number
  count: number
}