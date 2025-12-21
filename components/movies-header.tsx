"use client"

import { useEffect, useState } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export function MoviesHeader() {
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTotalPoints = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stats/total-points`)
        if (response.ok) {
          const data = await response.json()
          setTotalPoints(data.total_points || 0)
        }
      } catch (error) {
        console.error("Error fetching total points:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTotalPoints()
    const interval = setInterval(fetchTotalPoints, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="text-lg font-bold">🎬</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Movie Points Tracker</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold text-primary">
              {loading ? "..." : totalPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
