import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { inputClass } from '../utils/inputClass.js'

/** Password input with a show/hide toggle. */
function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  invalid = false,
  showIcon = true,
  filled = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`input-icon${showIcon ? '' : ' input-icon--no-lead'}`}>
      {showIcon && <Lock className="input-icon__icon" size={18} aria-hidden="true" />}
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={inputClass(invalid, filled ? 'input--filled' : '')}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="input-icon__action"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput
