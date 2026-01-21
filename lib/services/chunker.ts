/**
 * Semantic Text Chunker
 * Splits text into meaningful chunks of 200-400 tokens
 * Preserves sentence boundaries and maintains context
 */

// Approximate tokens (1 token ≈ 4 characters for English)
const CHARS_PER_TOKEN = 4
const MIN_CHUNK_TOKENS = 200
const MAX_CHUNK_TOKENS = 400
const OVERLAP_TOKENS = 50

const MIN_CHUNK_CHARS = MIN_CHUNK_TOKENS * CHARS_PER_TOKEN // 800
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN // 1600
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN // 200

export interface Chunk {
  content: string
  index: number
  tokenCount: number
  startChar: number
  endChar: number
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries while keeping the delimiter
  const sentenceRegex = /[^.!?]*[.!?]+[\s]*/g
  const matches = text.match(sentenceRegex) || []
  
  // Handle any remaining text without sentence ending
  const matchedLength = matches.join("").length
  if (matchedLength < text.length) {
    const remainder = text.substring(matchedLength).trim()
    if (remainder) {
      matches.push(remainder)
    }
  }
  
  return matches.filter((s) => s.trim().length > 0)
}

/**
 * Estimate token count from text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Chunk text semantically into 200-400 token segments
 */
export function chunkText(text: string, sourceFile: string): Chunk[] {
  const chunks: Chunk[] = []
  const sentences = splitIntoSentences(text)
  
  if (sentences.length === 0) {
    // Handle case where text has no sentence boundaries
    if (text.trim().length > 0) {
      chunks.push({
        content: text.trim(),
        index: 0,
        tokenCount: estimateTokens(text),
        startChar: 0,
        endChar: text.length,
      })
    }
    return chunks
  }

  let currentChunk: string[] = []
  let currentCharCount = 0
  let chunkStartChar = 0
  let currentPosition = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]
    const sentenceChars = sentence.length

    // If adding this sentence exceeds max, finalize current chunk
    if (currentCharCount + sentenceChars > MAX_CHUNK_CHARS && currentChunk.length > 0) {
      const chunkContent = currentChunk.join("").trim()
      
      if (chunkContent.length >= MIN_CHUNK_CHARS / 2) { // At least half min size
        chunks.push({
          content: chunkContent,
          index: chunks.length,
          tokenCount: estimateTokens(chunkContent),
          startChar: chunkStartChar,
          endChar: currentPosition,
        })
      }

      // Start new chunk with overlap
      const overlapSentences: string[] = []
      let overlapChars = 0
      
      for (let j = currentChunk.length - 1; j >= 0 && overlapChars < OVERLAP_CHARS; j--) {
        overlapSentences.unshift(currentChunk[j])
        overlapChars += currentChunk[j].length
      }

      currentChunk = overlapSentences
      currentCharCount = overlapChars
      chunkStartChar = currentPosition - overlapChars
    }

    currentChunk.push(sentence)
    currentCharCount += sentenceChars
    currentPosition += sentenceChars
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join("").trim()
    if (chunkContent.length > 0) {
      chunks.push({
        content: chunkContent,
        index: chunks.length,
        tokenCount: estimateTokens(chunkContent),
        startChar: chunkStartChar,
        endChar: currentPosition,
      })
    }
  }

  return chunks
}

/**
 * Process multiple documents and return all chunks
 */
export function chunkDocuments(
  documents: Array<{ name: string; content: string }>
): Array<Chunk & { sourceFile: string }> {
  const allChunks: Array<Chunk & { sourceFile: string }> = []

  for (const doc of documents) {
    const chunks = chunkText(doc.content, doc.name)
    for (const chunk of chunks) {
      allChunks.push({
        ...chunk,
        sourceFile: doc.name,
      })
    }
  }

  return allChunks
}

/**
 * Merge chunks for context assembly (respecting token limit)
 */
export function assembleContext(
  chunks: Array<{ content: string; score?: number }>,
  maxTokens: number = 2200
): string {
  const contextParts: string[] = []
  let totalTokens = 0

  for (const chunk of chunks) {
    const chunkTokens = estimateTokens(chunk.content)
    
    if (totalTokens + chunkTokens > maxTokens) {
      break
    }
    
    contextParts.push(chunk.content)
    totalTokens += chunkTokens
  }

  return contextParts.join("\n\n---\n\n")
}
