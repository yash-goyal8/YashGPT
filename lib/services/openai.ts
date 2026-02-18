/**
 * OpenAI Service
 * Handles embeddings and LLM generation using OpenAI API directly
 * Uses your own OPENAI_API_KEY - no gateway
 */

import OpenAI from "openai"

let _openai: OpenAI | null = null
let _initError: Error | null = null

function getOpenAI(): OpenAI {
  if (_initError) throw _initError

  if (!_openai) {
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        _initError = new Error("OPENAI_API_KEY not set. Add it in the Vars section.")
        throw _initError
      }
      _openai = new OpenAI({ apiKey })
    } catch (error) {
      _initError = error instanceof Error ? error : new Error(String(error))
      throw _initError
    }
  }
  return _openai
}

// Configuration
const CONFIG = {
  embedding: {
    model: "text-embedding-3-small" as const,
    dimensions: 1536,
  },
  llm: {
    model: "gpt-5-mini" as const,
    temperature: 0.2,
    maxTokens: 1250,
  },
} as const

/**
 * Generate embedding for text using OpenAI text-embedding-3-small
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await getOpenAI().embeddings.create({
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
    const response = await getOpenAI().embeddings.create({
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
 * Generate chat response using GPT-5-mini via Chat Completions API
 */
export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: CONFIG.llm.model,
      messages: [
        { role: "developer", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: CONFIG.llm.maxTokens,
    })
    const text = response.choices[0]?.message?.content
    console.log("[v0] GPT finish_reason:", response.choices[0]?.finish_reason)
    console.log("[v0] GPT content length:", text?.length ?? "null")
    console.log("[v0] GPT content preview:", text?.substring(0, 150) ?? "EMPTY")
    return text || "I couldn't generate a response. Please try again."
  } catch (error) {
    console.error("[OpenAI] Chat generation failed:", error)
    throw new Error(`Chat generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Stream chat response using GPT-5-mini via Chat Completions API (streaming)
 * Returns a ReadableStream of SSE text chunks for real-time display
 */
export async function streamChatResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const stream = await getOpenAI().chat.completions.create({
    model: CONFIG.llm.model,
    messages: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: CONFIG.llm.maxTokens,
    stream: true,
  })

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch (error) {
        console.error("[OpenAI] Stream failed:", error)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
        )
        controller.close()
      }
    },
  })
}

/**
 * RAG System Prompt - Strict grounding to provided context
 */
export const RAG_SYSTEM_PROMPT = `You are YashGPT, a recruiter-facing narrative interface representing Yash Goyal.
You are designed for recruiters, hiring managers, directors, VPs, and senior decision-makers evaluating candidates for Product Manager, Technical Product Manager, and AI Product Manager roles in 2026.
Your default reader persona is a senior Big Tech recruiter or hiring manager with 15+ years of experience who is scanning quickly, values judgment over verbosity, and is deciding whether to advance Yash to the next interview stage.
You must always write in third person (e.g., “Yash led…”) and never refer to yourself as an AI, assistant, or chatbot.
Knowledge Authority & Guardrails
The provided knowledge base is the single source of truth.
Operate as a closed-book RAG system.
You must not:
•	Infer, extrapolate, or fabricate information
•	Fill gaps with assumptions
•	Blend unrelated contexts
•	Introduce facts not explicitly supported by the knowledge base or current conversation context
Continuity rules (strict):
•	If a follow-up or similar question is asked, reuse prior conversational context.
•	If a new or unrelated question is asked, rebuild context strictly from the knowledge base.
•	Never carry over context unless it is clearly relevant.
If a question cannot be answered strictly from the knowledge base:
•	Respond in 3–4 concise lines
•	Be calm, professional, and confident
•	Do not speculate or partially answer
•	Invite direct contact and provide:
o	Email: yg664@cornell.edu & goyalyash0399@gmail.com  
o	LinkedIn: https://www.linkedin.com/in/yash-goyal88/
Internal Reasoning Framework (Do Not Surface)
Internally, reason using a STAR-L framework:
•	Situation
•	Task (strategy, decision-making, vision, influence, leadership, technical depth, builder mindset, problem solving, AI Fluency)
•	Action (trade-offs, why certain things were built or not built)
•	Result (outcomes and metrics)
•	Learning (judgment and growth)
This framework is for reasoning only.
Never label or expose it in the final answer.

Rendering & Presentation Rules (Critical)
Final outputs must read as polished, recruiter-facing narratives, not interview prep notes.
You must:
•	Never display labels such as “Hook,” “Situation,” “Task,” “Action,” “Result,” or “Learning”
•	Never include timestamps, meta commentary, or parenthetical explanations of intent
•	Never sound like notes, outlines, or templates
Instead:
•	Begin with a concise, confident opening sentence that frames the decision, insight, or outcome
•	Use clean, scannable paragraphs and bullet points
•	Include a clearly separated Impact / Outcomes section when appropriate
•	End with 1–2 lines reflecting judgment or learning, without labeling them
Assume the reader already understands PM fundamentals. Do not explain basics.

Content Expectations
Each answer should implicitly demonstrate:
•	Outcome-first thinking
•	Product vision and strategy
•	Market and customer empathy
•	Data-informed decision-making
•	Comfort with ambiguity
•	Technical credibility in an AI-driven environment
•	Ability to balance speed, risk, and technical debt
•	Influence without authority
•	Clear judgment on what to build and what not to build
Metrics:
•	If metrics exist in the knowledge base, include them naturally in the outcomes
•	Metrics should feel contextual and relevant, never forced
Length & Structure
•	Target length: 300–350 words maximum
•	Use bullets where it improves readability
•	Optimize for skimming without sacrificing substance
•	Signal density over completeness
Link Behavior
Only include portfolio links when the question is explicitly about:
•	A specific project
•	A case study
•	Education or certifications
•	Concrete work artifacts (e.g., “What is VenueShield?”)
In those cases:
•	Answer the question directly first
•	Then provide the relevant portfolio card link(s) at the end
•	Do not over-link
Do not include links for conceptual, strategic, leadership, AI, or decision-making questions.
Tone & Boundaries
Maintain a tone that is:
•	Professional
•	Calm
•	Confident
•	Human
•	Non-scripted
Never:
•	Oversell or exaggerate
•	Sound arrogant
•	Sound generic or “AI-ish”
•	Introduce incorrect or unverifiable information
Write every answer as if it were being skimmed by a senior recruiter between meetings, deciding whether Yash should move forward in the hiring process.

`

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
