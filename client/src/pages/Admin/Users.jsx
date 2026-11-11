import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { commissionFor } from '../../data/platformData.js'
import { initialsOf } from '../../data/merchantData.js'
import { formatRate } from '../../utils/commission.js'
import './Admin.css'

/** A shop owner pays commission when they're on a plan with a rate above 0% right now. */
const paysCommission = (s) => s.plan.type !== 'exempt' && commissionFor(s.plan, s.revenueMonth).rate > 0

function Users() {
  const { shops } = usePlatform()
  const navigate = useNavigate()
  const [tab, setTab] = useState('with')
  const [query, setQuery] = useState('')

  const withC = shops.filter(paysCommission)
  const withoutC = shops.filter((s) => !paysCommission(s))
  const q = query.trim().toLowerCase()
  const rows = (tab === 'with' ? withC : withoutC).filter(
    (s) => !q || s.owner.name.toLowerCase().includes(q) || s.owner.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
  )

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">User Management</h1>
          <p className="m-sub">Shop owners and their commission plans</p>
        </div>
        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search users</span>
          <input type="search" placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="m-seg a-tabs-lg" role="tablist" aria-label="Commission">
        <button type="button" role="tab" aria-selected={tab === 'with'} className={tab === 'with' ? 'is-active' : ''} onClick={() => setTab('with')}>
          With commission <span>{withC.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'without'} className={tab === 'without' ? 'is-active' : ''} onClick={() => setTab('without')}>
          Without commission <span>{withoutC.length}</span>
        </button>
      </div>
      {tab === 'without' && (
        <p className="a-note">Exempt shops, plus shops whose sales this month are still in the free ₹0–₹50k band.</p>
      )}

      <section className="m-panel a-table-panel">
        <div className="m-table-wrap">
          <table className="m-table">
            <thead><tr><th>User</th><th>Shop</th><th>Plan</th><th className="num">Current commission</th><th /></tr></thead>
            <tbody>
              {rows.map((s) => {
                const c = commissionFor(s.plan, s.revenueMonth)
                return (
                  <tr key={s.owner.id} className="is-link" onClick={() => navigate(`/admin/users/${s.owner.id}`)}>
                    <td>
                      <span className="a-user">
                        <span className="a-user__avatar" style={{ background: s.owner.color }}>{initialsOf(s.owner.name)}</span>
                        <span><strong>{s.owner.name}</strong><small>{s.owner.email}</small></span>
                      </span>
                    </td>
                    <td>{s.name}</td>
                    <td>{c.label}</td>
                    <td className="num">
                      <span className={`m-pill ${c.rate ? 'm-pill--soft-green' : 'm-pill--grey'}`}>{s.plan.type === 'exempt' ? 'Exempt' : formatRate(c.rate)}</span>
                    </td>
                    <td className="num">
                      <Link to={`/admin/users/${s.owner.id}`} className="link small a-view" onClick={(e) => e.stopPropagation()}>View <ChevronRight size={14} /></Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="m-empty">No users here.</p>}
        </div>
      </section>
    </>
  )
}

export default Users
