import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log("[v0] Upload API called")
  
  try {
    let file: File | null = null
    
    try {
      const formData = await request.formData()
      file = formData.get("file") as File
    } catch (parseError) {
      console.error("[v0] Failed to parse formData:", parseError)
      return NextResponse.json({ error: "Failed to parse upload data" }, { status: 400 })
    }

    if (!file || !file.name) {
      console.error("[v0] No file in formData")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, file.size, file.type)

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is 8MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 413 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN is not set")
      return NextResponse.json({ error: "Blob storage not configured. Please connect Vercel Blob integration." }, { status: 500 })
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("[v0] Upload successful:", blob.url)

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
