import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getRedis } from "@/lib/services/cache"

interface MediaItem {
  id: string
  url: string
  filename: string
  type: "image" | "video"
  mimeType: string
  title: string
  description: string
  tags: string[]
  size: number
  uploadedAt: string
}

// GET - Fetch all media items
export async function GET() {
  try {
    const redis = getRedis()
    const mediaIds = await redis.smembers("media:items")
    
    if (!mediaIds || mediaIds.length === 0) {
      return NextResponse.json({ media: [] })
    }
    
    const pipeline = redis.pipeline()
    for (const id of mediaIds) {
      pipeline.hgetall(`media:${id}`)
    }
    
    const results = await pipeline.exec()
    const media = results
      .filter((item): item is MediaItem => item !== null && typeof item === "object")
      .map((item) => ({
        ...item,
        tags: typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags || [],
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    return NextResponse.json({ media })
  } catch (error) {
    console.error("[v0] Failed to fetch media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string || file.name
    const description = formData.get("description") as string || ""
    const tags = formData.get("tags") as string || ""
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    
    // Validate file type
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    
    if (!isImage && !isVideo) {
      return NextResponse.json({ 
        error: "Invalid file type. Only images and videos are allowed." 
      }, { status: 400 })
    }
    
    // Size limits: 10MB for images, 100MB for videos
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max size: ${isVideo ? "100MB" : "10MB"}` 
      }, { status: 400 })
    }
    
    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })
    
    const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    const mediaItem: MediaItem = {
      id,
      url: blob.url,
      filename: file.name,
      type: isImage ? "image" : "video",
      mimeType: file.type,
      title,
      description,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }
    
    // Store in Redis
    const redis = getRedis()
    await redis.hset(`media:${id}`, {
      ...mediaItem,
      tags: JSON.stringify(mediaItem.tags),
    })
    await redis.sadd("media:items", id)
    
    return NextResponse.json({ success: true, media: mediaItem })
  } catch (error) {
    console.error("[v0] Media upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// DELETE - Remove media item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 })
    }
    
    const redis = getRedis()
    
    // Get media item to find blob URL
    const mediaItem = await redis.hgetall(`media:${id}`)
    
    if (!mediaItem || !mediaItem.url) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }
    
    // Delete from Vercel Blob
    try {
      await del(mediaItem.url as string)
    } catch {
      // Continue even if blob deletion fails
    }
    
    // Remove from Redis
    await redis.del(`media:${id}`)
    await redis.srem("media:items", id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Media delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

// PATCH - Update media metadata
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, tags } = body
    
    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 })
    }
    
    const redis = getRedis()
    
    const updates: Record<string, string> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (tags !== undefined) updates.tags = JSON.stringify(tags)
    
    if (Object.keys(updates).length > 0) {
      await redis.hset(`media:${id}`, updates)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Media update error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
