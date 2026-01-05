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
    <header className="sticky top-0 z-50 border-b border-orange-500/20 bg-gradient-to-r from-orange-950/95 via-orange-900/95 to-orange-950/95 backdrop-blur-xl shadow-xl shadow-orange-900/20">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 text-4xl shadow-2xl shadow-orange-500/50 ring-4 ring-orange-400/30 transform group-hover:scale-105 transition-transform">
                🎬
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-lg">
                Movie Points Tracker
              </h1>
              <p className="text-xs text-orange-300/80 font-medium">Track your cinema journey</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-xl border-2 border-orange-400/30 bg-gradient-to-br from-orange-500/20 via-orange-500/15 to-orange-600/20 px-6 py-3.5 text-right backdrop-blur-sm shadow-lg shadow-orange-500/20">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-300/90">Total Points</p>
                <p className="mt-1 text-3xl font-black bg-gradient-to-r from-orange-200 to-orange-100 bg-clip-text text-transparent">
                  {loading ? "..." : totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-300/70">Signed in as</p>
                  <p className="mt-0.5 text-base font-bold bg-gradient-to-r from-orange-200 to-orange-100 bg-clip-text text-transparent">
                    {currentUser.username}
                  </p>
                </div>
                <Button 
                  onClick={onLogout} 
                  className="h-10 px-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/30 border-2 border-orange-400/30 transition-all transform hover:scale-105"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
