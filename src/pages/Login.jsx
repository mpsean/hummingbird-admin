import { useState } from 'react'
import toast from 'react-hot-toast'
import { authStore, adminApi } from '../api/adminClient'

export default function Login({ onLogin }) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    authStore.setKey(key.trim())
    try {
      await adminApi.verify()
      toast.success('Welcome, Admin.')
      onLogin()
    } catch (err) {
      authStore.clear()
      if (err.response?.status === 401) {
        toast.error('Invalid admin key.')
      } else {
        toast.error('Cannot reach API. Is it running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐦</div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Hummingbird HR</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Admin Key</label>
            <input
              className="input font-mono"
              type="password"
              placeholder="Enter admin key"
              value={key}
              onChange={e => setKey(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
