"use client"

import { useState, useCallback, useEffect } from "react"
import { MovieList } from "./movie-list"
import { SearchMovies } from "./search-movies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/watchlist`)
      if (response.ok) {
        const data = await response.json()
        setWatchlist(data.movies || [])
      } else {
        console.error("Error fetching watchlist:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    }
  }, [])

  const fetchWatched = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/watched`)
      if (response.ok) {
        const data = await response.json()
        const watchedMovies = (data.movies || []).map((m: any) => ({
          ...m,
          watchedDate: m.date_watched,
          points: m.points_earned,
        }))
        setWatched(watchedMovies)
      } else {
        console.error("Error fetching watched movies:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching watched movies:", error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchWatchlist(), fetchWatched()])
      setLoading(false)
    }
    loadData()
  }, [fetchWatchlist, fetchWatched])

  const markAsWatched = useCallback(
    async (movieId: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/movies/mark-watched`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movie_id: movieId,
            date_watched: new Date().toISOString(),
          }),
        })

        if (response.ok) {
          await Promise.all([fetchWatchlist(), fetchWatched()])
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
            Mi Lista ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab("watched")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "watched"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Vistas ({watched.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : (
        <>
          {activeTab === "watchlist" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Mi Lista</h2>
              {watchlist.length > 0 ? (
                <MovieList movies={watchlist} type="watchlist" onMarkWatched={markAsWatched} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground">No hay películas en tu lista. Busca y agrega algunas películas.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "watched" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Películas Vistas</h2>
              {watched.length > 0 ? (
                <MovieList movies={watched} type="watched" onRemove={removeWatched} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground">Aún no has visto ninguna película.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
