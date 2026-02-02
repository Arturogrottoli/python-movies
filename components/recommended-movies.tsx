"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const [currentPage, setCurrentPage] = useState(0)
  const { toast } = useToast()

  const ITEMS_PER_PAGE_MOBILE = 4
  const ITEMS_PER_PAGE_DESKTOP = 8

  useEffect(() => {
    fetchRecommended(type)
    setCurrentPage(0)
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
      // Error handled silently
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
        const errorMessage = errorData.error || "Failed to add movie"
        toast({
          title: errorMessage.includes("already in your watchlist") ? "Already in list" : "Error",
          description: errorMessage,
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

  const getPaginatedMovies = (isMobile: boolean) => {
    const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return movies.slice(startIndex, endIndex)
  }

  const getTotalPages = (isMobile: boolean) => {
    const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP
    return Math.ceil(movies.length / itemsPerPage)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = (isMobile: boolean) => {
    const totalPages = getTotalPages(isMobile)
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const MovieGrid = ({ isMobile }: { isMobile: boolean }) => {
    const paginatedMovies = getPaginatedMovies(isMobile)
    const totalPages = getTotalPages(isMobile)

    return (
      <>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No movies available.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {paginatedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="group overflow-hidden rounded-lg border border-border bg-muted/30 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                >
                  <div className="relative overflow-hidden bg-muted">
                    <img
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      className="h-60 sm:h-80 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <Button
                          size="sm"
                          onClick={() => handleAddMovie(movie)}
                          className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                        >
                          Add to List
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="mb-1 font-semibold text-sm text-foreground line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{movie.year || "N/A"}</span>
                      <span className="flex items-center gap-1">
                        ⭐ {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNextPage(isMobile)}
                  disabled={currentPage >= totalPages - 1}
                  className="h-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-xl">
          ⭐
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recommended Movies</h2>
          <p className="text-xs text-muted-foreground">Curated picks for you</p>
        </div>
      </div>

      {/* Mobile: Select dropdown */}
      <div className="sm:hidden mb-6">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="top_rated">Top Rated</SelectItem>
            <SelectItem value="now_playing">Now Playing</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="random">Random</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-6">
          <MovieGrid isMobile={true} />
        </div>
      </div>

      {/* Desktop: Tabs */}
      <div className="hidden sm:block">
        <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
            <TabsTrigger value="now_playing">Now Playing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="random">Random</TabsTrigger>
          </TabsList>

          <TabsContent value={type} className="mt-6">
            <MovieGrid isMobile={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
