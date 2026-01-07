export const buildSerialNumber = (categoryCode) => {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString()
  const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase()
  const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${categoryCode}-${year}-${timestamp}-${randomPart1}${randomPart2}`
}
