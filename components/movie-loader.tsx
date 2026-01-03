"use client"

export function MovieLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(251,191,36,0.1),transparent_50%)]"></div>
      </div>
      <div className="relative z-10 text-center">
        <div className="mb-8 inline-flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-5xl shadow-lg shadow-primary/30 animate-bounce">
            🎬
          </div>
        </div>
        <div className="space-y-4">
          <div className="relative h-2 w-64 overflow-hidden rounded-full bg-muted mx-auto">
            <div 
              className="absolute h-full w-1/3 bg-gradient-to-r from-primary via-secondary to-primary"
              style={{
                animation: 'loading 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
          <p className="text-xl font-semibold text-foreground">Loading your movies...</p>
        </div>
      </div>
    </div>
  )
}

