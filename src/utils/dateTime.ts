const BUSINESS_TIME_ZONE = 'Asia/Shanghai'
const MYSQL_DATETIME_WITHOUT_ZONE =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?$/

const parseBusinessDateTime = (value: string | Date): Date => {
  if (value instanceof Date) return value

  const normalizedValue = value.trim()
  // MySQL DATETIME/TIMESTAMP 的裸字符串没有时区信息，应按业务时区解释，
  // 不能交给浏览器按自身所在时区猜测。
  if (MYSQL_DATETIME_WITHOUT_ZONE.test(normalizedValue)) {
    return new Date(`${normalizedValue.replace(' ', 'T')}+08:00`)
  }

  return new Date(normalizedValue)
}

/** 将接口时间统一显示为中国业务时区，避免浏览器时区和 ISO 原始格式影响展示。 */
export const formatBusinessDateTime = (value?: string | Date | null): string => {
  if (!value) return '-'

  const date = parseBusinessDateTime(value)
  if (Number.isNaN(date.getTime())) return '-'

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`
}
