"use client"

import { useState, useCallback } from "react"
import { MovieList } from "./movie-list"
import { SearchMovies } from "./search-movies"

interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  addedDate?: string
  watchedDate?: string
  points?: number
}

export function MovieDashboard() {
  const [watchlist, setWatchlist] = useState<Movie[]>([
    {
      id: 1,
      title: "Oppenheimer",
      year: 2023,
      rating: 8.5,
      addedDate: "2024-12-01",
      poster: "/oppenheimer.jpg",
    },
    {
      id: 2,
      title: "The Killers of the Flower Moon",
      year: 2023,
      rating: 8.0,
      addedDate: "2024-12-02",
      poster: "/killers-flower-moon.jpg",
    },
  ])

  const [watched, setWatched] = useState<Movie[]>([
    {
      id: 3,
      title: "Dune: Part Two",
      year: 2024,
      rating: 8.3,
      watchedDate: "2024-11-15",
      poster: "/dune-part-two.jpg",
      points: 50,
    },
    {
      id: 4,
      title: "Killers of the Flower Moon",
      year: 2023,
      rating: 8.0,
      watchedDate: "2024-11-20",
      poster: "/killers-flower-moon.jpg",
      points: 50,
    },
  ])

  const [activeTab, setActiveTab] = useState<"watchlist" | "watched">("watchlist")

  const markAsWatched = useCallback(
    (movieId: number) => {
      const movie = watchlist.find((m) => m.id === movieId)
      if (movie) {
        const watchedMovie = {
          ...movie,
          watchedDate: new Date().toISOString().split("T")[0],
          points: 50,
        }
        setWatched((prev) => [...prev, watchedMovie])
        setWatchlist((prev) => prev.filter((m) => m.id !== movieId))
      }
    },
    [watchlist],
  )

  const removeWatched = useCallback((movieId: number) => {
    setWatched((prev) => prev.filter((m) => m.id !== movieId))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <SearchMovies />
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

      {activeTab === "watchlist" && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-foreground">Mi Lista</h2>
          <MovieList movies={watchlist} type="watchlist" onMarkWatched={markAsWatched} />
        </div>
      )}

      {activeTab === "watched" && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-foreground">Películas Vistas</h2>
          <MovieList movies={watched} type="watched" onRemove={removeWatched} />
        </div>
      )}
    </div>
  )
}
