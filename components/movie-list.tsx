"use client"

import { Button } from "@/components/ui/button"

interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  points?: number
}

interface MovieListProps {
  movies: Movie[]
  type: "watchlist" | "watched"
  onMarkWatched?: (id: number) => void
  onRemove?: (id: number) => void
}

export function MovieList({ movies, type, onMarkWatched, onRemove }: MovieListProps) {
  return (
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
                {type === "watchlist" && onMarkWatched ? (
                  <Button
                    size="sm"
                    onClick={() => onMarkWatched(movie.id)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Marcar como vista
                  </Button>
                ) : type === "watched" && onRemove ? (
                  <Button size="sm" onClick={() => onRemove(movie.id)} variant="secondary" className="w-full">
                    Eliminar
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{movie.title}</h3>
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{movie.year}</span>
              <span className="flex items-center gap-1">⭐ {movie.rating}</span>
            </div>

            {type === "watched" && (
              <div className="rounded bg-primary/10 px-2 py-1 text-center">
                <span className="text-sm font-bold text-primary">+{movie.points} pts</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
