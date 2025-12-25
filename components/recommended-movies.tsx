"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface RecommendedMovie {
  id: number
  title: string
  year: number | null
  rating: number
  poster: string
  overview: string
}

function getAuthHeaders() {
  const token = localStorage.getItem("authToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface RecommendedMoviesProps {
  onMovieAdded?: () => void
}

export function RecommendedMovies({ onMovieAdded }: RecommendedMoviesProps) {
  const [movies, setMovies] = useState<RecommendedMovie[]>([])
  const [type, setType] = useState<"popular" | "top_rated" | "now_playing" | "upcoming" | "random">("popular")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecommended(type)
  }, [type])

  const fetchRecommended = async (movieType: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/movies/recommended?type=${movieType}`)
      if (response.ok) {
        const data = await response.json()
        setMovies(data.results || [])
      }
    } catch (error) {
      console.error("Error fetching recommended movies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovie = async (movie: RecommendedMovie) => {
    try {
      const response = await fetch("/api/movies/add", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: movie.title,
          year: movie.year || new Date().getFullYear(),
          rating: movie.rating || 0,
          poster: movie.poster || "/placeholder.svg",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${movie.title} added to your list!`,
        })
        onMovieAdded?.()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.error || "Failed to add movie",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add movie",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Recommended Movies</h2>
      
      <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
          <TabsTrigger value="now_playing">Now Playing</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="random">Random</TabsTrigger>
        </TabsList>
        
        <TabsContent value={type} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No movies available.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="relative overflow-hidden bg-muted">
                    <img
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      className="h-80 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <Button
                          size="sm"
                          onClick={() => handleAddMovie(movie)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          Add to List
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-semibold text-foreground line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{movie.year || "N/A"}</span>
                      <span className="flex items-center gap-1">
                        ⭐ {movie.rating.toFixed(1)}
                      </span>
                    </div>
                    {movie.overview && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {movie.overview}
                      </p>
                    )}
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

