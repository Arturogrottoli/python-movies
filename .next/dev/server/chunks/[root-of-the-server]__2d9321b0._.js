module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/movies/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query) {
        return Response.json({
            results: []
        });
    }
    if (!TMDB_API_KEY) {
        return Response.json({
            results: [],
            error: "TMDB_API_KEY no está configurada. Por favor, crea un archivo .env.local con tu API key de TMDB."
        }, {
            status: 400
        });
    }
    try {
        const [movieResponse, personResponse] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`)
        ]);
        if (!movieResponse.ok && !personResponse.ok) {
            console.error("TMDB API error:", movieResponse.status, personResponse.status);
            throw new Error("TMDB API request failed");
        }
        const movieResults = movieResponse.ok ? await movieResponse.json() : {
            results: []
        };
        const personResults = personResponse.ok ? await personResponse.json() : {
            results: []
        };
        const directorIds = new Set();
        personResults.results.forEach((person)=>{
            if (person.known_for_department === "Directing") {
                directorIds.add(person.id);
            }
        });
        const allMovieIds = new Set();
        const movies = movieResults.results.slice(0, 15);
        if (directorIds.size > 0) {
            for (const directorId of Array.from(directorIds).slice(0, 3)){
                try {
                    const directorMoviesResponse = await fetch(`${TMDB_BASE_URL}/person/${directorId}/movie_credits?api_key=${TMDB_API_KEY}`);
                    if (directorMoviesResponse.ok) {
                        const directorMovies = await directorMoviesResponse.json();
                        const directedMovies = directorMovies.crew?.filter((credit)=>credit.job === "Director").slice(0, 10) || [];
                        directedMovies.forEach((credit)=>{
                            if (credit.id) {
                                allMovieIds.add(credit.id);
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error fetching director movies:", e);
                }
            }
        }
        for (const movie of movies){
            allMovieIds.add(movie.id);
        }
        const movieDetailsPromises = Array.from(allMovieIds).slice(0, 20).map(async (movieId)=>{
            try {
                const detailResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
                if (detailResponse.ok) {
                    return await detailResponse.json();
                }
            } catch (e) {
                console.error(`Error fetching movie ${movieId}:`, e);
            }
            return null;
        });
        const movieDetails = (await Promise.all(movieDetailsPromises)).filter((m)=>m !== null);
        const results = movieDetails.map((movie)=>{
            const director = movie.credits?.crew?.find((person)=>person.job === "Director");
            return {
                id: movie.id,
                title: movie.original_title || movie.title,
                year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                rating: movie.vote_average || 0,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg",
                director: director?.name || undefined
            };
        });
        return Response.json({
            results: results.slice(0, 20)
        });
    } catch (error) {
        console.error("TMDB API Error:", error);
        return Response.json({
            results: [],
            error: error instanceof Error ? error.message : "Error al buscar películas en TMDB"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2d9321b0._.js.map