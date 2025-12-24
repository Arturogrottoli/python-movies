"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface AuthFormProps {
  onAuthSuccess: (token: string, user: { id: number; username: string }) => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const url = `${API_BASE_URL}${endpoint}`
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (!response.ok) {
        let errorMessage = "Authentication failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        toast.error(errorMessage)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log("🔐 [AuthForm] Respuesta del servidor:", { hasToken: !!data.access_token, hasUser: !!data.user })
      
      if (!data.access_token) {
        console.error("❌ [AuthForm] No access_token en la respuesta")
        toast.error("Invalid response from server")
        setLoading(false)
        return
      }

      console.log("🔐 [AuthForm] Guardando token en localStorage")
      localStorage.setItem("authToken", data.access_token)
      localStorage.setItem("currentUser", JSON.stringify(data.user))
      console.log("🔐 [AuthForm] Token guardado. Verificando:", localStorage.getItem("authToken") ? "OK" : "ERROR")
      
      toast.success(isLogin ? "Login successful!" : "User created successfully!")
      
      console.log("🔐 [AuthForm] Llamando onAuthSuccess")
      onAuthSuccess(data.access_token, data.user)
      console.log("🔐 [AuthForm] onAuthSuccess llamado")
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Error connecting to server. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-2xl">
      <h2 className="mb-6 text-3xl font-bold text-center text-white">
        {isLogin ? "Sign In" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium text-white">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setUsername("")
            setPassword("")
          }}
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  )
}

