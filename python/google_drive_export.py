"""
Google Drive Export Module

Este módulo permite exportar los datos de películas a Google Sheets y CSV.
Requiere configuración de credenciales de Google Cloud para funcionar.
"""
import sqlite3
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
from google.oauth2 import service_account
import gspread
from gspread.exceptions import APIError, SpreadsheetNotFound

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = "movies.db"

# Google Sheets API scopes
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def get_db():
    """
    Obtiene una conexión a la base de datos SQLite.
    
    Returns:
        sqlite3.Connection: Conexión a la base de datos
    """
    if not os.path.exists(DB_PATH):
        logger.warning(f"Database file {DB_PATH} not found. It will be created on first use.")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_google_client(credentials_path: str = "credentials.json"):
    """
    Obtiene un cliente autenticado de Google Sheets.
    
    Args:
        credentials_path: Ruta al archivo JSON de credenciales de Google Cloud
        
    Returns:
        gspread.Client: Cliente autenticado de Google Sheets
        
    Raises:
        FileNotFoundError: Si el archivo de credenciales no existe
        Exception: Si hay un error en la autenticación
    """
    credentials_file = Path(credentials_path)
    
    if not credentials_file.exists():
        error_msg = (
            f"Archivo de credenciales '{credentials_path}' no encontrado. "
            "Por favor, sigue las instrucciones en GOOGLE_SETUP.md para configurar "
            "la autenticación de Google."
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    try:
        credentials = service_account.Credentials.from_service_account_file(
            str(credentials_file), scopes=SCOPES
        )
        client = gspread.authorize(credentials)
        logger.info("Cliente de Google Sheets autenticado exitosamente")
        return client
    except Exception as e:
        error_msg = f"Error al autenticar con Google Sheets: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg) from e


def export_to_google_sheets(spreadsheet_name: str = "Movie Points Tracker") -> Dict:
    """
    Exporta todos los datos de películas a Google Sheets.
    
    Crea o actualiza una hoja de cálculo con tres pestañas:
    - Películas Vistas: Lista de películas ya vistas con puntos
    - Mi Lista: Películas agregadas pero no vistas
    - Resumen: Estadísticas generales
    
    Args:
        spreadsheet_name: Nombre de la hoja de cálculo en Google Sheets
        
    Returns:
        Dict: Diccionario con el resultado de la operación:
            - success: bool indicando si fue exitoso
            - message: Mensaje descriptivo
            - url: URL de la hoja de cálculo (si fue exitoso)
            - spreadsheet_id: ID de la hoja de cálculo (si fue exitoso)
            - error: Mensaje de error (si falló)
    """
    try:
        logger.info(f"Iniciando exportación a Google Sheets: {spreadsheet_name}")
        
        # Obtener cliente de Google
        client = get_google_client()

        # Obtener datos de la base de datos
        conn = get_db()
        cursor = conn.cursor()

        try:
            # Obtener películas vistas
            cursor.execute(
                """
                SELECT m.title, m.year, m.rating, w.date_watched, w.points_earned
                FROM movies m
                JOIN watched_movies w ON m.id = w.movie_id
                ORDER BY w.date_watched DESC
            """
            )
            watched_movies = [dict(row) for row in cursor.fetchall()]
            logger.info(f"Se encontraron {len(watched_movies)} películas vistas")

            # Obtener películas no vistas
            cursor.execute(
                """
                SELECT title, year, rating, added_date
                FROM movies
                WHERE id NOT IN (SELECT movie_id FROM watched_movies)
                ORDER BY added_date DESC
            """
            )
            unwatched_movies = [dict(row) for row in cursor.fetchall()]
            logger.info(f"Se encontraron {len(unwatched_movies)} películas por ver")

            # Obtener puntos totales
            cursor.execute("SELECT SUM(points_earned) as total FROM watched_movies")
            total_points = cursor.fetchone()["total"] or 0
            logger.info(f"Total de puntos: {total_points}")
            
        finally:
            conn.close()

        # Crear o obtener la hoja de cálculo
        try:
            spreadsheet = client.open(spreadsheet_name)
            logger.info(f"Hoja de cálculo existente encontrada: {spreadsheet_name}")
        except SpreadsheetNotFound:
            spreadsheet = client.create(spreadsheet_name)
            logger.info(f"Nueva hoja de cálculo creada: {spreadsheet_name}")

        # Limpiar hojas existentes excepto la primera
        existing_sheets = spreadsheet.worksheets()
        sheets_to_keep = ["Sheet1"]
        for sheet in existing_sheets:
            if sheet.title not in sheets_to_keep:
                try:
                    spreadsheet.del_worksheet(sheet)
                except Exception as e:
                    logger.warning(f"No se pudo eliminar la hoja {sheet.title}: {e}")

        # Crear/Actualizar hoja de Películas Vistas
        try:
            watched_sheet = spreadsheet.worksheet("Sheet1")
            watched_sheet.update_title("Películas Vistas")
        except Exception:
            watched_sheet = spreadsheet.add_worksheet(title="Películas Vistas", rows=100, cols=5)

        watched_headers = ["Película", "Año", "Rating", "Fecha Vista", "Puntos"]
        watched_data = [watched_headers]
        for movie in watched_movies:
            watched_data.append([
                movie.get("title", ""),
                movie.get("year", ""),
                movie.get("rating", ""),
                movie.get("date_watched", ""),
                movie.get("points_earned", 0),
            ])

        watched_sheet.clear()
        if watched_data:
            watched_sheet.append_rows(watched_data)
            # Agregar fila de total
            watched_sheet.append_row(["", "", "", "TOTAL", total_points])

        # Formatear encabezados
        try:
            watched_sheet.format(
                "A1:E1",
                {
                    "backgroundColor": {"red": 0.7, "green": 0.15, "blue": 0.55},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                },
            )
        except Exception as e:
            logger.warning(f"Error al formatear encabezados: {e}")

        # Crear/Actualizar hoja de Mi Lista
        try:
            unwatched_sheet = spreadsheet.worksheet("Mi Lista")
            unwatched_sheet.clear()
        except SpreadsheetNotFound:
            unwatched_sheet = spreadsheet.add_worksheet(title="Mi Lista", rows=100, cols=4)

        unwatched_headers = ["Película", "Año", "Rating", "Fecha Agregada"]
        unwatched_data = [unwatched_headers]
        for movie in unwatched_movies:
            unwatched_data.append([
                movie.get("title", ""),
                movie.get("year", ""),
                movie.get("rating", ""),
                movie.get("added_date", ""),
            ])

        if unwatched_data:
            unwatched_sheet.append_rows(unwatched_data)

        # Formatear encabezados de Mi Lista
        try:
            unwatched_sheet.format(
                "A1:D1",
                {
                    "backgroundColor": {"red": 0.65, "green": 0.2, "blue": 0.2},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                },
            )
        except Exception as e:
            logger.warning(f"Error al formatear encabezados de Mi Lista: {e}")

        # Crear/Actualizar hoja de Resumen
        try:
            summary_sheet = spreadsheet.worksheet("Resumen")
            summary_sheet.clear()
        except SpreadsheetNotFound:
            summary_sheet = spreadsheet.add_worksheet(title="Resumen", rows=10, cols=2)

        avg_points = round(total_points / len(watched_movies), 2) if watched_movies else 0
        summary_data = [
            ["Estadísticas", "Valor"],
            ["Total Películas", len(watched_movies) + len(unwatched_movies)],
            ["Películas Vistas", len(watched_movies)],
            ["Películas por Ver", len(unwatched_movies)],
            ["Puntos Totales", total_points],
            ["Puntos Promedio por Película", avg_points],
        ]

        summary_sheet.append_rows(summary_data)

        # Formatear encabezados de Resumen
        try:
            summary_sheet.format(
                "A1:B1",
                {
                    "backgroundColor": {"red": 0.7, "green": 0.15, "blue": 0.55},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                },
            )
        except Exception as e:
            logger.warning(f"Error al formatear encabezados de Resumen: {e}")

        logger.info(f"Exportación completada exitosamente: {spreadsheet.url}")
        
        return {
            "success": True,
            "message": f"Datos exportados a Google Sheets: {spreadsheet.url}",
            "url": spreadsheet.url,
            "spreadsheet_id": spreadsheet.id,
        }

    except FileNotFoundError as e:
        error_msg = str(e)
        logger.error(f"Error de archivo no encontrado: {error_msg}")
        return {"success": False, "error": error_msg}
    except APIError as e:
        error_msg = f"Error de API de Google Sheets: {str(e)}"
        logger.error(error_msg)
        return {"success": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Error inesperado durante la exportación: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {"success": False, "error": error_msg}


def export_to_csv(filename: str = "movies_export.csv") -> Dict:
    """
    Exporta todos los datos de películas a un archivo CSV como respaldo.
    
    El archivo CSV contiene todas las películas (vistas y por ver) con su
    información y estado.
    
    Args:
        filename: Nombre del archivo CSV a crear
        
    Returns:
        Dict: Diccionario con el resultado de la operación:
            - success: bool indicando si fue exitoso
            - filename: Nombre del archivo creado (si fue exitoso)
            - message: Mensaje descriptivo
            - error: Mensaje de error (si falló)
    """
    import csv
    
    try:
        logger.info(f"Iniciando exportación a CSV: {filename}")
        
        conn = get_db()
        cursor = conn.cursor()

        try:
            # Obtener todas las películas (vistas y por ver)
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
            logger.info(f"Se encontraron {len(rows)} películas para exportar")
            
        finally:
            conn.close()

        # Escribir a CSV
        filepath = Path(filename)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Película", "Año", "Rating", "Fecha", "Puntos", "Estado"])

            for row in rows:
                writer.writerow(row)

        logger.info(f"Archivo CSV creado exitosamente: {filepath.absolute()}")
        
        return {
            "success": True,
            "filename": str(filepath.absolute()),
            "message": f"Datos exportados a {filename}",
        }
    except sqlite3.Error as e:
        error_msg = f"Error de base de datos: {str(e)}"
        logger.error(error_msg)
        return {"success": False, "error": error_msg}
    except IOError as e:
        error_msg = f"Error de escritura de archivo: {str(e)}"
        logger.error(error_msg)
        return {"success": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Error inesperado durante la exportación CSV: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {"success": False, "error": error_msg}


if __name__ == "__main__":
    """
    Ejecuta pruebas de exportación cuando se corre el script directamente.
    """
    print("=" * 60)
    print("Prueba de Exportación de Datos")
    print("=" * 60)
    
    # Probar exportación a CSV (no requiere autenticación)
    print("\n1. Probando exportación a CSV...")
    csv_result = export_to_csv()
    if csv_result.get("success"):
        print(f"✓ CSV exportado exitosamente: {csv_result.get('filename')}")
    else:
        print(f"✗ Error en exportación CSV: {csv_result.get('error')}")
    
    # Para Google Sheets, necesitas configurar autenticación primero
    print("\n2. Probando exportación a Google Sheets...")
    print("   (Nota: Requiere archivo credentials.json configurado)")
    
    credentials_file = Path("credentials.json")
    if credentials_file.exists():
        sheets_result = export_to_google_sheets()
        if sheets_result.get("success"):
            print(f"✓ Datos exportados a Google Sheets")
            print(f"  URL: {sheets_result.get('url')}")
        else:
            print(f"✗ Error en exportación a Google Sheets: {sheets_result.get('error')}")
    else:
        print("  ⚠ Archivo credentials.json no encontrado.")
        print("  Consulta GOOGLE_SETUP.md para configurar la autenticación.")
    
    print("\n" + "=" * 60)
