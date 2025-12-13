export function MoviesHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="text-lg font-bold">🎬</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Movie Points Tracker</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold text-primary">1,250</p>
          </div>
        </div>
      </div>
    </header>
  )
}
