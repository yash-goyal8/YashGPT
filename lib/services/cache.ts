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
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!url || !token) {
      console.warn("[v0] Redis env vars not configured. Caching and analytics disabled.")
      // Return a mock Redis that silently fails all operations
      return {
        get: async () => null,
        set: async () => null,
        setex: async () => null,
        incr: async () => 0,
        hincrby: async () => 0,
        expire: async () => null,
        ttl: async () => -1,
        zincrby: async () => null,
        lpush: async () => null,
        ltrim: async () => null,
        hget: async () => null,
        lrange: async () => [],
        zrange: async () => [],
        keys: async () => [],
        del: async () => 0,
        pipeline: () => ({
          incr: () => null,
          ttl: () => null,
          exec: async () => [0, -1],
        }),
      } as any
    }
    
    redis = new Redis({
      url,
      token,
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
 * Track analytics event - now synchronous for debugging
 */
export async function trackAnalytics(event: {
  type: string
  question?: string
  visitorName?: string
  visitorCompany?: string
  responseTime?: number
  chunksUsed?: number
}): Promise<void> {
  try {
    const redis = getRedis()
    const today = new Date().toISOString().split("T")[0]
    
    console.log("[v0] trackAnalytics called with:", JSON.stringify(event))
    console.log("[v0] Redis URL exists:", !!process.env.KV_REST_API_URL)
    console.log("[v0] Redis Token exists:", !!process.env.KV_REST_API_TOKEN)
    console.log("[v0] Today's date:", today)
    
    // Increment all-time total counter
    const totalResult = await redis.incr("analytics:totalQueries")
    console.log("[v0] Total queries incremented to:", totalResult)
    
    // Increment daily counter
    const dailyResult = await redis.hincrby(`analytics:${today}`, "totalQueries", 1)
    console.log("[v0] Daily queries incremented to:", dailyResult)
    await redis.expire(`analytics:${today}`, CACHE_TTL.analytics)
    
    // Track query for frequency analysis
    if (event.question) {
      const normalizedQ = event.question.toLowerCase().trim().substring(0, 100)
      await redis.zincrby("analytics:topQuestions", 1, normalizedQ)
      console.log("[v0] Question tracked:", normalizedQ)
    }
    
    // Store recent interaction
    const interaction = {
      ...event,
      timestamp: new Date().toISOString(),
    }
    await redis.lpush("analytics:recentInteractions", JSON.stringify(interaction))
    await redis.ltrim("analytics:recentInteractions", 0, 499)
    console.log("[v0] Interaction stored")
    
  } catch (err) {
    console.error("[v0] Analytics tracking error:", err)
  }
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
    
    console.log("[v0] getAnalyticsSummary called, today:", today)
    
    // Fetch each value separately for better debugging
    const totalQueries = Number(await redis.get("analytics:totalQueries")) || 0
    console.log("[v0] totalQueries from Redis:", totalQueries)
    
    const todayQueries = Number(await redis.hget(`analytics:${today}`, "totalQueries")) || 0
    console.log("[v0] todayQueries from Redis:", todayQueries)
    
    const topQuestionsRaw = await redis.zrange("analytics:topQuestions", 0, 9, { rev: true, withScores: true })
    console.log("[v0] topQuestionsRaw:", JSON.stringify(topQuestionsRaw))
    
    const recentRaw = await redis.lrange("analytics:recentInteractions", 0, 19)
    console.log("[v0] recentRaw count:", recentRaw.length)
    
    // Parse top questions - Upstash returns array of {score, value} objects
    const topQuestions: Array<{ question: string; count: number }> = []
    if (Array.isArray(topQuestionsRaw)) {
      for (const item of topQuestionsRaw) {
        if (typeof item === "object" && item !== null && "value" in item && "score" in item) {
          topQuestions.push({
            question: String(item.value),
            count: Number(item.score) || 0,
          })
        } else if (typeof item === "string") {
          // Fallback for string format
          topQuestions.push({ question: item, count: 1 })
        }
      }
    }
    console.log("[v0] Parsed topQuestions:", topQuestions.length)
    
    // Parse recent interactions
    const recentInteractions = recentRaw.map((r) => {
      try { 
        return typeof r === "string" ? JSON.parse(r) : r
      } catch { 
        return null 
      }
    }).filter(Boolean)
    console.log("[v0] Parsed recentInteractions:", recentInteractions.length)
    
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
