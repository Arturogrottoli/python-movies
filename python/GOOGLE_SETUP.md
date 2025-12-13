# Google Sheets Export Setup

Para usar la exportación a Google Sheets, necesitas configurar la autenticación de Google Cloud:

## 1. Crear un Proyecto en Google Cloud

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto
3. Activa las APIs:
   - Google Sheets API
   - Google Drive API

## 2. Crear una Cuenta de Servicio

1. Ve a "Credenciales" en Google Cloud Console
2. Selecciona "Crear credenciales" > "Cuenta de servicio"
3. Completa los detalles
4. En la sección de claves, crea una clave JSON
5. Descarga el archivo JSON y guárdalo como `credentials.json` en la carpeta `python/`

## 3. Compartir el Google Sheet

La cuenta de servicio necesita acceso a los Sheets que va a crear. Cuando crees el primer Sheet, se creará automáticamente en tu Google Drive.

## Uso

\`\`\`python
from google_drive_export import export_to_google_sheets

result = export_to_google_sheets("Mi Tracker de Películas")
print(result)
# Output: {"success": true, "url": "https://docs.google.com/spreadsheets/d/...", ...}
\`\`\`

O usa el endpoint REST:
\`\`\`bash
curl -X POST http://localhost:8000/api/export/google-sheets
