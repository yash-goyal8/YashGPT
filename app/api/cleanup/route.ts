/**
 * Cleanup API
 * Clears all data from Vector DB, Redis cache, and Blob storage
 */

import { NextResponse } from "next/server"
import { list, del } from "@vercel/blob"
import { deleteAllChunks, clearAllCache } from "@/lib/services"

export async function POST(request: Request) {
  try {
    const { confirm } = await request.json()

    if (confirm !== "DELETE_ALL_DATA") {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 })
    }

    const results = {
      vector: { deleted: 0, error: null as string | null },
      redis: { deleted: 0, error: null as string | null },
      blob: { deleted: 0, error: null as string | null },
    }

    // 1. Clear Vector DB
    try {
      results.vector.deleted = await deleteAllChunks()
    } catch (error) {
      results.vector.error = error instanceof Error ? error.message : "Unknown error"
    }

    // 2. Clear Redis cache
    try {
      results.redis.deleted = await clearAllCache()
    } catch (error) {
      results.redis.error = error instanceof Error ? error.message : "Unknown error"
    }

    // 3. Clear Blob storage
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { blobs } = await list()
        for (const blob of blobs) {
          await del(blob.url)
          results.blob.deleted++
        }
      }
    } catch (error) {
      results.blob.error = error instanceof Error ? error.message : "Unknown error"
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    )
  }
}
