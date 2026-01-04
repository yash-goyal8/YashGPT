import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    const blob = await put(filename, request.body as ReadableStream, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url, id: blob.pathname })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
