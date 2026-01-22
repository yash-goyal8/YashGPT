/**
 * Document Processing API
 * Handles chunking, embedding, and storing documents
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 */

import { NextResponse } from "next/server"
import mammoth from "mammoth"
import {
  chunkText,
  generateEmbedding,
  storeChunksBatch,
  getAllChunks,
  deleteAllChunks,
  getChunkCount,
  type ChunkMetadata,
} from "@/lib/services"

interface ProcessRequest {
  documents: Array<{
    name: string
    url: string
  }>
}

/**
 * Extract text from document URL
 */
async function extractText(url: string, filename: string): Promise<string> {
  console.log("[v0] Extracting text from:", url, "filename:", filename)
  
  if (!url) {
    throw new Error("No URL provided for document")
  }

  const response = await fetch(url)
  
  console.log("[v0] Fetch response status:", response.status)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`)
  }
  
  const contentType = response.headers.get("content-type") || ""
  console.log("[v0] Content-Type:", contentType)

  if (filename.endsWith(".txt") || contentType.includes("text/plain")) {
    const text = await response.text()
    console.log("[v0] Extracted text (txt) length:", text.length)
    return text
  }

  if (filename.endsWith(".docx") || contentType.includes("wordprocessingml") || contentType.includes("octet-stream")) {
    const arrayBuffer = await response.arrayBuffer()
    console.log("[v0] ArrayBuffer size:", arrayBuffer.byteLength)
    const result = await mammoth.extractRawText({ arrayBuffer })
    console.log("[v0] Extracted text (docx) length:", result.value.length)
    return result.value
  }

  // Fallback to text
  const text = await response.text()
  console.log("[v0] Extracted text (fallback) length:", text.length)
  return text
}

/**
 * POST - Process documents into chunks and store embeddings
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    console.log("[v0] Raw request body:", JSON.stringify(body))
    
    const documents = body.documents as ProcessRequest["documents"]
    console.log("[v0] Documents array:", JSON.stringify(documents))

    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 })
    }
    
    // Log each document
    documents.forEach((doc, i) => {
      console.log(`[v0] Document ${i}: name="${doc.name}", url="${doc.url}", hasUrl=${!!doc.url}`)
    })

    const results = {
      processed: 0,
      chunks: 0,
      errors: [] as string[],
    }

    for (const doc of documents) {
      try {
        console.log("[v0] Processing document:", JSON.stringify(doc))
        
        if (!doc.url) {
          results.errors.push(`${doc.name}: Could not find file in options`)
          continue
        }
        
        // Extract text
        const text = await extractText(doc.url, doc.name)

        if (!text.trim()) {
          results.errors.push(`${doc.name}: No text content found`)
          continue
        }

        // Chunk the text (200-400 tokens per chunk)
        const chunks = chunkText(text, doc.name)

        if (chunks.length === 0) {
          results.errors.push(`${doc.name}: No chunks generated`)
          continue
        }

        // Generate embeddings and prepare for batch storage
        const chunksWithEmbeddings: Array<{
          id: string
          embedding: number[]
          metadata: ChunkMetadata
        }> = []

        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk.content)
          const id = `${doc.name.replace(/[^a-zA-Z0-9]/g, "-")}-${chunk.index}-${Date.now()}`

          chunksWithEmbeddings.push({
            id,
            embedding,
            metadata: {
              content: chunk.content,
              sourceFile: doc.name,
              chunkIndex: chunk.index,
              tokenCount: chunk.tokenCount,
              createdAt: new Date().toISOString(),
            },
          })
        }

        // Store all chunks in batch
        await storeChunksBatch(chunksWithEmbeddings)

        results.processed++
        results.chunks += chunks.length
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        results.errors.push(`${doc.name}: ${message}`)
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      ...results,
      processingTime,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    )
  }
}

/**
 * GET - Fetch all stored chunks
 */
export async function GET() {
  try {
    const chunks = await getAllChunks(200)
    const count = await getChunkCount()

    return NextResponse.json({
      chunks,
      totalCount: count,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch chunks" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Clear all chunks
 */
export async function DELETE() {
  try {
    const deleted = await deleteAllChunks()
    return NextResponse.json({
      success: true,
      deleted,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete chunks" },
      { status: 500 }
    )
  }
}
