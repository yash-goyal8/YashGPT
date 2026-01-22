/**
 * Redis Cache Service
 * High-performance caching for RAG responses and rate limiting
 * Optimized for 100 queries/minute and 50 concurrent users
 */

import { Redis } from "@upstash/redis"

// Singleton instance
let redis: Redis | null = null

/**
 * Get or create Redis instance (singleton)
 */
export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }
  return redis
}

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  response: 3600,        // 1 hour for chat responses
  rateLimit: 60,         // 1 minute for rate limit windows
  analytics: 2592000,    // 30 days for analytics
} as const

/**
 * Generate simple hash for question (for caching)
 */
export function hashQuestion(question: string): string {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, " ")
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get cached response
 */
export async function getCachedResponse(question: string): Promise<string | null> {
  try {
    const redis = getRedis()
    const key = `cache:response:${hashQuestion(question)}`
    return await redis.get<string>(key)
  } catch {
    return null
  }
}

/**
 * Cache a response
 */
export async function cacheResponse(question: string, response: string): Promise<void> {
  try {
    const redis = getRedis()
    const key = `cache:response:${hashQuestion(question)}`
    await redis.setex(key, CACHE_TTL.response, response)
  } catch {
    // Non-critical, ignore
  }
}

/**
 * Rate limiting - Sliding window counter
 * Supports 100 queries/minute per IP and 50 concurrent users
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  try {
    const redis = getRedis()
    const key = `ratelimit:${identifier}`
    
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.ttl(key)
    
    const results = await pipeline.exec()
    const count = results[0] as number
    let ttl = results[1] as number
    
    // Set expiry on first request
    if (ttl === -1) {
      await redis.expire(key, windowSeconds)
      ttl = windowSeconds
    }
    
    const allowed = count <= maxRequests
    const remaining = Math.max(0, maxRequests - count)
    
    return { allowed, remaining, resetIn: ttl }
  } catch {
    // Allow on failure
    return { allowed: true, remaining: -1, resetIn: 0 }
  }
}

/**
 * Track analytics event (fire and forget - non-blocking)
 */
export async function trackAnalytics(event: {
  type: string
  question?: string
  visitorName?: string
  visitorCompany?: string
  responseTime?: number
  chunksUsed?: number
}): Promise<void> {
  // Fire and forget - don't await but log errors
  trackAnalyticsAsync(event).catch((err) => {
    console.error("[v0] Analytics tracking failed:", err)
  })
}

async function trackAnalyticsAsync(event: {
  type: string
  question?: string
  visitorName?: string
  visitorCompany?: string
  responseTime?: number
  chunksUsed?: number
}): Promise<void> {
  const redis = getRedis()
  const today = new Date().toISOString().split("T")[0]
  
  console.log("[v0] Tracking analytics event:", event.type, event.question?.substring(0, 50))
  
  const pipeline = redis.pipeline()
  
  // Increment all-time total counter
  pipeline.incr("analytics:totalQueries")
  
  // Increment daily counter
  pipeline.hincrby(`analytics:${today}`, "totalQueries", 1)
  pipeline.expire(`analytics:${today}`, CACHE_TTL.analytics)
  
  // Track query for frequency analysis
  if (event.question) {
    const normalizedQ = event.question.toLowerCase().trim().substring(0, 100)
    pipeline.zincrby("analytics:topQuestions", 1, normalizedQ)
  }
  
  // Store recent interaction
  const interaction = {
    ...event,
    timestamp: new Date().toISOString(),
  }
  pipeline.lpush("analytics:recentInteractions", JSON.stringify(interaction))
  pipeline.ltrim("analytics:recentInteractions", 0, 499) // Keep last 500
  
  const results = await pipeline.exec()
  console.log("[v0] Analytics pipeline executed, results count:", results.length)
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<{
  totalQueries: number
  todayQueries: number
  topQuestions: Array<{ question: string; count: number }>
  recentInteractions: Array<any>
}> {
  try {
    const redis = getRedis()
    const today = new Date().toISOString().split("T")[0]
    
    const pipeline = redis.pipeline()
    pipeline.get("analytics:totalQueries") // All-time total
    pipeline.hget(`analytics:${today}`, "totalQueries") // Today's count
    pipeline.zrevrange("analytics:topQuestions", 0, 9, { withScores: true })
    pipeline.lrange("analytics:recentInteractions", 0, 19)
    
    const results = await pipeline.exec()
    
    const totalQueries = Number(results[0]) || 0
    const todayQueries = Number(results[1]) || 0
    const topQuestionsRaw = (results[2] as string[]) || []
    const recentRaw = (results[3] as string[]) || []
    
    // Parse top questions
    const topQuestions: Array<{ question: string; count: number }> = []
    for (let i = 0; i < topQuestionsRaw.length; i += 2) {
      topQuestions.push({
        question: topQuestionsRaw[i],
        count: Number(topQuestionsRaw[i + 1]) || 0,
      })
    }
    
    // Parse recent interactions
    const recentInteractions = recentRaw.map((r) => {
      try { return JSON.parse(r) } catch { return null }
    }).filter(Boolean)
    
    return {
      totalQueries,
      todayQueries,
      topQuestions,
      recentInteractions,
    }
  } catch (err) {
    console.error("[v0] Failed to get analytics:", err)
    return {
      totalQueries: 0,
      todayQueries: 0,
      topQuestions: [],
      recentInteractions: [],
    }
  }
}

/**
 * Clear all cache and analytics
 */
export async function clearAllCache(): Promise<number> {
  try {
    const redis = getRedis()
    const patterns = ["cache:*", "ratelimit:*", "analytics:*"]
    let deletedCount = 0
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        deletedCount += keys.length
      }
    }
    
    return deletedCount
  } catch {
    return 0
  }
}
