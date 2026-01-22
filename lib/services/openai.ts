/**
 * OpenAI Service
 * Handles embeddings and LLM generation via Vercel AI Gateway
 */

import { generateText, embed } from "ai"

// Configuration
const CONFIG = {
  embedding: {
    model: "openai/text-embedding-3-small",
    dimensions: 1536,
  },
  llm: {
    model: "openai/gpt-5-mini",
    temperature: 0.2,
    maxOutputTokens: 1024,
  },
} as const

/**
 * Generate embedding for text using OpenAI text-embedding-3-small
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log("[v0] Generating embedding for text length:", text.length)
    const { embedding } = await embed({
      model: CONFIG.embedding.model,
      value: text.trim().substring(0, 8000), // OpenAI limit
    })
    console.log("[v0] Embedding generated successfully, dimensions:", embedding.length)
    return embedding
  } catch (error) {
    console.error("[v0] Embedding generation failed:", error)
    throw new Error(`Embedding failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(
    texts.map((text) => generateEmbedding(text))
  )
  return results
}

/**
 * Generate chat response using GPT-5-mini
 */
export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    console.log("[v0] Generating chat response...")
    const { text } = await generateText({
      model: CONFIG.llm.model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: CONFIG.llm.temperature,
      maxOutputTokens: CONFIG.llm.maxOutputTokens,
    })
    console.log("[v0] Chat response generated successfully")
    return text || "I couldn't generate a response. Please try again."
  } catch (error) {
    console.error("[v0] Chat generation failed:", error)
    throw new Error(`Chat generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * RAG System Prompt - Strict grounding to provided context
 */
export const RAG_SYSTEM_PROMPT = `You are a helpful assistant that answers questions about Yash Goyal based ONLY on the provided context.

STRICT RULES:
1. ONLY use information from the provided context to answer questions
2. If the context doesn't contain relevant information, say "I don't have information about that in my knowledge base"
3. Never make up or infer information not explicitly stated in the context
4. Be conversational but professional
5. Address the recruiter by name when provided
6. Highlight Yash's skills, achievements, and problem-solving abilities when relevant
7. Keep responses concise but informative`

/**
 * Generate RAG user prompt with context
 */
export function createRAGPrompt(
  question: string,
  context: string,
  visitorName?: string
): string {
  const greeting = visitorName ? `The recruiter's name is ${visitorName}. ` : ""
  
  return `${greeting}Based on the following context about Yash Goyal, answer the question.

CONTEXT:
${context}

QUESTION: ${question}

Provide a helpful, accurate response based ONLY on the context above.`
}

export { CONFIG as OPENAI_CONFIG }
