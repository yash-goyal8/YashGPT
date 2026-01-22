/**
 * Chunks Management API
 * Handles individual chunk operations
 */

import { NextResponse } from "next/server"
import { deleteChunkById, deleteChunksBySource } from "@/lib/services"

/**
 * DELETE - Delete a single chunk by ID or all chunks from a source file
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chunkId = searchParams.get("id")
    const sourceFile = searchParams.get("source")

    if (chunkId) {
      // Delete single chunk
      const success = await deleteChunkById(chunkId)
      return NextResponse.json({
        success,
        message: success ? "Chunk deleted" : "Failed to delete chunk",
      })
    }

    if (sourceFile) {
      // Delete all chunks from source file
      const count = await deleteChunksBySource(sourceFile)
      return NextResponse.json({
        success: true,
        deleted: count,
        message: `Deleted ${count} chunks from ${sourceFile}`,
      })
    }

    return NextResponse.json(
      { error: "Provide either 'id' or 'source' parameter" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[v0] Chunk delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    )
  }
}
