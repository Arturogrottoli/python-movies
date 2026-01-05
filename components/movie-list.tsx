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
  onDeleteWatched?: (id: number) => void
}

export function MovieList({ movies, type, onMarkWatched, onRemove, onDeleteFromWatchlist, onDeleteWatched }: MovieListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/10"
        >
          <div className="relative overflow-hidden bg-muted aspect-square">
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {type === "watchlist" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteFromWatchlist?.(movie.id)
                }}
                className="absolute top-3 right-3 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                aria-label="Remove movie"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {type === "watched" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteWatched?.(movie.id)
                }}
                className="absolute top-3 right-3 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                aria-label="Delete movie"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2.5 pointer-events-auto">
                {type === "watchlist" && onMarkWatched && (
                  <Button
                    size="sm"
                    onClick={() => onMarkWatched(movie.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg min-h-[36px]"
                  >
                    <span className="truncate block">Marcar Vista</span>
                  </Button>
                )}
                {type === "watched" && onRemove && (
                  <Button
                    size="sm"
                    onClick={() => onRemove(movie.id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg min-h-[36px]"
                  >
                    <span className="truncate block">A Watchlist</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground leading-tight">{movie.title}</h3>
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{movie.year}</span>
              <span className="flex items-center gap-1 font-medium">⭐ {movie.rating}</span>
            </div>
            {type === "watched" && (
              <div className="rounded-lg bg-primary/10 px-3 py-2 text-center border border-primary/20">
                <span className="text-sm font-bold text-primary">+{movie.points} pts</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
