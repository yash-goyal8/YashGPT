import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Base card data (fallback if no extended content) - slugs must match /app/design/page.tsx
const BASE_DATA: Record<string, Record<string, { title: string; subtitle?: string; period?: string; description?: string; tags?: string[] }>> = {
  experience: {
    "senior-pm-tech-company": {
      title: "Senior Product Manager",
      subtitle: "Tech Company",
      period: "2022 - Present",
      description: "Leading product strategy for enterprise solutions, driving 40% revenue growth through data-driven decisions.",
      tags: ["Product Strategy", "Data Analytics", "Cross-functional Leadership"],
    },
    "pm-startup-inc": {
      title: "Product Manager",
      subtitle: "Startup Inc",
      period: "2020 - 2022",
      description: "Built and launched 3 products from 0 to 1, managing a team of 8 engineers and designers.",
      tags: ["Agile", "User Research", "Go-to-Market"],
    },
    "software-engineer-enterprise": {
      title: "Software Engineer",
      subtitle: "Enterprise Corp",
      period: "2018 - 2020",
      description: "Full-stack development for customer-facing applications serving 2M+ users.",
      tags: ["React", "Node.js", "AWS", "System Design"],
    },
  },
  education: {
    "mba-business-school": {
      title: "MBA",
      subtitle: "Business School",
      period: "2023 - 2025",
      description: "Focus on Technology & Strategy",
    },
    "btech-computer-science": {
      title: "B.Tech Computer Science",
      subtitle: "University",
      period: "2014 - 2018",
      description: "Focus on Software Engineering",
    },
  },
  project: {
    "ai-analytics-platform": {
      title: "AI-Powered Analytics Platform",
      description: "Built a real-time analytics dashboard with predictive insights, reducing decision time by 60%.",
      tags: ["Python", "React", "TensorFlow", "AWS"],
    },
    "ecommerce-personalization": {
      title: "E-commerce Personalization Engine",
      description: "Developed recommendation system increasing conversion by 25% through personalized experiences.",
      tags: ["ML", "Node.js", "Redis", "PostgreSQL"],
    },
    "developer-platform": {
      title: "Developer Platform",
      description: "Led the creation of internal developer tools used by 500+ engineers daily.",
      tags: ["TypeScript", "GraphQL", "Kubernetes"],
    },
  },
  "case-study": {
    "scaling-b2b-saas": {
      title: "Scaling a B2B SaaS Product",
      description: "Low enterprise adoption despite strong SMB traction. Redesigned onboarding, added SSO, built admin dashboard. 3x enterprise deals in 6 months.",
    },
    "reducing-customer-churn": {
      title: "Reducing Customer Churn",
      description: "15% monthly churn in first 90 days. Implemented proactive health scoring and intervention triggers. Reduced churn to 5%, saved $2M ARR.",
    },
  },
  certification: {
    "aws-solutions-architect": {
      title: "AWS Solutions Architect",
      subtitle: "Amazon Web Services",
      period: "2023",
    },
    "product-management-certificate": {
      title: "Product Management Certificate",
      subtitle: "Product School",
      period: "2022",
    },
    "google-analytics": {
      title: "Google Analytics Certified",
      subtitle: "Google",
      period: "2021",
    },
    "scrum-master": {
      title: "Scrum Master Certified",
      subtitle: "Scrum Alliance",
      period: "2020",
    },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params

  try {
    // Try to get extended content from Redis
    const extendedContent = await redis.get(`detail:${type}:${slug}`)
    
    // Get base data
    const baseData = BASE_DATA[type]?.[slug]
    
    if (!baseData && !extendedContent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Merge base data with extended content
    const content = {
      ...(baseData || {}),
      ...(extendedContent as object || {}),
    }

    return NextResponse.json({
      type,
      slug,
      content,
    })
  } catch (error) {
    console.error("Error fetching detail:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params

  try {
    const body = await request.json()
    
    console.log("[v0] Saving detail content:", { type, slug, keys: Object.keys(body) })
    
    // Check Redis connection
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error("[v0] Redis environment variables not configured")
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
    }
    
    // Store extended content in Redis (Upstash handles JSON automatically)
    const result = await redis.set(`detail:${type}:${slug}`, body)
    
    console.log("[v0] Detail saved successfully:", result)
    
    return NextResponse.json({ success: true, content: body })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error saving detail:", errorMessage, error)
    return NextResponse.json({ 
      error: "Failed to save", 
      details: errorMessage 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params

  try {
    await redis.del(`detail:${type}:${slug}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting detail:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
