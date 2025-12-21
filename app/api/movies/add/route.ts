const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const movie = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/movies/add-watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: movie.title,
        year: movie.year,
        rating: movie.rating || 0,
        poster: movie.poster || "/placeholder.svg",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return Response.json({ error: error.detail || "Failed to add movie" }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error adding movie:", error)
    return Response.json({ error: "Failed to add movie" }, { status: 500 })
  }
}
