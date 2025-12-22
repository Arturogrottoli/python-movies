# 🎬 Movie Points Tracker

Un juego interactivo para anotar las películas que quieres ver y sumar puntos a medida que las vas viendo. Convierte tu hábito de ver películas en una experiencia gamificada donde cada película vista te da puntos y bonificaciones especiales.

## 📖 ¿Qué es este proyecto?

**Movie Points Tracker** es una aplicación web que te permite:

- 📝 **Agregar películas a tu lista**: Busca y agrega películas que quieres ver
- ✅ **Marcar como vistas**: Cuando termines de ver una película, márcala y gana puntos
- 🏆 **Sistema de puntos**:
  - **50 puntos base** por cada película vista
  - **+50 puntos bonus** si la ves el mismo día que la agregaste
  - **+30 puntos bonus** si la ves dentro de los 7 días siguientes
  - **+25 puntos bonus** si ves 3 o más películas en un mismo día
- 📊 **Estadísticas**: Visualiza tus puntos totales, racha de días viendo películas y estadísticas diarias
- 💾 **Exportar datos**: Exporta tus datos a CSV o Google Sheets

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **Python** (versión 3.9 o superior) - [Descargar](https://www.python.org/downloads/)
- **Git** - [Descargar](https://git-scm.com/downloads)
- Un navegador web moderno (Chrome, Firefox, Edge, etc.)

## 📥 Instalación

### Si clonas desde GitHub

Abre una terminal y ejecuta:

```bash
git clone https://github.com/tu-usuario/python-movies.git
cd python-movies
```

> ⚠️ **Nota**: Reemplaza `tu-usuario` con el nombre de usuario de GitHub donde está alojado el repositorio.

### Paso 1: Instalar dependencias del Frontend (Next.js)

Desde la raíz del proyecto, ejecuta:

```bash
npm install
```

O si usas `pnpm`:

```bash
pnpm install
```

### Paso 2: Configurar el Backend (Python)

1. **Navega a la carpeta de Python**:

   ```bash
   cd python
   ```

2. **Activa el entorno virtual**:

   Si el entorno virtual ya existe (carpeta `venv`), solo actívalo:

   ```bash
   # En Mac/Linux
   source venv/bin/activate

   # En Windows
   venv\Scripts\activate
   ```

   Si el entorno virtual NO existe, créalo primero:

   ```bash
   # En Mac/Linux
   python3 -m venv venv
   source venv/bin/activate

   # En Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Instala las dependencias**:

   ```bash
   pip install -r requirements.txt
   ```

   Esto instalará todas las librerías necesarias:

   - FastAPI (framework web)
   - SQLite (base de datos)
   - Google APIs (para exportación a Google Sheets)
   - Y otras dependencias necesarias

### Paso 3: Configurar API Key de TMDB (Requerido)

La aplicación requiere una API key de TMDB (The Movie Database) para buscar películas. Sigue estos pasos:

#### 1. Obtener tu API Key

1. Ve a [The Movie Database](https://www.themoviedb.org/) y crea una cuenta gratuita o inicia sesión
2. Navega a [Settings → API](https://www.themoviedb.org/settings/api)
3. Haz clic en **"Request an API Key"**
4. Completa el formulario:
   - **Tipo**: Selecciona "Developer"
   - **Aplicación**: Movie Points Tracker (o el nombre que prefieras)
   - **URL**: `http://localhost:3000`
   - **Descripción**: Aplicación para trackear películas y puntos
5. Acepta los términos y condiciones
6. Copia la **"Clave de la API"** (API Key) que te proporcionen

#### 2. Configurar la API Key en el proyecto

Crea un archivo `.env.local` en la raíz del proyecto (misma carpeta que `package.json`) con el siguiente contenido:

```bash
TMDB_API_KEY=tu_api_key_aqui
```

Reemplaza `tu_api_key_aqui` con la API key que copiaste.

**Ejemplo:**

```bash
TMDB_API_KEY=36352c65fdc6621b11e5ea387a678ce7
```

> ⚠️ **Importante**:
>
> - El archivo `.env.local` ya está en `.gitignore`, así que tu API key no se subirá al repositorio
> - Después de crear o modificar `.env.local`, **debes reiniciar el servidor de Next.js** para que tome la nueva variable de entorno
> - La API key es gratuita y necesaria para que la búsqueda de películas funcione correctamente

## ▶️ Cómo Ejecutar el Proyecto

⚠️ **Importante**: El proyecto necesita DOS terminales abiertas simultáneamente (una para el backend y otra para el frontend).

### Terminal 1 - Backend (Python/FastAPI)

1. Navega a la carpeta `python`:

   ```bash
   cd python
   ```

2. Activa el entorno virtual (si no está activo):

   ```bash
   # Mac/Linux
   source venv/bin/activate

   # Windows
   venv\Scripts\activate
   ```

3. Ejecuta el servidor:

   ```bash
   python main.py
   ```

   Verás un mensaje como:

   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

   ⚠️ **Deja esta terminal corriendo** - no la cierres.

### Terminal 2 - Frontend (Next.js)

1. Abre una **nueva terminal** y navega a la raíz del proyecto:

   ```bash
   cd /ruta/a/python-movies
   ```

2. Ejecuta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   O si usas pnpm:

   ```bash
   pnpm dev
   ```

   Verás un mensaje como:

   ```
   - ready started server on 0.0.0.0:3000
   - Local:        http://localhost:3000
   ```

   ⚠️ **Deja esta terminal corriendo también** - no la cierres.

## 🌐 Acceder a la Aplicación

Una vez que ambos servidores estén corriendo:

1. Abre tu navegador
2. Ve a: **http://localhost:3000**

Deberías ver la interfaz de Movie Points Tracker con:

- Un encabezado mostrando tus puntos totales
- Secciones para buscar películas
- Tu lista de películas por ver
- Tu lista de películas vistas

## 🎮 Cómo Usar la Aplicación

### Agregar una Película

1. Usa la barra de búsqueda para buscar películas
2. Haz clic en "Agregar a mi lista" en la película que quieras
3. La película aparecerá en tu lista de "Por Ver"

### Marcar una Película como Vista

1. En tu lista de películas, encuentra la película que acabas de ver
2. Haz clic en "Marcar como Vista"
3. ¡Gana puntos automáticamente! El sistema calculará:
   - Puntos base (50 puntos)
   - Bonificaciones según las condiciones especiales

### Ver Estadísticas

- **Puntos Totales**: Se muestran en el encabezado
- **Racha de Días**: Días consecutivos viendo películas
- **Estadísticas Diarias**: Películas y puntos del día actual

## 📤 Exportar Datos

### Exportar a CSV

El backend incluye una función para exportar todos tus datos a un archivo CSV:

```bash
cd python
python google_drive_export.py
```

Esto creará un archivo `movies_export.csv` con todas tus películas.

O usa la API directamente:

```bash
curl -X POST http://localhost:8000/api/export/csv
```

### Exportar a Google Sheets (Opcional)

Para exportar a Google Sheets, necesitas configurar credenciales de Google Cloud:

1. Sigue las instrucciones en `python/GOOGLE_SETUP.md`
2. Descarga el archivo `credentials.json` y colócalo en la carpeta `python/`
3. Ejecuta la exportación:
   ```bash
   curl -X POST http://localhost:8000/api/export/google-sheets
   ```

## 🔧 Solución de Problemas

### El backend no inicia

- Verifica que Python esté instalado: `python --version`
- Asegúrate de haber activado el entorno virtual
- Verifica que las dependencias estén instaladas: `pip list`

### El frontend no inicia

- Verifica que Node.js esté instalado: `node --version`
- Asegúrate de haber ejecutado `npm install` o `pnpm install`
- Verifica que el puerto 3000 no esté en uso

### No puedo buscar películas

- Verifica que el backend esté corriendo en el puerto 8000
- Revisa la consola del navegador para errores
- Verifica que la API de búsqueda esté funcionando: `http://localhost:8000/api/health`

### La base de datos no se crea

La base de datos se crea automáticamente la primera vez que usas la aplicación. Si hay problemas:

- Verifica permisos de escritura en la carpeta `python/`
- Asegúrate de que el backend tenga acceso al directorio

## 📁 Estructura del Proyecto

```
python-movies/
├── app/                    # Frontend Next.js (páginas)
├── components/             # Componentes React
├── python/                 # Backend Python
│   ├── main.py            # API principal (FastAPI)
│   ├── google_drive_export.py  # Exportación a Google Sheets/CSV
│   ├── points_calculator.py    # Cálculo de puntos y bonificaciones
│   ├── requirements.txt   # Dependencias Python
│   ├── movies.db         # Base de datos SQLite (se crea automáticamente)
│   └── GOOGLE_SETUP.md   # Instrucciones para Google Sheets
├── package.json           # Dependencias Node.js
└── README.md             # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Backend

- **FastAPI**: Framework web moderno y rápido
- **SQLite**: Base de datos ligera y fácil de usar
- **Python 3.9+**: Lenguaje de programación

### Frontend

- **Next.js 16**: Framework React para aplicaciones web
- **React 19**: Librería para interfaces de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de estilos

## 📝 Notas Adicionales

- La base de datos (`movies.db`) se guarda localmente en tu computadora
- Todos tus datos están almacenados localmente, no se envían a servidores externos
- Para exportar a Google Sheets necesitas configurar credenciales de Google Cloud (opcional)
- El sistema de puntos está diseñado para motivarte a ver más películas y mantener rachas

## 🤝 Contribuir

Si quieres contribuir a este proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia que especifiques en tu repositorio.

## 💡 Ideas para Mejorar

- Agregar más sistemas de bonificación
- Integración con APIs de películas más completas
- Sistema de logros/badges
- Compartir estadísticas en redes sociales
- App móvil

---

¡Disfruta trackeando tus películas y acumulando puntos! 🎬✨
