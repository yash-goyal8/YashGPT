/**
 * OpenAI Service
 * Handles embeddings and LLM generation using OpenAI API directly
 */

import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuration
const CONFIG = {
  embedding: {
    model: "text-embedding-3-small" as const,
    dimensions: 1536,
  },
  llm: {
    model: "gpt-5-mini" as const,
    temperature: 0.2,
    maxTokens: 1024,
  },
} as const

/**
 * Generate embedding for text using OpenAI text-embedding-3-small
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: CONFIG.embedding.model,
      input: text.trim().substring(0, 8000),
    })
    return response.data[0].embedding
  } catch (error) {
    console.error("[OpenAI] Embedding generation failed:", error)
    throw new Error(`Embedding failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: CONFIG.embedding.model,
      input: texts.map(t => t.trim().substring(0, 8000)),
    })
    return response.data.map(d => d.embedding)
  } catch (error) {
    console.error("[OpenAI] Batch embedding generation failed:", error)
    throw new Error(`Batch embedding failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate chat response using GPT-5-mini
 */
export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: CONFIG.llm.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: CONFIG.llm.temperature,
      max_tokens: CONFIG.llm.maxTokens,
    })
    return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again."
  } catch (error) {
    console.error("[OpenAI] Chat generation failed:", error)
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
