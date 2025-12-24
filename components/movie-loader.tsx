"use client"

export function MovieLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="mb-8 inline-block animate-bounce text-8xl">
          🎬
        </div>
        <div className="space-y-4">
          <div className="relative h-2 w-64 overflow-hidden rounded-full bg-white/20 mx-auto">
            <div 
              className="absolute h-full w-1/3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
              style={{
                animation: 'loading 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
          <p className="text-xl font-semibold text-white">Loading your movies...</p>
        </div>
      </div>
    </div>
  )
}

