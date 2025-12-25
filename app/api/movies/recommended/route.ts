const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "popular"

  if (!TMDB_API_KEY) {
    return Response.json(
      { 
        results: [], 
        error: "TMDB_API_KEY no está configurada" 
      }, 
      { status: 400 }
    )
  }

  try {
    let url = ""
    
    switch (type) {
      case "popular":
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`
        break
      case "top_rated":
        url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`
        break
      case "now_playing":
        url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
        break
      case "upcoming":
        url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`
        break
      case "random":
        const randomPage = Math.floor(Math.random() * 10) + 1
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`
        break
      default:
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error("TMDB API request failed")
    }

    const data = await response.json()
    
    const movies = data.results.slice(0, 20).map((movie: any) => ({
      id: movie.id,
      title: movie.original_title || movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      rating: movie.vote_average || 0,
      poster: movie.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` 
        : "/placeholder.svg",
      overview: movie.overview || "",
    }))

    return Response.json({ results: movies, type })
  } catch (error) {
    console.error("Error fetching recommended movies:", error)
    return Response.json(
      { results: [], error: "Failed to fetch recommended movies" },
      { status: 500 }
    )
  }
}

