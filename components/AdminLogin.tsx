'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would verify this password against a secure backend
    if (password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true')
      onLogin()
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard.",
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter admin password"
        required
      />
      <Button type="submit" className="w-full">Login</Button>
    </form>
  )
}

