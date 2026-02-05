import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = Redis.fromEnv()

const CARDS_KEY = "portfolio:cards"

// Default card data (fallback)
const DEFAULT_CARDS = {
  experience: [
    {
      slug: "senior-pm-tech-company",
      period: "2022 - Present",
      role: "Senior Product Manager",
      company: "Tech Company",
      description: "Leading product strategy for enterprise solutions, driving 40% revenue growth through data-driven decisions.",
      skills: ["Product Strategy", "Data Analytics", "Cross-functional Leadership"]
    },
    {
      slug: "pm-startup-inc",
      period: "2020 - 2022",
      role: "Product Manager",
      company: "Startup Inc",
      description: "Built and launched 3 products from 0 to 1, managing a team of 8 engineers and designers.",
      skills: ["Agile", "User Research", "Go-to-Market"]
    },
    {
      slug: "software-engineer-enterprise",
      period: "2018 - 2020",
      role: "Software Engineer",
      company: "Enterprise Corp",
      description: "Full-stack development for customer-facing applications serving 2M+ users.",
      skills: ["React", "Node.js", "AWS", "System Design"]
    },
  ],
  education: [
    {
      slug: "mba-business-school",
      period: "2023 - 2025",
      degree: "MBA",
      school: "Business School",
      focus: "Technology & Strategy"
    },
    {
      slug: "btech-computer-science",
      period: "2014 - 2018",
      degree: "B.Tech Computer Science",
      school: "University",
      focus: "Software Engineering"
    },
  ],
  project: [
    {
      slug: "ai-analytics-platform",
      title: "AI-Powered Analytics Platform",
      description: "Built a real-time analytics dashboard with predictive insights, reducing decision time by 60%.",
      tech: ["Python", "React", "TensorFlow", "AWS"],
      image: null
    },
    {
      slug: "ecommerce-personalization",
      title: "E-commerce Personalization Engine",
      description: "Developed recommendation system increasing conversion by 25% through personalized experiences.",
      tech: ["ML", "Node.js", "Redis", "PostgreSQL"],
      image: null
    },
    {
      slug: "developer-platform",
      title: "Developer Platform",
      description: "Led the creation of internal developer tools used by 500+ engineers daily.",
      tech: ["TypeScript", "GraphQL", "Kubernetes"],
      image: null
    },
  ],
  "case-study": [
    {
      slug: "scaling-b2b-saas",
      title: "Scaling a B2B SaaS Product",
      problem: "Low enterprise adoption despite strong SMB traction",
      solution: "Redesigned onboarding, added SSO, built admin dashboard",
      impact: "3x enterprise deals in 6 months"
    },
    {
      slug: "reducing-customer-churn",
      title: "Reducing Customer Churn",
      problem: "15% monthly churn in first 90 days",
      solution: "Implemented proactive health scoring and intervention triggers",
      impact: "Reduced churn to 5%, saved $2M ARR"
    },
  ],
  certification: [
    {
      slug: "aws-solutions-architect",
      title: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      credentialId: "AWS-SAA-123456"
    },
    {
      slug: "product-management-certificate",
      title: "Product Management Certificate",
      issuer: "Product School",
      date: "2022",
      credentialId: "PS-PM-789012"
    },
    {
      slug: "google-analytics",
      title: "Google Analytics Certified",
      issuer: "Google",
      date: "2021",
      credentialId: "GA-345678"
    },
    {
      slug: "scrum-master",
      title: "Scrum Master Certified",
      issuer: "Scrum Alliance",
      date: "2020",
      credentialId: "CSM-901234"
    },
  ],
  skills: {
    "Product": ["Strategy", "Roadmapping", "Analytics", "User Research", "A/B Testing"],
    "Technical": ["Python", "JavaScript", "React", "SQL", "AWS", "System Design"],
    "Leadership": ["Team Building", "Stakeholder Management", "Mentoring", "Agile"],
  }
}

// GET - Fetch all cards
export async function GET() {
  try {
    const cards = await redis.get(CARDS_KEY)
    
    if (!cards) {
      // Return default cards if none stored
      return NextResponse.json(DEFAULT_CARDS)
    }
    
    // Merge with defaults to ensure all categories exist
    const mergedCards = { ...DEFAULT_CARDS, ...(cards as object) }
    return NextResponse.json(mergedCards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json(DEFAULT_CARDS)
  }
}

// POST - Update cards
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, cards } = body
    
    // Get existing cards
    const existingCards = (await redis.get(CARDS_KEY)) as Record<string, unknown> || {}
    
    // Update specific category
    const updatedCards = {
      ...DEFAULT_CARDS,
      ...existingCards,
      [category]: cards
    }
    
    await redis.set(CARDS_KEY, updatedCards)
    
    return NextResponse.json({ success: true, cards: updatedCards })
  } catch (error) {
    console.error("Error updating cards:", error)
    return NextResponse.json({ error: "Failed to update cards" }, { status: 500 })
  }
}

// PUT - Update a single card
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { category, slug, data } = body
    
    // Get existing cards
    const existingCards = (await redis.get(CARDS_KEY)) as Record<string, unknown[]> || { ...DEFAULT_CARDS }
    
    // Find and update the specific card
    const categoryCards = existingCards[category] as Record<string, unknown>[] || 
      (DEFAULT_CARDS as Record<string, unknown[]>)[category] || []
    
    const cardIndex = categoryCards.findIndex((card) => card.slug === slug)
    
    if (cardIndex === -1) {
      // Add new card
      categoryCards.push({ slug, ...data })
    } else {
      // Update existing card
      categoryCards[cardIndex] = { ...categoryCards[cardIndex], ...data }
    }
    
    const updatedCards = {
      ...DEFAULT_CARDS,
      ...existingCards,
      [category]: categoryCards
    }
    
    await redis.set(CARDS_KEY, updatedCards)
    
    return NextResponse.json({ success: true, cards: updatedCards })
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
  }
}

// DELETE - Delete a card
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const slug = searchParams.get("slug")
    
    if (!category || !slug) {
      return NextResponse.json({ error: "Missing category or slug" }, { status: 400 })
    }
    
    // Get existing cards
    const existingCards = (await redis.get(CARDS_KEY)) as Record<string, unknown[]> || { ...DEFAULT_CARDS }
    
    // Remove the card
    const categoryCards = existingCards[category] as Record<string, unknown>[] || []
    const filteredCards = categoryCards.filter((card) => card.slug !== slug)
    
    const updatedCards = {
      ...DEFAULT_CARDS,
      ...existingCards,
      [category]: filteredCards
    }
    
    await redis.set(CARDS_KEY, updatedCards)
    
    return NextResponse.json({ success: true, cards: updatedCards })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 })
  }
}
