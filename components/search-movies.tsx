"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: number
  title: string
  year: number
  rating: number
  poster: string
}

interface SearchMoviesProps {
  onMovieAdded?: () => void
}

export function SearchMovies({ onMovieAdded }: SearchMoviesProps) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!search.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(search)}`)
      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (error) {
      console.error("Error searching movies:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovie = async (movie: SearchResult) => {
    try {
      const response = await fetch("/api/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          poster: movie.poster,
        }),
      })

      if (response.ok) {
        setResults(results.filter((m) => m.id !== movie.id))
        if (onMovieAdded) {
          onMovieAdded()
        }
      }
    } catch (error) {
      console.error("Error adding movie:", error)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Buscar película por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-input"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Escribe el nombre de una película para agregarla a tu lista</p>

      {showResults && results.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((movie) => (
            <div key={movie.id} className="overflow-hidden rounded-lg border border-border bg-muted">
              <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="h-40 w-full object-cover" />
              <div className="p-3">
                <h4 className="mb-1 line-clamp-2 text-sm font-semibold">{movie.title}</h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  {movie.year} | ⭐ {movie.rating}
                </p>
                <Button
                  size="sm"
                  onClick={() => handleAddMovie(movie)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Agregar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && (
        <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No se encontraron películas. Intenta con otro término.</p>
        </div>
      )}
    </div>
  )
}
