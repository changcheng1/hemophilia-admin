export interface ThreeElementVerificationData {
  threeElementRequired?: boolean | string | null
  threeElementVerified?: boolean | string | null
  threeElementVerificationStatus?: string | null
  threeElementVerificationMessage?: string | null
}

const toOptionalBoolean = (
  value: boolean | string | null | undefined,
): boolean | undefined => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

export const getThreeElementVerificationText = (
  data: ThreeElementVerificationData,
): string => {
  const status = data.threeElementVerificationStatus || ''
  const message = data.threeElementVerificationMessage || ''
  const required = toOptionalBoolean(data.threeElementRequired)
  const verified = toOptionalBoolean(data.threeElementVerified)
  const successful = verified === true || status === 'success'

  if (required === false) return '*未开启银行卡三要素验证'
  if (successful) return message ? `*${message}` : '*三要素验证通过'
  if (status === 'failed') return message ? `*${message}` : '*三要素验证不通过'
  if (required === undefined) return '*历史申请暂无三要素验证记录'
  return message
    ? `*暂未完成银行卡三要素验证：${message}`
    : '*暂未完成银行卡三要素验证'
}
