import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../api/adminClient'

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TenantDetail() {
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState(null)
  const [editVersion, setEditVersion] = useState(null)

  const fetchTenant = async () => {
    setLoading(true)
    try {
      setTenant(await adminApi.getTenant(id))
    } catch {
      toast.error('Failed to load tenant.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTenant() }, [id])

  const saveConfig = async (key, value) => {
    setSavingKey(key)
    try {
      await adminApi.setConfig(id, key, value)
      toast.success(`${key} updated.`)
      fetchTenant()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSavingKey(null)
      setEditVersion(null)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Loading…</div>
  if (!tenant) return <div className="p-8 text-center text-slate-500">Tenant not found.</div>

  const { stats, config } = tenant

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Tenants</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{tenant.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl">🏢</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-sm text-slate-500">{tenant.subdomain}.hmmbird.xyz</span>
            <span className={tenant.isActive ? 'badge-green' : 'badge-red'}>
              {tenant.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Workspace Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active Employees', value: stats?.activeEmployees ?? '—' },
                { label: 'Positions', value: stats?.totalPositions ?? '—' },
                { label: 'Attendance Months', value: stats?.attendanceMonths ?? '—' },
                { label: 'Payroll Months', value: stats?.payrollMonths ?? '—' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {stats?.lastPayrollMonth && (
              <p className="text-xs text-slate-400 mt-3">
                Last payroll: <strong className="text-slate-600">{stats.lastPayrollMonth}</strong>
              </p>
            )}
          </div>

          {/* Raw config */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">All Configuration Keys</h2>
            <div className="divide-y divide-slate-100">
              {config && Object.entries(config).map(([k, v]) => (
                <div key={k} className="py-2 flex items-center gap-3 text-sm">
                  <span className="font-mono text-slate-500 w-48 flex-shrink-0">{k}</span>
                  <span className="font-medium text-slate-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Config editor */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Service Charge Version</h2>
            <div className="space-y-2">
              {['A', 'B'].map(v => {
                const current = config?.ServiceChargeVersion === v
                return (
                  <button key={v} type="button"
                    onClick={() => setEditVersion(editVersion === v ? null : v)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      current ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <div className={`font-semibold text-sm ${current ? 'text-brand-700' : 'text-slate-700'}`}>
                      Version {v} {current && '✓'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {v === 'A' ? 'Fix-rate per employee' : 'Workday-rate proportional'}
                    </div>
                  </button>
                )
              })}
            </div>
            {editVersion && editVersion !== config?.ServiceChargeVersion && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 mb-2">
                  Change to Version {editVersion}? Future payrolls will use the new model.
                </p>
                <div className="flex gap-2">
                  <button className="btn-primary text-xs py-1"
                    disabled={savingKey === 'ServiceChargeVersion'}
                    onClick={() => saveConfig('ServiceChargeVersion', editVersion)}>
                    {savingKey === 'ServiceChargeVersion' ? 'Saving…' : 'Confirm'}
                  </button>
                  <button className="btn-secondary text-xs py-1" onClick={() => setEditVersion(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DB info */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Database</h2>
            <div className="text-xs space-y-1">
              <div className="font-mono bg-slate-50 rounded px-2 py-1.5 text-slate-600 break-all">
                {tenant.databaseName}
              </div>
              <p className="text-slate-400">Created {new Date(tenant.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
