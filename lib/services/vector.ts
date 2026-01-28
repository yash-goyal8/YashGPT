/**
 * Vector Database Service
 * Handles Upstash Vector operations with connection pooling
 * Configured for 1536 dimensions (OpenAI text-embedding-3-small)
 */

import { Index } from "@upstash/vector"

// Singleton instance
let vectorIndex: Index | null = null

/**
 * Get or create vector index instance (singleton)
 */
export function getVectorIndex(): Index {
  if (!vectorIndex) {
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error("Upstash Vector credentials not configured")
    }
    
    vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    })
  }
  return vectorIndex
}

export interface ChunkMetadata {
  content: string
  sourceFile: string
  chunkIndex: number
  tokenCount: number
  createdAt: string
}

export interface SearchResult {
  id: string
  score: number
  content: string
  sourceFile: string
  chunkIndex: number
}

export interface StoredChunk {
  id: string
  content: string
  sourceFile: string
  chunkIndex: number
  tokenCount: number
  createdAt: string
}

/**
 * Store multiple chunks in batch (efficient for bulk operations)
 */
export async function storeChunksBatch(
  chunks: Array<{
    id: string
    embedding: number[]
    metadata: ChunkMetadata
  }>
): Promise<void> {
  const index = getVectorIndex()
  
  // Process in batches of 100 for reliability
  const batchSize = 100
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const vectors = batch.map((chunk) => ({
      id: chunk.id,
      vector: chunk.embedding,
      metadata: chunk.metadata,
    }))
    await index.upsert(vectors)
  }
}

/**
 * Search for similar chunks using cosine similarity
 */
export async function searchChunks(
  queryEmbedding: number[],
  topK: number = 5
): Promise<SearchResult[]> {
  const index = getVectorIndex()
  
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  })

  return results.map((result) => {
    const metadata = result.metadata as ChunkMetadata
    return {
      id: result.id as string,
      score: result.score,
      content: metadata?.content || "",
      sourceFile: metadata?.sourceFile || "",
      chunkIndex: metadata?.chunkIndex || 0,
    }
  })
}

/**
 * Get all stored chunks (for admin view)
 */
export async function getAllChunks(limit = 100): Promise<StoredChunk[]> {
  console.log("[v0] getAllChunks called with limit:", limit)
  const index = getVectorIndex()
  console.log("[v0] Vector index obtained")
  
  const result = await index.range({
    cursor: 0,
    limit,
    includeMetadata: true,
  })
  
  console.log("[v0] Range result vectors count:", result.vectors?.length || 0)
  console.log("[v0] First vector sample:", result.vectors?.[0] ? JSON.stringify(result.vectors[0]).substring(0, 200) : "none")

  return result.vectors.map((vector) => {
    const metadata = vector.metadata as ChunkMetadata
    return {
      id: vector.id as string,
      content: metadata?.content || "",
      sourceFile: metadata?.sourceFile || "",
      chunkIndex: metadata?.chunkIndex || 0,
      tokenCount: metadata?.tokenCount || 0,
      createdAt: metadata?.createdAt || "",
    }
  })
}

/**
 * Delete all chunks (for cleanup)
 */
export async function deleteAllChunks(): Promise<number> {
  const index = getVectorIndex()
  
  const result = await index.range({
    cursor: 0,
    limit: 1000,
    includeMetadata: false,
  })

  if (result.vectors.length === 0) {
    return 0
  }

  const ids = result.vectors.map((v) => v.id as string)
  await index.delete(ids)
  
  return ids.length
}

/**
 * Get chunk count
 */
export async function getChunkCount(): Promise<number> {
  try {
    const index = getVectorIndex()
    const info = await index.info()
    return info.vectorCount || 0
  } catch {
    return 0
  }
}

/**
 * Delete chunks by source file
 */
export async function deleteChunksBySource(sourceFile: string): Promise<number> {
  const index = getVectorIndex()
  
  const result = await index.range({
    cursor: 0,
    limit: 1000,
    includeMetadata: true,
  })

  const idsToDelete = result.vectors
    .filter((v) => (v.metadata as ChunkMetadata)?.sourceFile === sourceFile)
    .map((v) => v.id as string)

  if (idsToDelete.length > 0) {
    await index.delete(idsToDelete)
  }

  return idsToDelete.length
}

/**
 * Delete a single chunk by ID
 */
export async function deleteChunkById(id: string): Promise<boolean> {
  try {
    const index = getVectorIndex()
    await index.delete([id])
    return true
  } catch {
    return false
  }
}
