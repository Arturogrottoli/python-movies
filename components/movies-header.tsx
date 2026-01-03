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
    <header className="border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl shadow-md shadow-primary/20">
              🎬
            </div>
            <h1 className="text-3xl font-bold text-foreground">Movie Points Tracker</h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold text-primary">
                {loading ? "..." : totalPoints.toLocaleString()}
              </p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.username}</p>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} className="border-border hover:bg-muted">
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
