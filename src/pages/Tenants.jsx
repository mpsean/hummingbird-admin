import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../api/adminClient'

const EMPTY_FORM = { name: '', subdomain: '', serviceChargeVersion: 'A' }

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [provisioning, setProvisioning] = useState(false)

  const fetchTenants = async () => {
    setLoading(true)
    try {
      setTenants(await adminApi.getTenants())
    } catch {
      toast.error('Failed to load tenants.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTenants() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setProvisioning(true)
    try {
      const t = await adminApi.createTenant(form)
      toast.success(`Tenant "${t.name}" provisioned at ${t.subdomain}.hmmbird.xyz`)
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchTenants()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Provisioning failed.')
    } finally {
      setProvisioning(false)
    }
  }

  const toggleActive = async (tenant) => {
    try {
      await adminApi.setActive(tenant.id, !tenant.isActive)
      toast.success(`Tenant "${tenant.name}" ${tenant.isActive ? 'deactivated' : 'activated'}.`)
      fetchTenants()
    } catch {
      toast.error('Failed to update tenant status.')
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ICE PROJECT</h1>
          <p className="text-slate-500 text-sm">{tenants.length} workspace{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Tenant'}
        </button>
      </div>

      {/* Provision form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">Provision New Tenant</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input className="input" value={form.name} onChange={set('name')}
                  placeholder="The Grand Hotel" required />
              </div>
              <div>
                <label className="label">Subdomain</label>
                <div className="flex items-center gap-1">
                  <input className="input" value={form.subdomain} onChange={set('subdomain')}
                    placeholder="grandhotel" pattern="[a-z0-9\-]+" required />
                  <span className="text-slate-400 text-sm whitespace-nowrap">.hmmbird.xyz</span>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Service Charge Version</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'A', title: 'Version A — Fix-rate', desc: 'Equal split per employee in position' },
                  { v: 'B', title: 'Version B — Workday-rate', desc: 'Split proportional to days worked' },
                ].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => setForm(f => ({ ...f, serviceChargeVersion: opt.v }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.serviceChargeVersion === opt.v
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <div className={`font-semibold text-sm ${form.serviceChargeVersion === opt.v ? 'text-brand-700' : 'text-slate-700'}`}>
                      {opt.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={provisioning}>
                {provisioning ? '⚙️ Provisioning…' : '🚀 Provision Tenant'}
              </button>
            </div>
          </form>
          {provisioning && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              Creating database and running migrations…
            </p>
          )}
        </div>
      )}

      {/* Tenants table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : tenants.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-slate-500">No tenants yet. Create your first workspace.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tenant', 'Subdomain', 'Database', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50 transition-colors ${!t.isActive ? 'opacity-50' : ''}`}>
                  <td className="td font-medium">{t.name}</td>
                  <td className="td">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {t.subdomain}.hmmbird.xyz
                    </span>
                  </td>
                  <td className="td font-mono text-xs text-slate-400">{t.databaseName}</td>
                  <td className="td">
                    <span className={t.isActive ? 'badge-green' : 'badge-red'}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="td text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="td">
                    <div className="flex gap-3">
                      <Link to={`/tenants/${t.id}`}
                        className="text-brand-600 hover:text-brand-800 text-sm font-medium">
                        Manage
                      </Link>
                      <button
                        onClick={() => toggleActive(t)}
                        className={`text-sm font-medium ${t.isActive ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'}`}>
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
