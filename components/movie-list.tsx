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
  onDeleteFromWatchlist?: (id: number) => void
}

export function MovieList({ movies, type, onMarkWatched, onRemove, onDeleteFromWatchlist }: MovieListProps) {
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
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                {type === "watchlist" && onMarkWatched ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onMarkWatched(movie.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Mark as Watched
                    </Button>
                    {onDeleteFromWatchlist && (
                      <Button
                        size="sm"
                        onClick={() => onDeleteFromWatchlist(movie.id)}
                        variant="destructive"
                        className="w-full"
                      >
                        Remove
                      </Button>
                    )}
                  </>
                ) : type === "watched" && onRemove ? (
                  <Button size="sm" onClick={() => onRemove(movie.id)} variant="secondary" className="w-full">
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-4 relative">
            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{movie.title}</h3>
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{movie.year}</span>
              <span className="flex items-center gap-1">⭐ {movie.rating}</span>
            </div>
            {type === "watchlist" && onDeleteFromWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteFromWatchlist(movie.id)
                }}
                className="absolute top-2 right-2 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove movie"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}

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
