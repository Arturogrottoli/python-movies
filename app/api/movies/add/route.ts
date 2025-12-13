export async function POST(request: Request) {
  try {
    const movie = await request.json()

    // TODO: Save to database when DB is implemented
    console.log("[v0] Adding movie to watchlist:", movie)

    return Response.json({
      success: true,
      message: "Movie added to watchlist",
      movie,
    })
  } catch (error) {
    console.error("[v0] Error adding movie:", error)
    return Response.json({ error: "Failed to add movie" }, { status: 500 })
  }
}
