"use client"

import { useState, useEffect, useRef } from "react"
import { MoviesHeader } from "@/components/movies-header"
import { MovieDashboard } from "@/components/movie-dashboard"
import { AuthForm } from "@/components/auth-form"
import { MovieLoader } from "@/components/movie-loader"
import { Footer } from "@/components/footer"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isTransitioningRef = useRef(false)

  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  useEffect(() => {
    const checkAuth = () => {
      if (isTransitioningRef.current) {
        console.log("🔍 [Home] checkAuth - saltando porque isTransitioning es true")
        return
      }
      
      const token = localStorage.getItem("authToken")
      const hasToken = !!token
      setIsAuthenticated((prev) => {
        if (hasToken !== prev) {
          console.log("🔍 [Home] checkAuth - token:", token ? "existe" : "no existe", "cambiando isAuthenticated de", prev, "a", hasToken)
          return hasToken
        }
        return prev
      })
    }
    
    console.log("🔍 [Home] useEffect inicial - verificando auth")
    checkAuth()
    setLoading(false)
    
    const handleStorageChange = (e: StorageEvent) => {
      console.log("🔍 [Home] StorageEvent detectado:", e.key)
      if (e.key === "authToken") {
        checkAuth()
      }
    }
    
    const handleCustomStorage = () => {
      console.log("🔍 [Home] localStorageChange event detectado")
      checkAuth()
    }
    
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("localStorageChange", handleCustomStorage)
    
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorageChange", handleCustomStorage)
      clearInterval(interval)
    }
  }, [])

  const handleAuthSuccess = (token: string, user: { id: number; username: string }) => {
    console.log("✅ [Home] handleAuthSuccess llamado con token:", token.substring(0, 20) + "...", "user:", user)
    console.log("✅ [Home] Estado actual - isAuthenticated:", isAuthenticated, "isTransitioning:", isTransitioning)
    
    const tokenInStorage = localStorage.getItem("authToken")
    console.log("✅ [Home] Token en localStorage:", tokenInStorage ? "existe" : "no existe")
    
    if (!tokenInStorage) {
      console.error("❌ [Home] ERROR: Token no está en localStorage después de guardarlo")
      return
    }
    
    setIsTransitioning(true)
    isTransitioningRef.current = true
    console.log("✅ [Home] isTransitioning establecido a true")
    
    setTimeout(() => {
      const tokenCheck = localStorage.getItem("authToken")
      console.log("✅ [Home] Timeout completado - verificando token:", tokenCheck ? "existe" : "no existe")
      
      if (tokenCheck) {
        console.log("✅ [Home] Token existe, estableciendo isAuthenticated a true")
        setIsAuthenticated(true)
        isTransitioningRef.current = false
        setIsTransitioning(false)
        setLoading(false)
        console.log("✅ [Home] Estados actualizados - isAuthenticated: true, isTransitioning: false")
      } else {
        console.error("❌ [Home] ERROR: Token desapareció del localStorage durante la transición")
        setIsTransitioning(false)
        isTransitioningRef.current = false
      }
    }, 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    setIsAuthenticated(false)
  }


  console.log("🎬 [Home] Render - loading:", loading, "isTransitioning:", isTransitioning, "isAuthenticated:", isAuthenticated)

  if (loading) {
    console.log("🎬 [Home] Renderizando: Loading screen")
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (isTransitioning) {
    console.log("🎬 [Home] Renderizando: MovieLoader (transición)")
    return <MovieLoader />
  }

  if (!isAuthenticated) {
    console.log("🎬 [Home] Renderizando: AuthForm (no autenticado)")
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(251,191,36,0.1),transparent_50%)]"></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-4 gap-4 p-4 opacity-[0.03]">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20"></div>
          ))}
        </div>
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl shadow-lg shadow-primary/20">
                🎬
              </div>
            </div>
            <h1 className="mb-3 text-5xl font-bold text-foreground">
              Movie Points Tracker
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your movies and earn points
            </p>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </main>
    )
  }

  console.log("🎬 [Home] Renderizando: Dashboard (autenticado)")
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MoviesHeader onLogout={handleLogout} />
      <div className="flex-1">
        <MovieDashboard />
      </div>
      <Footer />
    </main>
  )
}
