import { useCallback, useMemo, useRef, useState } from 'react'
import { PlatformContext } from './platformContext.js'
import usePersistentState from '../hooks/usePersistentState.js'
import {
  DEFAULT_ADMINS,
  DEMO_ADMIN_PASSWORD,
  buildApplications,
  buildOfferRequests,
  buildShops,
  buildTransactions,
} from '../data/platformData.js'
import { isoDate } from '../utils/format.js'

const SESSION_KEY = 'fg.admin.session'

function readSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function PlatformProvider({ children }) {
  const [shops, setShops] = useState(buildShops)
  const [transactions, setTransactions] = useState(() => buildTransactions(shops))
  const [applications, setApplications] = useState(buildApplications)
  const [offerRequests, setOfferRequests] = useState(buildOfferRequests)
  const [admins, setAdmins] = usePersistentState('fg.admins', DEFAULT_ADMINS)
  const [sessionId, setSessionId] = useState(readSession)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const toast = useCallback((message, tone = 'success') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const value = useMemo(() => {
    const currentAdmin = admins.find((a) => a.id === sessionId && a.status === 'active') ?? null

    // ----- Admin session (demo only, see platformData.js) -----
    const signIn = (email, password) => {
      const admin = admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
      if (!admin || password !== DEMO_ADMIN_PASSWORD) return { ok: false, error: 'Incorrect email or password.' }
      if (admin.status !== 'active') return { ok: false, error: 'This admin account is deactivated.' }
      try {
        window.sessionStorage.setItem(SESSION_KEY, admin.id)
      } catch {
        // session storage blocked: stay signed in for this tab only
      }
      setSessionId(admin.id)
      setAdmins((list) => list.map((a) => (a.id === admin.id ? { ...a, lastActive: new Date().toISOString() } : a)))
      return { ok: true }
    }
    const signOut = () => {
      try {
        window.sessionStorage.removeItem(SESSION_KEY)
      } catch {
        // ignore
      }
      setSessionId(null)
    }

    // ----- Shops -----
    const updateShop = (id, patch) => setShops((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    const setShopStatus = (id, status) => {
      updateShop(id, { status })
      toast(status === 'suspended' ? 'Shop suspended. Customers can’t order from it.' : 'Shop reactivated.', status === 'suspended' ? 'warn' : 'success')
    }
    const setPlan = (id, plan) => {
      updateShop(id, { plan })
      toast('Commission plan updated.')
    }

    // ----- Applications -----
    const approveApplication = (id) => {
      const app = applications.find((a) => a.id === id)
      setApplications((list) => list.filter((a) => a.id !== id))
      toast(`${app.name} approved. Welcome email sent to ${app.owner}.`)
    }
    const rejectApplication = (id) => {
      const app = applications.find((a) => a.id === id)
      setApplications((list) => list.filter((a) => a.id !== id))
      toast(`${app.name} rejected.`, 'warn')
    }
    const requestInfo = (id) => {
      setApplications((list) => list.map((a) => (a.id === id ? { ...a, status: 'info_sent' } : a)))
      toast('Request for more information sent.')
    }
    const decideOffer = (id, approved) => {
      setOfferRequests((list) => list.filter((o) => o.id !== id))
      toast(approved ? 'Offer approved and now live for customers.' : 'Offer promotion rejected and refunded.', approved ? 'success' : 'warn')
    }

    // ----- Commission payments -----
    const payCommission = (shopId, method) => {
      const due = transactions.filter((t) => t.shopId === shopId && t.status === 'pending')
      const total = due.reduce((n, t) => n + t.commission, 0)
      setTransactions((list) =>
        list.map((t) => (t.shopId === shopId && t.status === 'pending' ? { ...t, status: 'paid', method, date: isoDate() } : t)),
      )
      return total
    }

    // ----- Admin management -----
    const inviteAdmin = ({ name, email, role }) => {
      if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'An admin with this email already exists.' }
      setAdmins((list) => [
        ...list,
        { id: `adm-${list.length + 1}-${email.split('@')[0]}`, name, email, role, status: 'invited', lastActive: null, color: '#e9d5ff' },
      ])
      toast(`Invite sent to ${email}.`)
      return { ok: true }
    }
    const updateAdmin = (id, patch) => setAdmins((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    const removeAdmin = (id) => {
      const admin = admins.find((a) => a.id === id)
      setAdmins((list) => list.filter((a) => a.id !== id))
      toast(`${admin.name} removed from admins.`, 'warn')
    }

    return {
      shops,
      setShopStatus,
      setPlan,
      transactions,
      payCommission,
      applications,
      approveApplication,
      rejectApplication,
      requestInfo,
      offerRequests,
      decideOffer,
      admins,
      currentAdmin,
      signIn,
      signOut,
      inviteAdmin,
      updateAdmin,
      removeAdmin,
      toasts,
      toast,
    }
  }, [shops, transactions, applications, offerRequests, admins, setAdmins, sessionId, toasts, toast])

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export default PlatformProvider
