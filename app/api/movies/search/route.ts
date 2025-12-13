export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return Response.json({ results: [] })
  }

  try {
    // Mock data for now - replace with real TMDB API call
    // When you have TMDB API key, replace this with:
    // const response = await fetch(
    //   `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${process.env.TMDB_API_KEY}`
    // )

    const mockMovies = [
      {
        id: 1,
        title: "Oppenheimer",
        year: 2023,
        rating: 8.5,
        poster: "/oppenheimer.jpg",
      },
      {
        id: 2,
        title: "The Killers of the Flower Moon",
        year: 2023,
        rating: 8.0,
        poster: "/killers-flower-moon.jpg",
      },
      {
        id: 3,
        title: "Dune: Part Two",
        year: 2024,
        rating: 8.3,
        poster: "/dune-part-two.jpg",
      },
      {
        id: 4,
        title: "Inception",
        year: 2010,
        rating: 8.8,
        poster: "/placeholder.svg",
      },
      {
        id: 5,
        title: "Interstellar",
        year: 2014,
        rating: 8.7,
        poster: "/placeholder.svg",
      },
    ]

    const results = mockMovies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()))

    return Response.json({ results })
  } catch (error) {
    console.error("[v0] TMDB API Error:", error)
    return Response.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}
