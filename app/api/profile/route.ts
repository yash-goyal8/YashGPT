import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = Redis.fromEnv()

const PROFILE_KEY = "portfolio:profile"

const DEFAULT_PROFILE = {
  name: "Yash Goyal",
  title: "Product & Technology Leader",
  tagline: "Available for opportunities",
  bio: "Building products that matter. I combine deep technical expertise with strategic product thinking to create impactful solutions at scale.",
  email: "yash@example.com",
  phone: "+1234567890",
  linkedinUrl: "https://linkedin.com/in/yashgoyal",
  githubUrl: "https://github.com/yashgoyal",
  resumeUrl: "",
  profilePhotoUrl: "",
  footerText: "2025 Yash Goyal",
}

export async function GET() {
  try {
    const profile = await redis.get(PROFILE_KEY)
    if (profile) {
      // Merge with defaults so new fields always exist
      return NextResponse.json({ ...DEFAULT_PROFILE, ...(profile as object) })
    }
    return NextResponse.json(DEFAULT_PROFILE)
  } catch {
    return NextResponse.json(DEFAULT_PROFILE)
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const existing = await redis.get(PROFILE_KEY)
    const merged = { ...DEFAULT_PROFILE, ...(existing as object || {}), ...data }
    await redis.set(PROFILE_KEY, merged)
    return NextResponse.json(merged)
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
