/**
 * Label + control + error/hint wrapper used by every form.
 * `action` renders on the right of the label (e.g. "Forgot Password?").
 */
export function Field({ label, htmlFor, error, hint, action, className = '', children }) {
  return (
    <div className={`field ${className}`.trim()}>
      {(label || action) && (
        <div className="field__label-row">
          {label && (
            <label htmlFor={htmlFor} className="field__label">
              {label}
            </label>
          )}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  )
}

/** Wraps an <input> and shows a leading icon inside it. */
export function InputWithIcon({ icon: Icon, children }) {
  return (
    <div className="input-icon">
      <Icon className="input-icon__icon" size={18} aria-hidden="true" />
      {children}
    </div>
  )
}

