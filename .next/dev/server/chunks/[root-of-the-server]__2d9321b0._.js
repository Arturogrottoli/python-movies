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
    try {
        if (TMDB_API_KEY) {
            const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=es-ES`);
            if (!response.ok) {
                throw new Error("TMDB API request failed");
            }
            const data = await response.json();
            const results = data.results.slice(0, 20).map((movie)=>({
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                    rating: movie.vote_average || 0,
                    poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg"
                }));
            return Response.json({
                results
            });
        } else {
            const mockMovies = [
                {
                    id: 1,
                    title: "Oppenheimer",
                    year: 2023,
                    rating: 8.5,
                    poster: "/oppenheimer.jpg"
                },
                {
                    id: 2,
                    title: "The Killers of the Flower Moon",
                    year: 2023,
                    rating: 8.0,
                    poster: "/killers-flower-moon.jpg"
                },
                {
                    id: 3,
                    title: "Dune: Part Two",
                    year: 2024,
                    rating: 8.3,
                    poster: "/dune-part-two.jpg"
                },
                {
                    id: 4,
                    title: "Inception",
                    year: 2010,
                    rating: 8.8,
                    poster: "/placeholder.svg"
                },
                {
                    id: 5,
                    title: "Interstellar",
                    year: 2014,
                    rating: 8.7,
                    poster: "/placeholder.svg"
                }
            ];
            const results = mockMovies.filter((movie)=>movie.title.toLowerCase().includes(query.toLowerCase()));
            return Response.json({
                results
            });
        }
    } catch (error) {
        console.error("TMDB API Error:", error);
        return Response.json({
            results: [],
            error: "Search failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2d9321b0._.js.map