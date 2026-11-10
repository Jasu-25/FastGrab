import { useState } from 'react'

/**
 * Minimal form state hook.
 * Handles text, select, checkbox and file inputs by their `name` attribute,
 * and clears a field's error as soon as the user edits it.
 */
export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target
    let next = value
    if (type === 'checkbox') next = checked
    else if (type === 'file') next = files?.[0] ?? null

    setValues((prev) => ({ ...prev, [name]: next }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  return { values, setValues, errors, setErrors, handleChange }
}
