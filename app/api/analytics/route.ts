/**
 * Analytics API
 * Fetches chat analytics and statistics
 */

import { NextResponse } from "next/server"
import { getAnalyticsSummary, getChunkCount } from "@/lib/services"

export async function GET() {
  try {
    const [analytics, chunkCount] = await Promise.all([
      getAnalyticsSummary(),
      getChunkCount(),
    ])

    return NextResponse.json({
      summary: {
        totalQueries: analytics.totalQueries,
        todayQueries: analytics.todayQueries,
        chunksStored: chunkCount,
      },
      topQuestions: analytics.topQuestions,
      recentInteractions: analytics.recentInteractions,
    })
  } catch (error) {
    return NextResponse.json({
      summary: { totalQueries: 0, todayQueries: 0, chunksStored: 0 },
      topQuestions: [],
      recentInteractions: [],
    })
  }
}
