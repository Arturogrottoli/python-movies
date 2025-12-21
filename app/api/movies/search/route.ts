const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return Response.json({ results: [] })
  }

  try {
    if (TMDB_API_KEY) {
      const [movieResponse, personResponse] = await Promise.all([
        fetch(
          `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=es-ES`
        ),
        fetch(
          `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=es-ES`
        ),
      ])

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
              directorMovies.crew
                ?.filter((credit: any) => credit.job === "Director")
                .slice(0, 5)
                .forEach((credit: any) => {
                  allMovieIds.add(credit.id)
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

      return Response.json({ results })
    } else {
      const mockMovies = [
        {
          id: 1,
          title: "Oppenheimer",
          year: 2023,
          rating: 8.5,
          poster: "/oppenheimer.jpg",
          director: "Christopher Nolan",
        },
        {
          id: 2,
          title: "The Killers of the Flower Moon",
          year: 2023,
          rating: 8.0,
          poster: "/killers-flower-moon.jpg",
          director: "Martin Scorsese",
        },
        {
          id: 3,
          title: "Dune: Part Two",
          year: 2024,
          rating: 8.3,
          poster: "/dune-part-two.jpg",
          director: "Denis Villeneuve",
        },
        {
          id: 4,
          title: "Inception",
          year: 2010,
          rating: 8.8,
          poster: "/placeholder.svg",
          director: "Christopher Nolan",
        },
        {
          id: 5,
          title: "Interstellar",
          year: 2014,
          rating: 8.7,
          poster: "/placeholder.svg",
          director: "Christopher Nolan",
        },
        {
          id: 6,
          title: "The Dark Knight",
          year: 2008,
          rating: 9.0,
          poster: "/placeholder.svg",
          director: "Christopher Nolan",
        },
        {
          id: 7,
          title: "Pulp Fiction",
          year: 1994,
          rating: 8.9,
          poster: "/placeholder.svg",
          director: "Quentin Tarantino",
        },
        {
          id: 8,
          title: "Django Unchained",
          year: 2012,
          rating: 8.4,
          poster: "/placeholder.svg",
          director: "Quentin Tarantino",
        },
        {
          id: 9,
          title: "The Matrix",
          year: 1999,
          rating: 8.7,
          poster: "/placeholder.svg",
          director: "Lana Wachowski, Lilly Wachowski",
        },
        {
          id: 10,
          title: "Blade Runner 2049",
          year: 2017,
          rating: 8.0,
          poster: "/placeholder.svg",
          director: "Denis Villeneuve",
        },
        {
          id: 11,
          title: "Arrival",
          year: 2016,
          rating: 7.9,
          poster: "/placeholder.svg",
          director: "Denis Villeneuve",
        },
        {
          id: 12,
          title: "Goodfellas",
          year: 1990,
          rating: 8.7,
          poster: "/placeholder.svg",
          director: "Martin Scorsese",
        },
        {
          id: 13,
          title: "Taxi Driver",
          year: 1976,
          rating: 8.2,
          poster: "/placeholder.svg",
          director: "Martin Scorsese",
        },
        {
          id: 14,
          title: "Fight Club",
          year: 1999,
          rating: 8.8,
          poster: "/placeholder.svg",
          director: "David Fincher",
        },
        {
          id: 15,
          title: "The Social Network",
          year: 2010,
          rating: 7.8,
          poster: "/placeholder.svg",
          director: "David Fincher",
        },
        {
          id: 16,
          title: "Parasite",
          year: 2019,
          rating: 8.5,
          poster: "/placeholder.svg",
          director: "Bong Joon-ho",
        },
        {
          id: 17,
          title: "Everything Everywhere All at Once",
          year: 2022,
          rating: 8.1,
          poster: "/placeholder.svg",
          director: "Daniel Kwan, Daniel Scheinert",
        },
        {
          id: 18,
          title: "The Grand Budapest Hotel",
          year: 2014,
          rating: 8.1,
          poster: "/placeholder.svg",
          director: "Wes Anderson",
        },
        {
          id: 19,
          title: "Mad Max: Fury Road",
          year: 2015,
          rating: 8.1,
          poster: "/placeholder.svg",
          director: "George Miller",
        },
        {
          id: 20,
          title: "The Shawshank Redemption",
          year: 1994,
          rating: 9.3,
          poster: "/placeholder.svg",
          director: "Frank Darabont",
        },
        {
          id: 21,
          title: "The Godfather",
          year: 1972,
          rating: 9.2,
          poster: "/placeholder.svg",
          director: "Francis Ford Coppola",
        },
        {
          id: 22,
          title: "The Godfather Part II",
          year: 1974,
          rating: 9.0,
          poster: "/placeholder.svg",
          director: "Francis Ford Coppola",
        },
        {
          id: 23,
          title: "Spirited Away",
          year: 2001,
          rating: 8.6,
          poster: "/placeholder.svg",
          director: "Hayao Miyazaki",
        },
        {
          id: 24,
          title: "Whiplash",
          year: 2014,
          rating: 8.5,
          poster: "/placeholder.svg",
          director: "Damien Chazelle",
        },
        {
          id: 25,
          title: "La La Land",
          year: 2016,
          rating: 8.0,
          poster: "/placeholder.svg",
          director: "Damien Chazelle",
        },
      ]

      const queryLower = query.toLowerCase()
      const results = mockMovies.filter((movie) => {
        const titleMatch = movie.title.toLowerCase().includes(queryLower)
        const directorMatch = movie.director?.toLowerCase().includes(queryLower) || false
        return titleMatch || directorMatch
      })

      return Response.json({ results })
    }
  } catch (error) {
    console.error("TMDB API Error:", error)
    return Response.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}
