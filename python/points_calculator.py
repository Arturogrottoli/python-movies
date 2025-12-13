from datetime import datetime, timedelta
import sqlite3

DB_PATH = "movies.db"


def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def calculate_bonus_points(movie_id: int) -> dict:
    """
    Calculate bonus points for a movie based on:
    - Multiple movies watched in one day (+25 bonus)
    - Movie watched within 7 days of adding (+30 bonus)
    - Movie watched same day as adding (+50 bonus)
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Get movie info
        cursor.execute(
            """
            SELECT m.id, m.added_date, w.date_watched
            FROM movies m
            JOIN watched_movies w ON m.id = w.movie_id
            WHERE m.id = ?
        """,
            (movie_id,),
        )

        result = cursor.fetchone()
        if not result:
            return {"bonus": 0, "reason": "Movie not found"}

        added_date = datetime.fromisoformat(result["added_date"])
        watched_date = datetime.fromisoformat(result["date_watched"])

        bonus = 0
        reasons = []

        # Bonus 1: Watched same day as added
        if added_date.date() == watched_date.date():
            bonus += 50
            reasons.append("watched_same_day")

        # Bonus 2: Watched within 7 days of adding
        elif (watched_date - added_date).days <= 7:
            bonus += 30
            reasons.append("watched_within_week")

        # Bonus 3: Multiple movies watched in one day
        cursor.execute(
            """
            SELECT COUNT(*) as count
            FROM watched_movies
            WHERE DATE(date_watched) = DATE(?)
        """,
            (watched_date,),
        )

        movies_today = cursor.fetchone()["count"]
        if movies_today >= 3:
            bonus += 25
            reasons.append(f"multiple_movies_day_{movies_today}")

        conn.close()

        return {"bonus": bonus, "reasons": reasons, "total_with_bonus": 50 + bonus}
    except Exception as e:
        return {"bonus": 0, "error": str(e)}


def apply_bonus_points(movie_id: int) -> bool:
    """Apply calculated bonus points to a movie"""
    try:
        bonus_data = calculate_bonus_points(movie_id)

        if bonus_data.get("bonus", 0) > 0:
            conn = get_db()
            cursor = conn.cursor()

            # Update base points if bonus exists
            cursor.execute(
                """
                UPDATE watched_movies
                SET points_earned = ?
                WHERE movie_id = ?
            """,
                (50 + bonus_data["bonus"], movie_id),
            )

            # Log bonus reason
            reason = ", ".join(bonus_data.get("reasons", []))
            cursor.execute(
                """
                INSERT INTO user_points (movie_id, points, bonus_reason)
                VALUES (?, ?, ?)
            """,
                (movie_id, bonus_data["bonus"], reason),
            )

            conn.commit()
            conn.close()
            return True

        return False
    except Exception as e:
        print(f"Error applying bonus points: {e}")
        return False


def get_daily_stats():
    """Get movies watched today and total points today"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        today = datetime.now().date()

        cursor.execute(
            """
            SELECT COUNT(*) as count, SUM(points_earned) as total_points
            FROM watched_movies
            WHERE DATE(date_watched) = ?
        """,
            (today,),
        )

        result = cursor.fetchone()
        conn.close()

        return {
            "movies_today": result["count"] or 0,
            "points_today": result["total_points"] or 0,
        }
    except Exception as e:
        return {"error": str(e)}


def get_streak():
    """Get current watching streak (consecutive days with movies watched)"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT DISTINCT DATE(date_watched) as watched_date
            FROM watched_movies
            ORDER BY watched_date DESC
        """
        )

        dates = [row["watched_date"] for row in cursor.fetchall()]
        conn.close()

        if not dates:
            return {"streak": 0}

        streak = 1
        for i in range(len(dates) - 1):
            current = datetime.fromisoformat(dates[i]).date()
            next_date = datetime.fromisoformat(dates[i + 1]).date()

            if (current - next_date).days == 1:
                streak += 1
            else:
                break

        return {"streak": streak, "last_watched": dates[0]}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    # Test the points calculator
    print("Daily Stats:", get_daily_stats())
    print("Streak:", get_streak())
