import { MoviesHeader } from "@/components/movies-header"
import { MovieDashboard } from "@/components/movie-dashboard"

export const metadata = {
  title: "Movie Points Tracker",
  description: "Track your movies and earn points",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <MoviesHeader />
      <MovieDashboard />
    </main>
  )
}
