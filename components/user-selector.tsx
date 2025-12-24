"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface User {
  id: number
  name: string
  created_at: string
}

interface UserSelectorProps {
  currentUserId: number | null
  onUserChange: (userId: number) => void
}

export function UserSelector({ currentUserId, onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([])
  const [newUserName, setNewUserName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewUserName("")
        setIsDialogOpen(false)
        await fetchUsers()
        onUserChange(data.user_id)
        localStorage.setItem("currentUserId", data.user_id.toString())
      }
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentUser = users.find((u) => u.id === currentUserId)

  return (
    <div className="flex items-center gap-4">
      <select
        value={currentUserId || ""}
        onChange={(e) => {
          const userId = parseInt(e.target.value)
          onUserChange(userId)
          localStorage.setItem("currentUserId", userId.toString())
        }}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Seleccionar usuario...</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            + Nuevo Usuario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Ingresa un nombre para el nuevo usuario</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Nombre del usuario"
              onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
            />
            <Button onClick={handleCreateUser} disabled={loading || !newUserName.trim()}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

