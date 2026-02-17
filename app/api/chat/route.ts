/**
 * RAG Chat API
 * Handles question answering using vector search and GPT-4o-mini
 * Optimized for 100 queries/minute and 50 concurrent users
 */

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import {
  generateEmbedding,
  generateChatResponse,
  RAG_SYSTEM_PROMPT,
  createRAGPrompt,
  searchChunks,
  assembleContext,
  checkRateLimit,
  getCachedResponse,
  cacheResponse,
  trackAnalytics,
  hashQuestion,
  getRedis,
} from "@/lib/services"

// Media keywords that trigger media search
const MEDIA_KEYWORDS = [
  "show", "see", "picture", "photo", "image", "video", "demo", "screenshot",
  "portfolio", "visual", "project", "work", "example", "sample", "dashboard",
  "certificate", "certification", "proof", "evidence"
]

// Check if question is asking for media
function isAskingForMedia(question: string): boolean {
  const lowerQ = question.toLowerCase()
  return MEDIA_KEYWORDS.some(keyword => lowerQ.includes(keyword))
}

// Search media items by tags/title/description
async function searchRelevantMedia(question: string): Promise<Array<{
  id: string
  url: string
  type: "image" | "video"
  title: string
  description: string
}>> {
  try {
    const redis = getRedis()
    const mediaIds = await redis.smembers("media:items")
    
    if (!mediaIds || mediaIds.length === 0) return []
    
    const pipeline = redis.pipeline()
    for (const id of mediaIds) {
      pipeline.hgetall(`media:${id}`)
    }
    
    const results = await pipeline.exec()
    const allMedia = results.filter((item): item is any => item !== null && typeof item === "object")
    
    // Score media items based on keyword matches
    const questionWords = question.toLowerCase().split(/\s+/)
    const scoredMedia = allMedia.map(item => {
      let score = 0
      const title = (item.title || "").toLowerCase()
      const description = (item.description || "").toLowerCase()
      const tags = typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags || []
      
      for (const word of questionWords) {
        if (word.length < 3) continue
        if (title.includes(word)) score += 3
        if (description.includes(word)) score += 2
        if (tags.some((t: string) => t.toLowerCase().includes(word))) score += 4
      }
      
      return { ...item, score, tags }
    })
    
    // Return top 3 relevant media items
    return scoredMedia
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        url: m.url,
        type: m.type as "image" | "video",
        title: m.title,
        description: m.description,
      }))
  } catch {
    return []
  }
}

// Content moderation - check for inappropriate content
function moderateContent(text: string): { safe: boolean; reason?: string } {
  const inappropriatePatterns = [
    /\b(hack|exploit|attack|malicious|inject)\b/i,
    /\b(porn|xxx|nude|sexual)\b/i,
    /\b(kill|murder|violence|weapon)\b/i,
  ]

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: "inappropriate content" }
    }
  }

  if (text.length > 1000) {
    return { safe: false, reason: "question too long" }
  }

  return { safe: true }
}

// Sanitize input
function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .substring(0, 500)
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown"

    const body = await request.json()
    const { question, visitorName, visitorCompany, sessionId } = body

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Sanitize and moderate
    const sanitizedQuestion = sanitizeInput(question)
    const moderation = moderateContent(sanitizedQuestion)

    if (!moderation.safe) {
      return NextResponse.json({
        response:
          "I can only answer professional questions about Yash's career. Please ask something related to his work experience or skills.",
        blocked: true,
      })
    }

    // Rate limiting (100 requests per minute per IP)
    const rateLimit = await checkRateLimit(ip, 100, 60)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        response: "You've sent too many requests. Please wait a moment and try again.",
        rateLimited: true,
        resetIn: rateLimit.resetIn,
      })
    }

    // Check cache for repeated questions
    const cached = await getCachedResponse(sanitizedQuestion)
    if (cached) {
      await trackAnalytics({
        type: "chat",
        question: sanitizedQuestion,
        visitorName,
        visitorCompany,
        responseTime: Date.now() - startTime,
        chunksUsed: 0,
      })

      return NextResponse.json({
        response: cached,
        cached: true,
      })
    }

    // Log vector index info for debugging
    try {
      const { getVectorIndex } = await import("@/lib/services/vector")
      const idx = getVectorIndex()
      const info = await idx.info()
      console.log("[v0] Vector index info:", JSON.stringify(info))
    } catch (e) {
      console.log("[v0] Failed to get index info:", e instanceof Error ? e.message : e)
    }

    // Generate embedding for the question
    console.log("[v0] Generating embedding for question:", sanitizedQuestion.substring(0, 50))
    const queryEmbedding = await generateEmbedding(sanitizedQuestion)
    console.log("[v0] Embedding generated, length:", queryEmbedding.length)

    // Search for relevant chunks (top 5)
    const searchResults = await searchChunks(queryEmbedding, 5)
    console.log("[v0] Search results count:", searchResults.length)
    if (searchResults.length > 0) {
      console.log("[v0] Top result score:", searchResults[0].score, "source:", searchResults[0].sourceFile)
    }

    // Assemble context (max 2200 tokens)
    const context = assembleContext(
      searchResults.map((r) => ({ content: r.content, score: r.score })),
      2200
    )
    console.log("[v0] Assembled context length:", context?.length || 0)

    if (!context) {
      return NextResponse.json({
        response:
          "I don't have enough information to answer that question. Please try asking about Yash's projects, skills, or experiences.",
        noContext: true,
      })
    }

    // Generate response using GPT-4o-mini
    const userPrompt = createRAGPrompt(sanitizedQuestion, context, visitorName)
    const response = await generateChatResponse(RAG_SYSTEM_PROMPT, userPrompt)

    // Search for relevant media if question asks for visuals
    let media: Array<{id: string, url: string, type: "image" | "video", title: string, description: string}> = []
    if (isAskingForMedia(sanitizedQuestion)) {
      media = await searchRelevantMedia(sanitizedQuestion)
    }

    // Cache the response
    await cacheResponse(sanitizedQuestion, response)

    // Track analytics - await to ensure it completes
    console.log("[v0] About to track analytics for question:", sanitizedQuestion.substring(0, 50))
    await trackAnalytics({
      type: "chat",
      question: sanitizedQuestion,
      visitorName,
      visitorCompany,
      responseTime: Date.now() - startTime,
      chunksUsed: searchResults.length,
    })
    console.log("[v0] Analytics tracking completed")

    return NextResponse.json({
      response,
      chunksUsed: searchResults.length,
      media: media.length > 0 ? media : undefined,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error instanceof Error ? error.message : error)
    console.error("[v0] Chat API error stack:", error instanceof Error ? error.stack : "no stack")
    return NextResponse.json(
      { error: "Failed to process your question. Please try again.", debug: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
