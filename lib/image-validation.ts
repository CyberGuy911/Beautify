export function calculateBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '')

  // Count padding characters
  let padding = 0
  if (cleanBase64.endsWith('==')) padding = 2
  else if (cleanBase64.endsWith('=')) padding = 1

  // Calculate actual byte size
  // Base64: 4 chars = 3 bytes, minus padding
  const sizeInBytes = (cleanBase64.length * 3) / 4 - padding

  return sizeInBytes
}

export function validateBase64Image(base64String: string): {
  valid: boolean
  buffer?: Buffer
  sizeInMB?: number
  error?: string
} {
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

    // Decode to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Check size (4.5MB Vercel limit)
    const sizeInMB = buffer.length / (1024 * 1024)
    if (sizeInMB > 4.5) {
      return {
        valid: false,
        error: `Image exceeds 4.5MB limit (${sizeInMB.toFixed(2)}MB)`
      }
    }

    return { valid: true, buffer, sizeInMB }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid base64 data'
    }
  }
}
