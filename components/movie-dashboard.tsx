"use client"

import { useState, useCallback, useEffect } from "react"
import { MovieList } from "./movie-list"
import { SearchMovies } from "./search-movies"
import { Leaderboard } from "./leaderboard"
import { RecommendedMovies } from "./recommended-movies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

function getAuthHeaders() {
  const token = localStorage.getItem("authToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  added_date?: string
  watchedDate?: string
  date_watched?: string
  points?: number
  points_earned?: number
}

export function MovieDashboard() {
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [watched, setWatched] = useState<Movie[]>([])
  const [activeTab, setActiveTab] = useState<"watchlist" | "watched">("watchlist")
  const [loading, setLoading] = useState(true)

  const fetchWatchlist = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      console.log("📋 [MovieDashboard] fetchWatchlist - no hay token, saltando")
      return
    }
    
    const headers = getAuthHeaders()
    console.log("📋 [MovieDashboard] fetchWatchlist - haciendo request")
    console.log("📋 [MovieDashboard] Token en localStorage:", token ? token.substring(0, 50) + "..." : "NO HAY TOKEN")
    console.log("📋 [MovieDashboard] Headers enviados:", { 
      hasAuth: !!headers.Authorization, 
      authPrefix: headers.Authorization?.substring(0, 30) || "none" 
    })
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/watchlist`, {
        headers: headers,
      })
      console.log("📋 [MovieDashboard] fetchWatchlist - respuesta:", response.status)
      if (response.ok) {
        const data = await response.json()
        setWatchlist(data.movies || [])
        console.log("📋 [MovieDashboard] fetchWatchlist - éxito, películas:", data.movies?.length || 0)
      } else if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        console.error("📋 [MovieDashboard] fetchWatchlist - 401 error:", errorData.detail || "Token inválido")
        console.error("📋 [MovieDashboard] Token inválido - NO limpiando localStorage para permitir debug")
      } else {
        console.error("Error fetching watchlist:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    }
  }, [])

  const fetchWatched = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/watched`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        const watchedMovies = (data.movies || []).map((m: any) => ({
          ...m,
          watchedDate: m.date_watched,
          points: m.points_earned,
        }))
        setWatched(watchedMovies)
      } else if (response.status === 401) {
        console.error("📋 [MovieDashboard] fetchWatched - 401 error: Token inválido")
        console.error("📋 [MovieDashboard] NO limpiando localStorage para permitir debug")
      } else {
        console.error("Error fetching watched movies:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching watched movies:", error)
    }
  }, [])

  useEffect(() => {
    console.log("📋 [MovieDashboard] useEffect - montando componente, cargando datos")
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchWatchlist(), fetchWatched()])
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [fetchWatchlist, fetchWatched])

  const markAsWatched = useCallback(
    async (movieId: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/movies/mark-watched`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            movie_id: movieId,
            date_watched: new Date().toISOString(),
          }),
        })

        if (response.ok) {
          await Promise.all([fetchWatchlist(), fetchWatched()])
        } else if (response.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("currentUser")
          window.location.reload()
        }
      } catch (error) {
        console.error("Error marking movie as watched:", error)
      }
    },
    [fetchWatchlist, fetchWatched],
  )

  const removeWatched = useCallback(
    async (movieId: number) => {
      await fetchWatched()
    },
    [fetchWatched],
  )

  const removeFromWatchlist = useCallback(
    async (movieId: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          await fetchWatchlist()
        } else if (response.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("currentUser")
          window.location.reload()
        }
      } catch (error) {
        console.error("Error removing movie from watchlist:", error)
      }
    },
    [fetchWatchlist],
  )

  const handleMovieAdded = useCallback(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>
      </div>

      <div className="mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-2xl"></div>
          <div className="relative">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-2xl shadow-lg shadow-primary/20">
                🔍
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Discover Movies</h2>
                <p className="text-muted-foreground">Search and add movies to your watchlist</p>
              </div>
            </div>
            <SearchMovies onMovieAdded={handleMovieAdded} />
          </div>
        </div>
      </div>

      <div className="mb-12 grid gap-8 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/90 p-8 shadow-2xl transition-all hover:shadow-primary/10">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10"></div>
          <div className="relative">
            <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                  {activeTab === "watchlist" ? "📋" : "✅"}
                </div>
                <h3 className="text-2xl font-bold text-foreground">My Lists</h3>
              </div>
            </div>
            <div className="mb-6 flex gap-2 rounded-lg bg-muted/30 p-1">
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`flex-1 px-4 py-2.5 font-semibold transition-all rounded-md ${
                  activeTab === "watchlist"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Watchlist ({watchlist.length})
              </button>
              <button
                onClick={() => setActiveTab("watched")}
                className={`flex-1 px-4 py-2.5 font-semibold transition-all rounded-md ${
                  activeTab === "watched"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Watched ({watched.length})
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "watchlist" && (
                  <div>
                    {watchlist.length > 0 ? (
                      <MovieList
                        movies={watchlist}
                        type="watchlist"
                        onMarkWatched={markAsWatched}
                        onDeleteFromWatchlist={removeFromWatchlist}
                      />
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
                        <div className="mb-4 text-6xl">🎬</div>
                        <p className="text-lg text-muted-foreground">No movies in your list yet</p>
                        <p className="mt-2 text-sm text-muted-foreground/80">Search and add some movies to get started!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "watched" && (
                  <div>
                    {watched.length > 0 ? (
                      <MovieList movies={watched} type="watched" onRemove={removeWatched} />
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
                        <div className="mb-4 text-6xl">📺</div>
                        <p className="text-lg text-muted-foreground">You haven't watched any movies yet</p>
                        <p className="mt-2 text-sm text-muted-foreground/80">Start watching and earning points!</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/90 p-8 shadow-2xl transition-all hover:shadow-secondary/10">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-secondary/5 blur-3xl transition-all group-hover:bg-secondary/10"></div>
          <div className="relative">
            <RecommendedMovies onMovieAdded={handleMovieAdded} />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/90 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-2xl shadow-lg shadow-primary/20">
              🏆
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Compete with other movie enthusiasts</p>
            </div>
          </div>
          <Leaderboard />
        </div>
      </div>

    </div>
  )
}
