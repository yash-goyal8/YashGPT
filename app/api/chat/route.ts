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
} from "@/lib/services"

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
      trackAnalytics({
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

    // Generate embedding for the question
    const queryEmbedding = await generateEmbedding(sanitizedQuestion)

    // Search for relevant chunks (top 5)
    const searchResults = await searchChunks(queryEmbedding, 5)

    // Assemble context (max 2200 tokens)
    const context = assembleContext(
      searchResults.map((r) => ({ content: r.content, score: r.score })),
      2200
    )

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

    // Cache the response
    await cacheResponse(sanitizedQuestion, response)

    // Track analytics (fire and forget)
    console.log("[v0] About to track analytics for question:", sanitizedQuestion.substring(0, 50))
    trackAnalytics({
      type: "chat",
      question: sanitizedQuestion,
      visitorName,
      visitorCompany,
      responseTime: Date.now() - startTime,
      chunksUsed: searchResults.length,
    })
    console.log("[v0] Analytics tracking initiated")

    return NextResponse.json({
      response,
      chunksUsed: searchResults.length,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    )
  }
}
