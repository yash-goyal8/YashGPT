import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

async function debug() {
  console.log("=== Checking Redis Data ===")
  
  // Check cards
  const cards = await redis.get("portfolio:cards")
  if (cards && typeof cards === "object") {
    const experience = cards.experience || []
    console.log("\n=== Experience Cards ===")
    experience.forEach((card, i) => {
      console.log(`[${i}] slug: "${card.slug}", role: "${card.role}", company: "${card.company}"`)
    })
  } else {
    console.log("No cards found in portfolio:cards")
  }
  
  // Check detail keys
  console.log("\n=== Detail Keys ===")
  const keys = await redis.keys("detail:*")
  console.log("Detail keys in Redis:", keys)
  
  for (const key of keys) {
    const data = await redis.get(key)
    console.log(`\n${key}:`, JSON.stringify(data, null, 2).slice(0, 200))
  }
}

debug().catch(console.error)
