import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60 // Allow up to 60 seconds for upload

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (max 4MB to stay under serverless limits)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is 4MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 413 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN is not set")
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
    }

    // Stream the file directly to Blob (more efficient than buffering)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Vercel Blob with random suffix to avoid duplicates
    const blob = await put(file.name, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      url: blob.url,
      id: blob.pathname,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
