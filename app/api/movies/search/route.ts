const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return Response.json({ results: [] })
  }

  if (!TMDB_API_KEY) {
    return Response.json(
      { 
        results: [], 
        error: "TMDB_API_KEY no está configurada. Por favor, crea un archivo .env.local con tu API key de TMDB." 
      }, 
      { status: 400 }
    )
  }

  try {
      const [movieResponse, personResponse] = await Promise.all([
        fetch(
          `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=es-ES`
        ),
        fetch(
          `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=es-ES`
        ),
      ])

      if (!movieResponse.ok && !personResponse.ok) {
        console.error("TMDB API error:", movieResponse.status, personResponse.status)
        throw new Error("TMDB API request failed")
      }

      const movieResults = movieResponse.ok ? await movieResponse.json() : { results: [] }
      const personResults = personResponse.ok ? await personResponse.json() : { results: [] }

      const directorIds = new Set<number>()
      personResults.results.forEach((person: any) => {
        if (person.known_for_department === "Directing") {
          directorIds.add(person.id)
        }
      })

      const allMovieIds = new Set<number>()
      const movies = movieResults.results.slice(0, 15)

      if (directorIds.size > 0) {
        for (const directorId of Array.from(directorIds).slice(0, 3)) {
          try {
            const directorMoviesResponse = await fetch(
              `${TMDB_BASE_URL}/person/${directorId}/movie_credits?api_key=${TMDB_API_KEY}&language=es-ES`
            )
            if (directorMoviesResponse.ok) {
              const directorMovies = await directorMoviesResponse.json()
              const directedMovies = directorMovies.crew
                ?.filter((credit: any) => credit.job === "Director")
                .slice(0, 10) || []
              
              directedMovies.forEach((credit: any) => {
                if (credit.id) {
                  allMovieIds.add(credit.id)
                }
              })
            }
          } catch (e) {
            console.error("Error fetching director movies:", e)
          }
        }
      }

      for (const movie of movies) {
        allMovieIds.add(movie.id)
      }

      const movieDetailsPromises = Array.from(allMovieIds).slice(0, 20).map(async (movieId) => {
        try {
          const detailResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`
          )
          if (detailResponse.ok) {
            return await detailResponse.json()
          }
        } catch (e) {
          console.error(`Error fetching movie ${movieId}:`, e)
        }
        return null
      })

      const movieDetails = (await Promise.all(movieDetailsPromises)).filter((m) => m !== null)

      const results = movieDetails.map((movie: any) => {
        const director = movie.credits?.crew?.find((person: any) => person.job === "Director")
        return {
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
          rating: movie.vote_average || 0,
          poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg",
          director: director?.name || undefined,
        }
      })

      return Response.json({ results: results.slice(0, 20) })
  } catch (error) {
    console.error("TMDB API Error:", error)
    return Response.json({ 
      results: [], 
      error: error instanceof Error ? error.message : "Error al buscar películas en TMDB" 
    }, { status: 500 })
  }
}
