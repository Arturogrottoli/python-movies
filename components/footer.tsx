"use client"

export function Footer() {
  return (
    <footer className="border-t border-orange-500/20 bg-gradient-to-r from-orange-950/95 via-orange-900/95 to-orange-950/95 backdrop-blur-xl shadow-xl shadow-orange-900/20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <p className="text-sm text-orange-300/80 font-medium">
            Este sitio fue realizado por{" "}
            <span className="font-bold bg-gradient-to-r from-orange-200 to-orange-100 bg-clip-text text-transparent">
              Arturo Grottoli
            </span>
            {" "}®
          </p>
        </div>
      </div>
    </footer>
  )
}

