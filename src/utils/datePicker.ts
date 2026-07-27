export const DATE_PICKER_MIN_DATE = new Date(2000, 0, 1)

export const disableBeforeDatePickerMinDate = (date: Date) =>
  date.getTime() < DATE_PICKER_MIN_DATE.getTime()
