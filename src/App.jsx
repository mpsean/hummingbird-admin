import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import { authStore, adminApi } from './api/adminClient'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verify = async () => {
      if (!authStore.getKey()) { setChecking(false); return }
      try {
        await adminApi.verify()
        setAuthed(true)
      } catch {
        authStore.clear()
      } finally {
        setChecking(false)
      }
    }
    verify()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-pulse">🐦</div>
      </div>
    )
  }

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="bg-brand-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span>🐦</span> Hummingbird <span className="text-brand-300 font-normal text-sm">Admin</span>
          </div>
          <button
            className="text-brand-200 hover:text-white text-sm"
            onClick={() => { authStore.clear(); setAuthed(false) }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Tenants />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
