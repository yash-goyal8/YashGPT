/**
 * Debug endpoint - visit /api/debug in your browser to check the full RAG pipeline status
 */
import { NextResponse } from "next/server"
import { getVectorIndex } from "@/lib/services/vector"
import { generateEmbedding, generateChatResponse } from "@/lib/services/openai"

export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check env vars
  results.envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.substring(0, 8)}...)` : "MISSING",
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL ? `set (${process.env.UPSTASH_VECTOR_REST_URL.substring(0, 30)}...)` : "MISSING",
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN ? "set" : "MISSING",
  }

  // 2. Check vector index
  try {
    const index = getVectorIndex()
    const info = await index.info()
    results.vectorIndex = {
      status: "connected",
      vectorCount: info.vectorCount,
      dimension: info.dimension,
      similarityFunction: info.similarityFunction,
      pendingVectorCount: info.pendingVectorCount,
    }
  } catch (e) {
    results.vectorIndex = { status: "error", error: e instanceof Error ? e.message : String(e) }
  }

  // 3. Check vector range (first 5 vectors)
  try {
    const index = getVectorIndex()
    const range = await index.range({ cursor: 0, limit: 5, includeMetadata: true })
    results.vectorSample = {
      count: range.vectors.length,
      vectors: range.vectors.map(v => ({
        id: v.id,
        hasMetadata: !!v.metadata,
        metadataKeys: v.metadata ? Object.keys(v.metadata) : [],
        contentPreview: (v.metadata as { content?: string })?.content?.substring(0, 100) || "no content",
      })),
    }
  } catch (e) {
    results.vectorSample = { status: "error", error: e instanceof Error ? e.message : String(e) }
  }

  // 4. Test OpenAI embedding
  try {
    const embedding = await generateEmbedding("test embedding")
    results.openaiEmbedding = {
      status: "working",
      dimensions: embedding.length,
    }
  } catch (e) {
    results.openaiEmbedding = { status: "error", error: e instanceof Error ? e.message : String(e) }
  }

  // 5. Test OpenAI chat
  try {
    const response = await generateChatResponse("You are a test bot. Reply with OK.", "Say OK")
    results.openaiChat = {
      status: "working",
      response: response.substring(0, 100),
    }
  } catch (e) {
    results.openaiChat = { status: "error", error: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json(results, { status: 200 })
}
