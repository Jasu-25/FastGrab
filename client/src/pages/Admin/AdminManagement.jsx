import { useState } from 'react'
import { Lock, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { ADMIN_ROLES } from '../../data/platformData.js'
import { initialsOf } from '../../data/merchantData.js'
import { Field } from '../../components/FormField.jsx'
import { inputClass } from '../../utils/inputClass.js'
import { isEmail, isRequired } from '../../utils/validators.js'
import { timeAgo } from '../../utils/format.js'
import { Modal } from '../Merchant/components/ui.jsx'
import './Admin.css'

function InviteModal({ onClose }) {
  const { inviteAdmin } = usePlatform()
  const [form, setForm] = useState({ name: '', email: '', role: 'admin' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!isRequired(form.name)) er.name = 'Enter their full name.'
    if (!isEmail(form.email)) er.email = 'Enter a valid work email.'
    setErrors(er)
    if (Object.keys(er).length) return
    // TODO: POST /api/admin/admins/invite. The server emails a one-time sign-up link.
    const res = inviteAdmin({ name: form.name.trim(), email: form.email.trim(), role: form.role })
    if (!res.ok) return setErrors({ email: res.error })
    onClose()
  }

  return (
    <Modal
      title="Add a new admin"
      onClose={onClose}
      footer={<button type="submit" form="invite-form" className="btn btn--primary btn--block"><UserPlus size={17} /> Send invite</button>}
    >
      <form id="invite-form" onSubmit={submit} noValidate>
        <Field label="Full name" htmlFor="inv-name" error={errors.name}>
          <input id="inv-name" className={inputClass(errors.name, 'input--filled')} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Priya Menon" />
        </Field>
        <Field label="Work email" htmlFor="inv-email" error={errors.email}>
          <input id="inv-email" type="email" className={inputClass(errors.email, 'input--filled')} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@fastgrab.in" />
        </Field>
        <p className="field__label">Role</p>
        <div className="plan-options" role="radiogroup" aria-label="Role">
          {Object.entries(ADMIN_ROLES).map(([key, r]) => (
            <label key={key} className={`plan-option${form.role === key ? ' is-active' : ''}`}>
              <input type="radio" name="role" checked={form.role === key} onChange={() => set('role', key)} />
              <span><strong>{r.label}</strong><small>{r.can}</small></span>
            </label>
          ))}
        </div>
        <p className="plan-note">They’ll get an email to set their own password. You never see or share it.</p>
      </form>
    </Modal>
  )
}

function AdminManagement() {
  const { admins, currentAdmin, updateAdmin, removeAdmin, toast } = usePlatform()
  const [inviting, setInviting] = useState(false)
  const [now] = useState(() => Date.now())
  const isSuper = currentAdmin.role === 'super'
  const supers = admins.filter((a) => a.role === 'super' && a.status === 'active').length

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Admin Management</h1>
          <p className="m-sub">Who can access the FastGrab admin console</p>
        </div>
        {isSuper ? (
          <button type="button" className="btn btn--accent" onClick={() => setInviting(true)}><UserPlus size={18} /> Add new admin</button>
        ) : (
          <span className="am-locked"><Lock size={14} /> Only super admins can add or change admins</span>
        )}
      </div>

      <div className="am-roles">
        {Object.entries(ADMIN_ROLES).map(([key, r]) => (
          <div key={key} className="m-panel m-panel--pad am-role">
            <ShieldCheck size={20} />
            <strong>{r.label}</strong>
            <small>{r.can}</small>
            <span className="am-role__count">{admins.filter((a) => a.role === key).length} people</span>
          </div>
        ))}
      </div>

      <section className="m-panel a-table-panel">
        <div className="m-table-wrap">
          <table className="m-table">
            <thead><tr><th>Admin</th><th>Role</th><th>Status</th><th>Last active</th><th className="num">Actions</th></tr></thead>
            <tbody>
              {admins.map((a) => {
                const self = a.id === currentAdmin.id
                const lastSuper = a.role === 'super' && supers <= 1
                const canEdit = isSuper && !self
                return (
                  <tr key={a.id}>
                    <td>
                      <span className="a-user">
                        <span className="a-user__avatar" style={{ background: a.color }}>{initialsOf(a.name)}</span>
                        <span><strong>{a.name} {self && <em className="am-you">You</em>}</strong><small>{a.email}</small></span>
                      </span>
                    </td>
                    <td>
                      {canEdit ? (
                        <select
                          className="input input--filled a-select am-role-select"
                          value={a.role}
                          onChange={(e) => {
                            if (lastSuper && e.target.value !== 'super') return toast('Keep at least one active super admin.', 'warn')
                            updateAdmin(a.id, { role: e.target.value })
                            toast(`${a.name} is now ${ADMIN_ROLES[e.target.value].label}.`)
                          }}
                          aria-label={`Role for ${a.name}`}
                        >
                          {Object.entries(ADMIN_ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                        </select>
                      ) : (
                        <span className="m-pill m-pill--soft-green">{ADMIN_ROLES[a.role].label}</span>
                      )}
                    </td>
                    <td><span className={`a-status a-status--${a.status}`}>{a.status === 'invited' ? 'Invite sent' : a.status === 'active' ? 'Active' : 'Deactivated'}</span></td>
                    <td>{a.lastActive ? timeAgo(a.lastActive, now) : '—'}</td>
                    <td className="num">
                      {canEdit && (
                        <div className="am-actions">
                          {a.status === 'invited' && (
                            <button type="button" className="btn btn--outline m-btn-sm" onClick={() => toast(`Invite re-sent to ${a.email}.`)}>Resend</button>
                          )}
                          {a.status === 'active' && (
                            <button type="button" className="btn btn--outline m-btn-sm" disabled={lastSuper} onClick={() => { updateAdmin(a.id, { status: 'deactivated' }); toast(`${a.name} deactivated.`, 'warn') }}>Deactivate</button>
                          )}
                          {a.status === 'deactivated' && (
                            <button type="button" className="btn btn--outline m-btn-sm" onClick={() => { updateAdmin(a.id, { status: 'active' }); toast(`${a.name} reactivated.`) }}>Reactivate</button>
                          )}
                          <button type="button" className="am-remove" disabled={lastSuper} onClick={() => window.confirm(`Remove ${a.name} from admins?`) && removeAdmin(a.id)} aria-label={`Remove ${a.name}`}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {inviting && <InviteModal onClose={() => setInviting(false)} />}
    </>
  )
}

export default AdminManagement
