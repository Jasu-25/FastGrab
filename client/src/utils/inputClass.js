/** Builds the className for an input, adding the error style when needed. */
export function inputClass(hasError, extra = '') {
  return ['input', extra, hasError ? 'input--error' : ''].filter(Boolean).join(' ')
}
