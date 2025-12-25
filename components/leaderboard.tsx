"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface LeaderboardEntry {
  rank: number
  user_id: number
  username: string
  total_points: number
  movies_watched: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all_time">("all_time")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard(period)
  }, [period])

  const fetchLeaderboard = async (period: "week" | "month" | "year" | "all_time") => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Leaderboard</h2>
      
      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
          <TabsTrigger value="all_time">All Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value={period} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No rankings available for this period.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    entry.rank <= 3
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                      {getMedal(entry.rank)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{entry.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.movies_watched} movie{entry.movies_watched !== 1 ? "s" : ""} watched
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{entry.total_points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

