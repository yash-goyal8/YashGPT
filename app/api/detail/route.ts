import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

const redis = Redis.fromEnv()

export interface DetailContent {
  type: string
  slug: string
  title: string
  subtitle?: string
  period?: string
  overview?: string
  highlights?: string[]
  media?: {
    id: string
    type: "image" | "video" | "pdf"
    url: string
    title: string
    description?: string
  }[]
  customSections?: {
    title: string
    content: string
  }[]
  relatedItems?: {
    type: string
    slug: string
    title: string
  }[]
  updatedAt: string
}

// GET - Fetch detail content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const slug = searchParams.get("slug")

  if (!type || !slug) {
    return NextResponse.json({ error: "Type and slug required" }, { status: 400 })
  }

  try {
    const key = `detail:${type}:${slug}`
    const content = await redis.get<DetailContent>(key)
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching detail:", error)
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 })
  }
}

// POST - Save detail content (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, slug, ...content } = body

    if (!type || !slug) {
      return NextResponse.json({ error: "Type and slug required" }, { status: 400 })
    }

    const key = `detail:${type}:${slug}`
    const detailContent: DetailContent = {
      type,
      slug,
      ...content,
      updatedAt: new Date().toISOString()
    }

    await redis.set(key, detailContent)
    
    // Also add to index for listing
    await redis.sadd(`detail:index:${type}`, slug)

    return NextResponse.json({ success: true, content: detailContent })
  } catch (error) {
    console.error("Error saving detail:", error)
    return NextResponse.json({ error: "Failed to save detail" }, { status: 500 })
  }
}

// DELETE - Remove detail content (admin only)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const slug = searchParams.get("slug")

  if (!type || !slug) {
    return NextResponse.json({ error: "Type and slug required" }, { status: 400 })
  }

  try {
    const key = `detail:${type}:${slug}`
    await redis.del(key)
    await redis.srem(`detail:index:${type}`, slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting detail:", error)
    return NextResponse.json({ error: "Failed to delete detail" }, { status: 500 })
  }
}
