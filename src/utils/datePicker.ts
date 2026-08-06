export const DATE_PICKER_MIN_DATE = new Date(2000, 0, 1)

const BUSINESS_TIME_ZONE = 'Asia/Shanghai'
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})/
const EXPLICIT_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i

const formatDateInBusinessTimeZone = (date: Date) => {
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${values.year}-${values.month}-${values.day}`
}

/**
 * 将接口日期统一为中国时区下的业务日期。
 *
 * 数据库 DATE 在部分部署环境中会被序列化成前一天 16:00:00Z；直接截取
 * ISO 字符串会导致 9 月 30 日回显成 9 月 29 日。
 */
export const normalizeBusinessDate = (value?: string | Date | null) => {
  if (!value) return ''
  if (value instanceof Date) return formatDateInBusinessTimeZone(value)

  const text = String(value).trim()
  if (DATE_ONLY_PATTERN.test(text)) return text

  const datePrefix = text.match(DATE_PREFIX_PATTERN)?.[1] || ''
  if (!EXPLICIT_TIME_ZONE_PATTERN.test(text)) return datePrefix

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? datePrefix : formatDateInBusinessTimeZone(parsed)
}

export const disableBeforeDatePickerMinDate = (date: Date) =>
  date.getTime() < DATE_PICKER_MIN_DATE.getTime()
