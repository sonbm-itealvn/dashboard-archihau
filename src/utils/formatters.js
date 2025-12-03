export function formatDate(value, locale = 'en-US') {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null) {
    return ''
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = Number(bytes)
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return ${size.toFixed(unitIndex === 0 ? 0 : 1)} 
}
