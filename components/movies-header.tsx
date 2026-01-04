"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface MoviesHeaderProps {
  onLogout?: () => void
}

export function MoviesHeader({ onLogout }: MoviesHeaderProps) {
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    const fetchTotalPoints = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setTotalPoints(0)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/stats/total-points`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setTotalPoints(data.total_points || 0)
        } else if (response.status === 401) {
          console.error("📊 [MoviesHeader] 401 error: Token inválido")
          console.error("📊 [MoviesHeader] NO limpiando localStorage para permitir debug")
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
  }, [onLogout])

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-lg shadow-black/5">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-3xl shadow-lg shadow-primary/30 ring-2 ring-primary/20">
              🎬
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                Movie Points Tracker
              </h1>
              <p className="text-xs text-muted-foreground/80">Track your cinema journey</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-3 text-right backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Points</p>
              <p className="mt-1 text-3xl font-black text-primary">
                {loading ? "..." : totalPoints.toLocaleString()}
              </p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed in as</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">{currentUser.username}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLogout} 
                  className="h-9 border-border/50 bg-card/50 font-semibold hover:bg-muted/80 hover:border-border transition-all"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
