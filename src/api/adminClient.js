import axios from 'axios'

const ADMIN_KEY_STORAGE = 'hb_admin_key'

const api = axios.create({ baseURL: '/api/admin' })

// Inject admin key on every request
api.interceptors.request.use(config => {
  const key = localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  config.headers['X-Admin-Key'] = key
  return config
})

// Expose key helpers
export const authStore = {
  getKey: () => localStorage.getItem(ADMIN_KEY_STORAGE) || '',
  setKey: (k) => localStorage.setItem(ADMIN_KEY_STORAGE, k),
  clear: () => localStorage.removeItem(ADMIN_KEY_STORAGE),
}

// ── Tenants ───────────────────────────────────────────────────────────────────
export const adminApi = {
  // Verify key works
  verify: () => api.get('/tenants').then(r => r.data),

  // Tenant CRUD
  getTenants: () => api.get('/tenants').then(r => r.data),
  getTenant: (id) => api.get(`/tenants/${id}`).then(r => r.data),
  createTenant: (data) => api.post('/tenants', data).then(r => r.data),
  setActive: (id, isActive) => api.patch(`/tenants/${id}/active`, { isActive }).then(r => r.data),

  // Config
  getConfig: (id) => api.get(`/tenants/${id}/config`).then(r => r.data),
  setConfig: (id, key, value) => api.put(`/tenants/${id}/config/${key}`, { value }).then(r => r.data),

  // Stats
  getStats: (id) => api.get(`/tenants/${id}/stats`).then(r => r.data),
}

export default api
