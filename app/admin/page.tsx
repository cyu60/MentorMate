'use client'

import { useState, useEffect } from 'react'
import { AdminLogin } from '@/components/AdminLogin'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn')
    if (adminLoggedIn === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      {isLoggedIn ? (
        <AdminDashboard />
      ) : (
        <div className="max-w-md mx-auto">
          <AdminLogin onLogin={() => setIsLoggedIn(true)} />
        </div>
      )}
    </div>
  )
}

