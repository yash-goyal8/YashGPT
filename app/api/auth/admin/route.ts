import { NextResponse } from "next/server"
import { getRedis } from "@/lib/services/cache"

const ADMIN_PASSWORD_KEY = "chatbot:admin_password"
const DEFAULT_PASSWORD = "admin123" // User should change this

export async function POST(request: Request) {
  try {
    const redis = getRedis()
    const { password } = await request.json()

    // Get stored password or use default
    const storedPassword = (await redis.get<string>(ADMIN_PASSWORD_KEY)) || DEFAULT_PASSWORD

    if (password === storedPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

// Endpoint to change admin password
export async function PUT(request: Request) {
  try {
    const redis = getRedis()
    const { currentPassword, newPassword } = await request.json()

    const storedPassword = (await redis.get<string>(ADMIN_PASSWORD_KEY)) || DEFAULT_PASSWORD

    if (currentPassword !== storedPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    await redis.set(ADMIN_PASSWORD_KEY, newPassword)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
