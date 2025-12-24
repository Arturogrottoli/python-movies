const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const movie = await request.json()
    const authHeader = request.headers.get("authorization")
    console.log("🔍 [Next.js Proxy] Authorization header:", authHeader ? `${authHeader.substring(0, 50)}...` : "NOT FOUND")

    if (!authHeader) {
      return Response.json({ error: "Authorization header is required" }, { status: 401 })
    }

    console.log("🔍 [Next.js Proxy] Forwarding to backend:", `${API_BASE_URL}/api/movies/add-watchlist`)
    const response = await fetch(`${API_BASE_URL}/api/movies/add-watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        title: movie.title,
        year: movie.year,
        rating: movie.rating || 0,
        poster: movie.poster || "/placeholder.svg",
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }))
      return Response.json({ error: error.detail || "Failed to add movie" }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error adding movie:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return Response.json({ error: "El backend no está corriendo. Por favor, inicia el servidor Python en el puerto 8000." }, { status: 503 })
    }
    return Response.json({ error: "Failed to add movie" }, { status: 500 })
  }
}
