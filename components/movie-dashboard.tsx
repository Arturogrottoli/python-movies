"use client"

import { useState, useCallback, useEffect } from "react"
import { MovieList } from "./movie-list"
import { SearchMovies } from "./search-movies"

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <SearchMovies onMovieAdded={handleMovieAdded} />
      </div>

      <div className="mb-8 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "watchlist"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My List ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab("watched")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "watched"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Watched ({watched.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === "watchlist" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">My List</h2>
              {watchlist.length > 0 ? (
                <MovieList
                  movies={watchlist}
                  type="watchlist"
                  onMarkWatched={markAsWatched}
                  onDeleteFromWatchlist={removeFromWatchlist}
                />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground">No movies in your list. Search and add some movies.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "watched" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Watched Movies</h2>
              {watched.length > 0 ? (
                <MovieList movies={watched} type="watched" onRemove={removeWatched} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground">You haven't watched any movies yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
