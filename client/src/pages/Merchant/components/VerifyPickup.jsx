import { useState } from 'react'
import { CircleCheck, CircleX, QrCode, ScanLine } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { formatPrice } from '../../../utils/format.js'
import { CustomerAvatar, Modal } from './ui.jsx'

/**
 * Verify a pickup before handing the bag over. Staff scan the customer's QR
 * (a USB/Bluetooth scanner types the code into the field) or type the pickup
 * code / order ID. If `order` is given, the code must match that order.
 */
function VerifyPickup({ order: expected, onClose }) {
  const { findByCode, handOver } = useMerchant()
  const [code, setCode] = useState('')
  const [match, setMatch] = useState(null)
  const [error, setError] = useState('')

  const verify = (e) => {
    e.preventDefault()
    const found = findByCode(code)
    if (!found) return setError('No order matches that code. Check the code or try the order ID.')
    if (expected && found.id !== expected.id) return setError(`That code belongs to #${found.id}, not #${expected.id}.`)
    if (found.status === 'picked_up') return setError(`#${found.id} was already collected.`)
    if (found.status !== 'ready') return setError(`#${found.id} isn’t packed yet.`)
    setError('')
    setMatch(found)
  }

  const confirm = () => {
    handOver(match.id)
    onClose()
  }

  return (
    <Modal
      title={expected ? `Hand over #${expected.id}` : 'Scan pickup QR'}
      onClose={onClose}
      footer={
        match ? (
          <button type="button" className="btn btn--accent btn--block" onClick={confirm}>
            <CircleCheck size={18} /> Confirm hand-over
            {match.dueAtPickup > 0 && ` · collect ${formatPrice(match.dueAtPickup)}`}
          </button>
        ) : (
          <button type="submit" form="verify-form" className="btn btn--primary btn--block" disabled={!code.trim()}>
            <ScanLine size={18} /> Verify code
          </button>
        )
      }
    >
      {!match ? (
        <form id="verify-form" onSubmit={verify}>
          <div className="verify-scan">
            <QrCode size={46} />
            <p>Scan the customer’s QR with your scanner, or type the pickup code or order ID.</p>
          </div>
          <label className="field__label" htmlFor="pickup-code">Pickup code or order ID</label>
          <input
            id="pickup-code"
            className={`input input--filled verify-input${error ? ' input--error' : ''}`}
            placeholder={expected ? expected.pickupCode : 'e.g. 8821-SQ or FG-8821'}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
            autoComplete="off"
          />
          {error && (
            <p className="field__error verify-error">
              <CircleX size={14} /> {error}
            </p>
          )}
          {expected && <p className="verify-hint">Demo tip: this order’s code is <strong>{expected.pickupCode}</strong>.</p>}
        </form>
      ) : (
        <div className="verify-ok">
          <span className="verify-ok__icon"><CircleCheck size={32} /></span>
          <h3>Code verified</h3>
          <div className="verify-ok__card">
            <CustomerAvatar customer={match.customer} size={40} />
            <div>
              <strong>{match.customer.name}</strong>
              <small>
                #{match.id} · {match.items.reduce((n, i) => n + i.qty, 0)} items · Shelf {match.shelf}
              </small>
            </div>
          </div>
          <p className={match.dueAtPickup ? 'verify-due' : 'verify-paid'}>
            {match.dueAtPickup ? `Collect ${formatPrice(match.dueAtPickup)} at the counter` : 'Paid in full online'}
          </p>
        </div>
      )}
    </Modal>
  )
}

export default VerifyPickup
