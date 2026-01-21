interface RateLimitRecord {
  count: number
  resetAt: number
}

const requestCounts = new Map<string, RateLimitRecord>()

// Cleanup expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  // Reset window if expired
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  // Check limit
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Increment
  record.count++
  return { allowed: true, remaining: limit - record.count }
}
