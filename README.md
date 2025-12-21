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

## 📥 Instalación desde GitHub

### Paso 1: Clonar el repositorio

Abre una terminal (o PowerShell en Windows, Terminal en Mac/Linux) y ejecuta:

```bash
git clone https://github.com/tu-usuario/python-movies.git
cd python-movies
```

> ⚠️ **Nota**: Reemplaza `tu-usuario` con el nombre de usuario de GitHub donde está alojado el repositorio.

### Paso 2: Configurar el Backend (Python)

1. **Navega a la carpeta de Python**:
   ```bash
   cd python
   ```

2. **Crea un entorno virtual** (recomendado):
   ```bash
   # En Windows
   python -m venv venv
   venv\Scripts\activate

   # En Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
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

### Paso 3: Configurar el Frontend (Next.js)

1. **Abre una nueva terminal** y vuelve a la raíz del proyecto:
   ```bash
   cd ..
   ```

2. **Instala las dependencias de Node.js**:
   ```bash
   npm install
   ```
   
   O si usas `pnpm` (que parece estar configurado en el proyecto):
   ```bash
   pnpm install
   ```

## ▶️ Cómo Ejecutar el Proyecto

El proyecto tiene dos partes que deben ejecutarse simultáneamente:

### Opción A: Ejecutar en Terminales Separadas (Recomendado)

**Terminal 1 - Backend (Python/FastAPI):**

```bash
cd python
# Activa el entorno virtual si no está activo
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

python main.py
```

Verás un mensaje como:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Frontend (Next.js):**

```bash
# Desde la raíz del proyecto
npm run dev
# o
pnpm dev
```

Verás un mensaje como:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

### Opción B: Usar el Script de Ejecución (si existe)

Si hay un script `run.sh` o similar, puedes ejecutarlo:
```bash
cd python
bash run.sh
```

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

