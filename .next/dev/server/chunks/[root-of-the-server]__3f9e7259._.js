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
"[project]/app/api/movies/recommended/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    const type = searchParams.get("type") || "popular";
    if (!TMDB_API_KEY) {
        return Response.json({
            results: [],
            error: "TMDB_API_KEY no está configurada"
        }, {
            status: 400
        });
    }
    try {
        let url = "";
        switch(type){
            case "popular":
                url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
                break;
            case "top_rated":
                url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`;
                break;
            case "now_playing":
                url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`;
                break;
            case "upcoming":
                url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`;
                break;
            case "random":
                const randomPage = Math.floor(Math.random() * 10) + 1;
                url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`;
                break;
            default:
                url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("TMDB API request failed");
        }
        const data = await response.json();
        const movies = data.results.slice(0, 20).map((movie)=>({
                id: movie.id,
                title: movie.original_title || movie.title,
                year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                rating: movie.vote_average || 0,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg",
                overview: movie.overview || ""
            }));
        return Response.json({
            results: movies,
            type
        });
    } catch (error) {
        console.error("Error fetching recommended movies:", error);
        return Response.json({
            results: [],
            error: "Failed to fetch recommended movies"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3f9e7259._.js.map