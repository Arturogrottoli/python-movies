from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import sqlite3
import os
import bcrypt
from jose import JWTError, jwt
from points_calculator import calculate_bonus_points, apply_bonus_points, get_daily_stats, get_streak
from google_drive_export import export_to_google_sheets, export_to_csv


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

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

# JWT configuration
SECRET_KEY = "super-secret-key-fixed-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()


class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str


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


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    print(f"🔐 [Backend] Creating token with payload: {to_encode}")
    print(f"🔐 [Backend] SECRET_KEY used to create token: {SECRET_KEY[:20]}... (length: {len(SECRET_KEY)})")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"🔐 [Backend] Token created (first 50 chars): {encoded_jwt[:50]}...")
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get the current authenticated user from JWT token"""
    print("🔐 [Backend] get_current_user called")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"🔐 [Backend] credentials object: {credentials}")
        if not credentials:
            print("🔐 [Backend] ❌ No credentials received")
            raise credentials_exception
        token = credentials.credentials
        print(f"🔐 [Backend] Token extracted from credentials: {token[:50] if token else 'None'}...")
        if not token:
            print("🔐 [Backend] ❌ Empty token")
            raise credentials_exception
        
        print(f"🔐 [Backend] Validating token (first 50 chars): {token[:50]}...")
        print(f"🔐 [Backend] SECRET_KEY used: {SECRET_KEY[:20]}... (length: {len(SECRET_KEY)})")
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            print(f"🔐 [Backend] ✅ Payload decoded: {payload}")
        except JWTError as e:
            error_msg = str(e)
            if "expired" in error_msg.lower() or "exp" in error_msg.lower():
                print("🔐 [Backend] ❌ Token expired")
            else:
                print(f"🔐 [Backend] ❌ Invalid token: {type(e).__name__}: {e}")
                print(f"🔐 [Backend] 💡 Tip: Token may have been created with a different SECRET_KEY. Please log out and log back in.")
            raise credentials_exception
        
        user_id = payload.get("sub")
        print(f"🔐 [Backend] User ID extracted from payload: {user_id} (type: {type(user_id).__name__})")
        
        if user_id is None:
            print("🔐 [Backend] ❌ user_id is None in payload")
            raise credentials_exception
        
        # Convertir user_id a int (jose devuelve el sub como string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        elif not isinstance(user_id, int):
            user_id = int(user_id)
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"🔐 [Backend] ❌ Unexpected error validating token: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise credentials_exception

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user is None:
        print(f"🔐 [Backend] ERROR: User with ID {user_id} not found in database")
        raise credentials_exception

    print(f"🔐 [Backend] ✅ User authenticated successfully: {user['username']} (ID: {user['id']})")
    return {"id": user["id"], "username": user["username"]}


def init_db():
    """Initialize database with tables"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
    except sqlite3.OperationalError:
        pass

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            year INTEGER,
            rating FLOAT,
            poster TEXT,
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """
    )

    cursor.execute("PRAGMA table_info(movies)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "user_id" not in columns:
        try:
            cursor.execute("ALTER TABLE movies ADD COLUMN user_id INTEGER")
            cursor.execute("DELETE FROM movies WHERE user_id IS NULL")
            conn.commit()
        except sqlite3.OperationalError:
            pass

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

    cursor.execute("PRAGMA table_info(movies)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "user_id" not in columns:
        try:
            cursor.execute("ALTER TABLE movies ADD COLUMN user_id INTEGER")
            cursor.execute("DELETE FROM movies WHERE user_id IS NULL")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    try:
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_movies_user_id ON movies(user_id)
        """
        )
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()


@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE username = ?", (user_data.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        password_hash = hash_password(user_data.password)
        cursor.execute(
            """
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        """,
            (user_data.username, password_hash),
        )

        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        access_token = create_access_token(data={"sub": str(user_id)})
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user_id, "username": user_data.username},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    """Login and get access token"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (user_data.username,))
        user = cursor.fetchone()
        conn.close()

        if not user or not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect username or password")

        access_token = create_access_token(data={"sub": str(user["id"])})
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user["id"], "username": user["username"]},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@app.post("/api/movies/add-watchlist")
async def add_to_watchlist(movie: Movie, current_user: dict = Depends(get_current_user)):
    """Add movie to watchlist"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO movies (user_id, title, year, rating, poster)
            VALUES (?, ?, ?, ?, ?)
        """,
            (current_user["id"], movie.title, movie.year, movie.rating, movie.poster),
        )

        conn.commit()
        movie_id = cursor.lastrowid
        conn.close()

        return {"success": True, "movie_id": movie_id, "message": "Movie added to watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/movies/{movie_id}")
async def remove_from_watchlist(movie_id: int, current_user: dict = Depends(get_current_user)):
    """Remove movie from watchlist"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id FROM movies WHERE id = ? AND user_id = ?
        """,
            (movie_id, current_user["id"]),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Movie not found")

        cursor.execute(
            """
            DELETE FROM movies WHERE id = ? AND user_id = ?
        """,
            (movie_id, current_user["id"]),
        )

        conn.commit()
        conn.close()

        return {"success": True, "message": "Movie removed from watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/movies/mark-watched")
async def mark_watched(movie_watched: MovieWatched, current_user: dict = Depends(get_current_user)):
    """Mark a movie as watched and earn points"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Check if movie exists and belongs to user
        cursor.execute("SELECT id FROM movies WHERE id = ? AND user_id = ?", (movie_watched.movie_id, current_user["id"]))
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
async def get_watchlist(current_user: dict = Depends(get_current_user)):
    """Get all unwatched movies"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, title, year, rating, poster, added_date
            FROM movies
            WHERE user_id = ? AND id NOT IN (SELECT movie_id FROM watched_movies)
            ORDER BY added_date DESC
        """,
            (current_user["id"],),
        )

        movies = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/movies/watched")
async def get_watched_movies(current_user: dict = Depends(get_current_user)):
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
            WHERE m.user_id = ?
            ORDER BY w.date_watched DESC
        """,
            (current_user["id"],),
        )

        movies = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/total-points")
async def get_total_points(current_user: dict = Depends(get_current_user)):
    """Get total points earned"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT SUM(w.points_earned) as total
            FROM watched_movies w
            JOIN movies m ON w.movie_id = m.id
            WHERE m.user_id = ?
        """,
            (current_user["id"],),
        )
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


@app.get("/api/leaderboard")
async def get_leaderboard(period: str = "all_time"):
    """
    Get leaderboard of all users
    period: 'week', 'month', 'year', 'all_time'
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Calculate date filter based on period
        if period == "week":
            date_filter = "datetime('now', '-7 days')"
        elif period == "month":
            date_filter = "datetime('now', '-1 month')"
        elif period == "year":
            date_filter = "datetime('now', '-1 year')"
        else:  # all_time
            date_filter = "datetime('1970-01-01')"
        
        query = """
            SELECT 
                u.id,
                u.username,
                COALESCE(SUM(w.points_earned), 0) as total_points,
                COUNT(DISTINCT w.movie_id) as movies_watched
            FROM users u
            LEFT JOIN movies m ON u.id = m.user_id
            LEFT JOIN watched_movies w ON m.id = w.movie_id 
                AND datetime(w.date_watched) >= """ + date_filter + """
            GROUP BY u.id, u.username
            ORDER BY total_points DESC, movies_watched DESC, u.username ASC
            LIMIT 100
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        leaderboard = []
        for idx, row in enumerate(results, 1):
            leaderboard.append({
                "rank": idx,
                "user_id": row["id"],
                "username": row["username"],
                "total_points": row["total_points"],
                "movies_watched": row["movies_watched"]
            })
        
        return {"leaderboard": leaderboard, "period": period}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
