from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sqlite3
import os
from points_calculator import calculate_bonus_points, apply_bonus_points, get_daily_stats, get_streak
from google_drive_export import export_to_google_sheets, export_to_csv

app = FastAPI()

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_PATH = "movies.db"


class Movie(BaseModel):
    title: str
    year: int
    rating: float
    poster: str


class MovieWatched(BaseModel):
    movie_id: int
    date_watched: str = None


def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database with tables"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            year INTEGER,
            rating FLOAT,
            poster TEXT,
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS watched_movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL,
            date_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            points_earned INTEGER DEFAULT 50,
            FOREIGN KEY(movie_id) REFERENCES movies(id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL,
            points INTEGER DEFAULT 0,
            bonus_reason TEXT,
            date_earned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(movie_id) REFERENCES watched_movies(id)
        )
    """
    )

    conn.commit()
    conn.close()


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/api/movies/add-watchlist")
async def add_to_watchlist(movie: Movie):
    """Add movie to watchlist"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO movies (title, year, rating, poster)
            VALUES (?, ?, ?, ?)
        """,
            (movie.title, movie.year, movie.rating, movie.poster),
        )

        conn.commit()
        movie_id = cursor.lastrowid
        conn.close()

        return {"success": True, "movie_id": movie_id, "message": "Movie added to watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/movies/mark-watched")
async def mark_watched(movie_watched: MovieWatched):
    """Mark a movie as watched and earn points"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Check if movie exists
        cursor.execute("SELECT id FROM movies WHERE id = ?", (movie_watched.movie_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Movie not found")

        # Add to watched_movies
        watched_date = movie_watched.date_watched or datetime.now().isoformat()
        cursor.execute(
            """
            INSERT INTO watched_movies (movie_id, date_watched, points_earned)
            VALUES (?, ?, ?)
        """,
            (movie_watched.movie_id, watched_date, 50),
        )

        conn.commit()
        movie_id = cursor.lastrowid
        conn.close()

        # Calculate and apply bonus points
        bonus_data = calculate_bonus_points(movie_watched.movie_id)
        apply_bonus_points(movie_watched.movie_id)

        return {
            "success": True,
            "points_earned": 50,
            "bonus_points": bonus_data.get("bonus", 0),
            "total_points": bonus_data.get("total_with_bonus", 50),
            "bonus_reasons": bonus_data.get("reasons", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/movies/watchlist")
async def get_watchlist():
    """Get all unwatched movies"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, title, year, rating, poster, added_date
            FROM movies
            WHERE id NOT IN (SELECT movie_id FROM watched_movies)
            ORDER BY added_date DESC
        """
        )

        movies = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/movies/watched")
async def get_watched_movies():
    """Get all watched movies with points"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT m.id, m.title, m.year, m.rating, m.poster,
                   w.date_watched, w.points_earned
            FROM movies m
            JOIN watched_movies w ON m.id = w.movie_id
            ORDER BY w.date_watched DESC
        """
        )

        movies = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/total-points")
async def get_total_points():
    """Get total points earned"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT SUM(points_earned) as total FROM watched_movies")
        result = cursor.fetchone()
        total = result["total"] or 0

        conn.close()

        return {"total_points": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/summary")
async def get_stats_summary():
    """Get complete stats summary"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Total points
        cursor.execute("SELECT SUM(points_earned) as total FROM watched_movies")
        total_points = cursor.fetchone()["total"] or 0

        # Count movies
        cursor.execute("SELECT COUNT(*) as count FROM movies")
        total_movies = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM watched_movies")
        watched_count = cursor.fetchone()["count"]

        conn.close()

        return {
            "total_points": total_points,
            "total_movies": total_movies,
            "watched_movies": watched_count,
            "unwatched_movies": total_movies - watched_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/daily")
async def get_daily_stats_endpoint():
    """Get daily stats"""
    return get_daily_stats()


@app.get("/api/stats/streak")
async def get_streak_endpoint():
    """Get current watching streak"""
    return get_streak()


@app.post("/api/export/csv")
async def export_csv():
    """Export data to CSV file"""
    result = export_to_csv()
    if result.get("success"):
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get("error"))


@app.post("/api/export/google-sheets")
async def export_google_sheets():
    """Export data to Google Sheets"""
    result = export_to_google_sheets()
    if result.get("success"):
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get("error"))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
