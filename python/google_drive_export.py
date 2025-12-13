import sqlite3
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.oauth2 import service_account
import gspread
import os

DB_PATH = "movies.db"

# Google Sheets API scopes
SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]


def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_google_client(credentials_path: str = "credentials.json"):
    """
    Get authenticated Google Sheets client
    Note: You need to create a service account in Google Cloud Console
    and download the credentials.json file
    """
    try:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        client = gspread.authorize(credentials)
        return client
    except FileNotFoundError:
        raise Exception(
            "credentials.json not found. Please follow instructions to set up Google authentication."
        )


def export_to_google_sheets(spreadsheet_name: str = "Movie Points Tracker"):
    """
    Export all movie data to Google Sheets
    """
    try:
        client = get_google_client()

        # Get all data from database
        conn = get_db()
        cursor = conn.cursor()

        # Get watched movies
        cursor.execute(
            """
            SELECT m.title, m.year, m.rating, w.date_watched, w.points_earned
            FROM movies m
            JOIN watched_movies w ON m.id = w.movie_id
            ORDER BY w.date_watched DESC
        """
        )

        watched_movies = [dict(row) for row in cursor.fetchall()]

        # Get unwatched movies
        cursor.execute(
            """
            SELECT title, year, rating, added_date
            FROM movies
            WHERE id NOT IN (SELECT movie_id FROM watched_movies)
            ORDER BY added_date DESC
        """
        )

        unwatched_movies = [dict(row) for row in cursor.fetchall()]

        # Get total stats
        cursor.execute("SELECT SUM(points_earned) as total FROM watched_movies")
        total_points = cursor.fetchone()["total"] or 0

        conn.close()

        # Create or get spreadsheet
        try:
            spreadsheet = client.open(spreadsheet_name)
        except gspread.SpreadsheetNotFound:
            # Create new spreadsheet
            spreadsheet = client.create(spreadsheet_name)
            # Share with yourself (optional)

        # Clear existing sheets
        for sheet in spreadsheet.worksheets():
            if sheet.title != "Películas Vistas":
                spreadsheet.del_worksheet(sheet)

        # Watched Movies Sheet
        watched_sheet = spreadsheet.worksheet("Sheet1")
        watched_sheet.update_title("Películas Vistas")

        watched_headers = ["Película", "Año", "Rating", "Fecha Vista", "Puntos"]
        watched_data = [watched_headers]
        for movie in watched_movies:
            watched_data.append(
                [
                    movie["title"],
                    movie["year"],
                    movie["rating"],
                    movie["date_watched"],
                    movie["points_earned"],
                ]
            )

        watched_sheet.clear()
        watched_sheet.append_rows(watched_data)

        # Add total row
        watched_sheet.append_row(["", "", "", "TOTAL", total_points])

        # Format header row
        watched_sheet.format(
            "A1:E1",
            {
                "backgroundColor": {"red": 0.7, "green": 0.15, "blue": 0.55},
                "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
            },
        )

        # Unwatched Movies Sheet
        unwatched_sheet = spreadsheet.add_worksheet(title="Mi Lista", rows=100, cols=4)

        unwatched_headers = ["Película", "Año", "Rating", "Fecha Agregada"]
        unwatched_data = [unwatched_headers]
        for movie in unwatched_movies:
            unwatched_data.append([movie["title"], movie["year"], movie["rating"], movie["added_date"]])

        unwatched_sheet.append_rows(unwatched_data)

        # Format header row
        unwatched_sheet.format(
            "A1:D1",
            {
                "backgroundColor": {"red": 0.65, "green": 0.2, "blue": 0.2},
                "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
            },
        )

        # Summary Sheet
        summary_sheet = spreadsheet.add_worksheet(title="Resumen", rows=10, cols=2)

        summary_data = [
            ["Estadísticas", "Valor"],
            ["Total Películas", len(watched_movies) + len(unwatched_movies)],
            ["Películas Vistas", len(watched_movies)],
            ["Películas por Ver", len(unwatched_movies)],
            ["Puntos Totales", total_points],
            ["Puntos Promedio por Película", round(total_points / len(watched_movies), 2) if watched_movies else 0],
        ]

        summary_sheet.append_rows(summary_data)

        # Format summary sheet
        summary_sheet.format(
            "A1:B1",
            {
                "backgroundColor": {"red": 0.7, "green": 0.15, "blue": 0.55},
                "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
            },
        )

        return {
            "success": True,
            "message": f"Data exported to Google Sheets: {spreadsheet.url}",
            "url": spreadsheet.url,
            "spreadsheet_id": spreadsheet.id,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def export_to_csv(filename: str = "movies_export.csv"):
    """
    Export data to CSV as backup
    """
    try:
        import csv

        conn = get_db()
        cursor = conn.cursor()

        # Get all data
        cursor.execute(
            """
            SELECT m.title, m.year, m.rating, w.date_watched, w.points_earned, 'Visto' as status
            FROM movies m
            JOIN watched_movies w ON m.id = w.movie_id
            UNION ALL
            SELECT title, year, rating, added_date, 0, 'Por Ver'
            FROM movies
            WHERE id NOT IN (SELECT movie_id FROM watched_movies)
        """
        )

        rows = cursor.fetchall()
        conn.close()

        # Write to CSV
        with open(filename, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Película", "Año", "Rating", "Fecha", "Puntos", "Estado"])

            for row in rows:
                writer.writerow(row)

        return {"success": True, "filename": filename, "message": f"Data exported to {filename}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    # Test export to CSV (no authentication needed)
    csv_result = export_to_csv()
    print("CSV Export:", csv_result)

    # For Google Sheets, you'll need to set up authentication first
    # print("Google Sheets Export:", export_to_google_sheets())
